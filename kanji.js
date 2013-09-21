/* jshint newcap:false */
/* global Kanji:true, Class, console, jsface, setTimeout, document */

/**
 * Kanji web declarative component framework.
 *
 * Copyright (c) 2013 LinkedIn Corporation
 *
 * @author Tan Nhu, http://lnkd.in/tnhu
 * @license MIT
 * @dependency jsface, jsface.ready, jQuery, JSON || jQuery.parseJSON
 * @version 0.2.2
 */
Class(function() {
  var CLICK                = 'click',
      TOUCH_END            = 'touchend',                                                           // on mobile: 'click' is translated to 'touchend' (faster)

      // data attribute names
      DATA_COMPONENT       = 'data-com',
      DATA_CONFIG          = 'data-cfg',
      DATA_INSTANCE        = 'data-instance',                                                      // component instance id (value is auto generated)
      DATA_ACT             = 'data-act',

      // selectors
      SELECTOR_COMPONENT   = '[data-com]',                                                         // component selector
      SELECTOR_ACT         = '[data-act]',                                                         // action selector

      // delegable events (to document) (click and touchend are delegated specifically)
      DELEGABLE_EVENTS     = 'mousedown touchstart keydown',
      DELEGABLE_FLAGS      = { mousedown: 1, touchstart: 1, keydown: 1, click: 1, touchend: 1 },

      EMPTY                = '',

      // message prefix
      KANJI                = 'Kanji:',
      ERROR                = '[ERROR] ' + KANJI,

      // garbage collection settings
      GC_TIMEOUT           = 1500,                                                                 // checking routine (ms)
      GC_MAX_WORKING_TIME  =  250,                                                                 // duration GC is allowed work (ms), more than that, terminate itself

      // shortcuts
      functionOrNil        = jsface.functionOrNil,
      mapOrNil             = jsface.mapOrNil,
      $                    = jQuery,
      timeout              = setTimeout,
      slice                = [].slice,
      parseJSON            = (typeof JSON === 'object') && JSON.parse || $.parseJSON,

      // internal vars
      isDomReady           = 0,
      lazySelectorQueue    = [],                                                                   // lazy component selectors
      instanceAutoId       = 1,                                                                    // auto generated instance id
      actionAutoId         = 1,                                                                    // auto generated action id
      repository           = { instanceRefs: {} },                                                 // components and their instances reference repository { componentId: Component }
      actionFlag;                                                                                  // prevent 'click' handler from executing when 'touchend' handler already executed


  /**
   * Get config as JavaScript object if it's a valid JavaScript object, or as original string if it's not.
   * @param config config string as in data-cfg.
   * @return a valid JavaScript typed object, or the original string if it's not a JavaScript typed object.
   */
  function configAsObjectOrRaw(config) {
    config = config && config.replace(/'/g, '"');                                                  // pre-format the string, config should support single quote and unquoted keys. TODO: support unquoted keys, BUG: John's -> John"s

    try {
      config = config && parseJSON(config);
    } catch (error) {
      console.log(ERROR, 'config not well-formed', config);
      Kanji.notify('com:config-not-wellformed', config);
    }

    return config;
  }

  /**
   * Parse an action string (value of data-act attribute).
   * @param action action string. (I.e: "switchView|mouseenter,mouseout:preloadStylist")
   * @return declared action structure. (I.e: { click: "switchView", mouseenter: "preloadStylist", mouseout: "preloadStylist" })
   */
  function parseAction(action) {                                                                   // "click:switchView|mouseenter,mouseout:preloadStylist"
    var actions = {},
        tokens  = action && action.split('|'),                                                     // [ "click:switchView", "mouseenter,mouseout:preloadStylist" ]
        len     = tokens && tokens.length || 0,                                                    // 2
        token, tokenLen, actionSet, actionSetLen, event;

    while (len--) {
      token    = tokens[len].split(':');                                                           // [ "mouseenter,mouseout", "preloadStylist" ]
      tokenLen = token.length;                                                                     // 2

      if (0 < tokenLen && tokenLen < 3) {                                                          // 0 < 2 < 3
        if (token.length === 1) {                                                                  // in case of shortcut action: "switchView|mouseenter,mouseout:preloadStylist" > [ "switchView" ]
          token.unshift(CLICK);                                                                    // > [ "click" or "touchend",  "switchView" ]
        }

        actionSet    = token[0].split(',');                                                        // [ "mouseenter,mouseout" ] [ [ "mouseenter", "mouseout" ] ]
        actionSetLen = actionSet.length;

        while (actionSetLen--) {
          event = actionSet[actionSetLen];
          actions[event] = token[1];                                                               // actions.mouseenter = "preloadStylist"

          // mark non-delegable
          if ( !DELEGABLE_FLAGS[event]) {
            actions.nondelegable = true;
          }
        }
      } else {
        console.log(ERROR, 'unrecognized action', action);
      }
    }

    return actions;
  }

  /**
   * Lookup shared instance of a component. If there's no instance found, instantiate a new one.
   * @param component component class
   * @return instance info of the shared instance.
   */
  function lookupSharedInstance(Component) {
    var instanceRefs = repository.instanceRefs,
        instanceId, instanceInfo, instance;

    // look up in instanceRefs, if found then return
    for (instanceId in instanceRefs) {
      instanceInfo = instanceRefs[instanceId];
      instance     = instanceInfo.instance;

      if (instance instanceof Component) {
        return instanceRefs[instanceId];
      }
    }

    // not found, create a new one, put into instanceRefs, then return
    instance     = new Component();
    instanceId   = instanceAutoId++;
    instanceInfo = { instance: instance, instanceId: instanceId };

    // add instance info into instanceRefs
    instanceRefs[instanceId] = instanceInfo;

    return instanceInfo;
  }

  /**
   * Execute an action when an event happens.
   * @param e event.
   * @param $passedTarget optional target, if passed, use instead of e.target.
   * @param passdEvetnName optional event name, if passed, use in stead of e.type.
   */
  function actionExecutor(e, $passedTarget, passedEventName) {
    var $target      = $passedTarget ? $passedTarget : $(e.target),
        eventName    = passedEventName ? passedEventName : e.type,
        instanceRefs = repository.instanceRefs,
        instanceInfo, instanceId, instance, fnName, instanceFn,
        actionInfo, actionId;

    actionInfo = $target.attr(DATA_ACT);

    if (actionInfo) {                                                                              // action was initialized before
      actionInfo = actionInfo.split('/');                                                          // data-act="1/20"
      instanceId = actionInfo[0];                                                                  // "1" : instance id
      actionId   = actionInfo[1];                                                                  // "20": event handler mapping id

      instanceInfo = instanceRefs[instanceId];

      if ( !instanceInfo) {
        return initComponentFromEvent(e, eventName, false, instanceId);
      }

      instance     = instanceInfo.instance;
      fnName       = instanceInfo[actionId][eventName];
      instanceFn   = functionOrNil(instance[fnName]);

      if (fnName) {
        if (instanceFn) {
          return instanceFn.call(instance, e, $target);
        } else {
          console.log(ERROR, fnName, 'not implemented');
        }
      }
    }
  }

  /**
   * Map actions declared in a component to HTML elements inside an HTML container.
   * @param $container jQuery container.
   * @param instanceInfo information about the instance to handle the declaration.
   */
  function mapActionsToElements($container, instanceInfo) {
    var instance   = instanceInfo.instance,
        instanceId = instanceInfo.instanceId,
        actions    = instance.actions,
        selector, actionMapping, actionEvent, actionId,
        $element;

    for (selector in actions) {
      $element = (selector === 'self') ? $container : $container.find(selector);

      if ($element.length) {
        actionId = actionAutoId++;
        $element.attr('data-act', instanceId + '/' + actionId);
        actionMapping = {};

        for (actionEvent in actions[selector]) {
          actionMapping[actionEvent] = actions[selector][actionEvent];

          // bind non-delegable event to an internal function -> route to mapping later
          if ( !DELEGABLE_FLAGS[actionEvent]) {
            $element.on(actionEvent, actionExecutor);
          }
        }
        instanceInfo[actionId] = actionMapping;
      }
    }
  }

  /**
   * Update listeners when namespace is declared over an instance.
   * @param instance component instance
   * @param namespace component namespace
   */
  function updateListeners(instance, namespace) {
    var instanceListeners, eventId, listeners;

    if (namespace) {
      instance.namespace = namespace;

      // update instance.listeners if namespace is declared
      // instance.listeners[eventId] = instance.listeners[eventId + '/' + namespace]
      listeners         = instance.listeners;
      instanceListeners = {};

      for (eventId in listeners) {
        instanceListeners[eventId + '/' + namespace] = instanceListeners[eventId] = listeners[eventId];
      }
      instance.listeners = instanceListeners;
    }
  }

  /**
   * Merge actions and listeners of a component with its super classes.
   * @param Component component class
   */
  function mergeActionsAndListeners(Component, api) {
    var superp = Component.$superp,
        parent = Component.$super,
        proto  = Component.prototype,
        listeners, actions, protoActions, actionSelector, actionMapping, eventId;

    // parse actions and bind to Component.prototype
    actions = mapOrNil(api.actions);
    if (actions) {
      for (actionSelector in actions) {
        actions[actionSelector] = parseAction(actions[actionSelector]);

        // if nondelegable is found, add hasNondelegableEvents to clazz
        if (actions[actionSelector].nondelegable) {
          Component.hasNondelegableEvents = true;
          delete actions[actionSelector].nondelegable;
        }
      }
      proto.actions = actions;
    }

    // merge listeners and actions with parent class
    if (superp) {
      listeners    = superp.listeners;
      actions      = superp.actions;
      protoActions = proto.actions;

      // listeners
      for (eventId in listeners) {
        if ( !api.listeners[eventId]) {
          api.listeners[eventId] = listeners[eventId];
        }
      }

      // actions
      for (actionSelector in actions) {
        actionMapping = protoActions[actionSelector];
        if ( !actionMapping) {
          protoActions[actionSelector] = actions[actionSelector];
        } else {
          for (eventId in actions[actionSelector]) {
            if ( !actionMapping[eventId]) {
              actionMapping[eventId] = actions[actionSelector][eventId];
            }
          }
        }
      }
    }
  }

  /**
   * Initialize a component when an event happens over it.
   * @param e event.
   * @param translatedEventType optional translated event type, if passed, use instead of e.type.
   * @param isLazy if true then just initialize the component, don't relay any action.
   * @param reinitWithInstanceId true to ask Kanji to re-init the component.
   */
  function initComponentFromEvent(e, translatedEventType, isLazy, reinitWithInstanceId) {
    var $target      = translatedEventType ? $(e.target) : $(this),
        eventName    = translatedEventType || e.type,
        instanceRefs = repository.instanceRefs,
        instanceInfo, instance, instanceId, fnName, instanceFn,
        $container, dataComValue, componentId, Component,
        actionInfo, actionId, actionName, actionMapping,
        type, config, actions, selector, actionEvent,
        $element;

    // get event binding id, if any
    actionInfo = $target.attr(DATA_ACT);

    if ( !reinitWithInstanceId && actionInfo) {
      return actionExecutor(e, $target, eventName);
    } else {
      // get component container
      $container = $target.closest(SELECTOR_COMPONENT);

      if ($container.length) {
        instanceId = $container.attr(DATA_INSTANCE);

        // instanceId exists and actionsInfo = nil: eventName is not declared, skip processing
        if (instanceId && !reinitWithInstanceId) { return; }

        dataComValue = $container.attr(DATA_COMPONENT);
        componentId  = dataComValue.split('/')[0];                                                 // remove namespace
        Component    = repository[componentId];

        if ( !Component) {
          console.log(ERROR, 'Component not found', componentId);
          Kanji.notify('com:not-found', componentId, $container);
        } else {
          type   = Component.prototype.type;
          config = configAsObjectOrRaw($container.attr(DATA_CONFIG));

          switch (type) {
          case 'shared':
            instanceInfo = lookupSharedInstance(Component);
            instance     = instanceInfo.instance;
            instanceId   = instanceInfo.instanceId;
            break;

          default:
            instance     = new Component();
            instanceId   = reinitWithInstanceId || instanceAutoId++;
            instanceInfo = { instance: instance, instanceId: instanceId };

            //instanceRefs[instanceId] = instanceInfo;
            updateListeners(instance, dataComValue.substring(componentId.length + 1));
            break;
          }

          mapActionsToElements($container, instanceInfo);                                          // map actions to elements
          instanceRefs[instanceId] = instanceInfo;                                                 // mapActionsToElements updates instanceInfo, so update instanceRefs as well
          $container.attr(DATA_INSTANCE, instanceId);                                              // mark instance id on $container

          // remove temporary key in instanceInfo
          delete instanceInfo.instanceId;

          // invoke init()
          instance.init($container, config);

          // invoke render()
          instance.render($container);

          // relay the event
          if ( !isLazy) {
            return actionExecutor(e);
          }

        }
      }
    }
  }

  /**
   * Garbage collector.
   */
  function gc() {
    var instanceRefs = repository.instanceRefs,
        startTime    = +new Date(),
        instanceId, element;

    // look up in instanceRefs, if found then return
    for (instanceId in instanceRefs) {
      // zero is Kanji itself, let's skip the boss
      if (instanceId === '0') {
        continue;
      }

      element = $([ '[', DATA_INSTANCE, '=', instanceId, ']' ].join(EMPTY));

      if ( !element.length) {
        delete instanceRefs[instanceId];
      }

      // don't block UI while GC is working, ever
      if (+new Date() - startTime > GC_MAX_WORKING_TIME) {
        break;
      }
    }

    // auto-check after GC_TIMEOUT ms
    timeout(gc, GC_TIMEOUT);
  }

  return {
    $statics: {
      /**
       * Notify listeners of an event.
       * @param eventId event id.
       * @param any...  parameters.
       */
      notify: function() {
        var args          = slice.call(arguments),
            eventId       = args.shift(),
            instanceRefs  = repository.instanceRefs,
            instanceId, instance, listeners, event;

        // translate eventId to support namespace (for non-shared components only)
        eventId = (this.type === 'shared') ? eventId
                                           : (this.namespace ? [ eventId, '/', this.namespace ].join(EMPTY) : eventId);

        for (instanceId in instanceRefs) {
          instance  = instanceRefs[instanceId].instance || instanceRefs[instanceId];               // instanceRefs[instanceId] is Kanji

          if (instance) {
            listeners = instance.listeners;
            if (listeners[eventId]) {
              listeners[eventId].apply(instance, args);
            }
          }
        }

        // output eventId to console if debug is turned on
        if (Kanji.debug) {
          console.log(KANJI, eventId);
        }
      }
    },

    /**
     * Actions
     */
    actions: {},

    /**
     * Event listeners as pair of eventId: handler()
     */
    listeners: {},

    /**
     * init is called when component's attached DOM element is ready.
     * @param config configuration.
     * @param element jQuery attached component DOM object.
     */
    init: function(element, config) {},

    /**
     * Optional custom rendering after init().
     * @param element jQuery attached component DOM object.
     */
    render: function(element) {},

    /*
     * Ready handler: capture sub-class definitions, save in repository and do initialization if needed.
     */
    $ready: function(clazz, parent, api) {
      var componentId, componentSelector;

      if (this !== clazz) {
        componentId = api.id;

        if (componentId) {
          if ( !repository[componentId]) {
            repository[componentId] = clazz;
            componentSelector       = [ '[data-com="', componentId, '"],[data-com^="', componentId, '/"]' ].join(EMPTY);         // TODO benchmark this selector

            // merge actions and listeners
            mergeActionsAndListeners(clazz, api);

            // do initialize for declared lazy: false fragments if DOM is ready
            // otherwise, put component selector in queue for later initialization
            if (isDomReady) {
              $(componentSelector).each(function() {
                var th = $(this);

                if (clazz.prototype.lazy === false || clazz.hasNondelegableEvents) {
                  initComponentFromEvent({ target: th[0] }, CLICK, true);
                }
              });
            } else {
              lazySelectorQueue.push(componentSelector);
            }
          }
        } else {
          console.log(ERROR, 'id not found on', api);
        }
      }
    },

    /*
     * Class entry point.
     */
    main: function(clazz) {
      Kanji = clazz;

      // Kanji level listeners stored on index 0 of repository.instanceRefs
      repository = {
        instanceRefs: {
          0: {
            listeners: {
              /**
               * Send a 'com:init' notification to init/reinit a specific component.
               * @param container jQuery container object
               * @param forceReinit true to force a complete re-initialization
               */
              'com:init': function($container) {
                initComponentFromEvent({ target: $container[0] }, CLICK, true, $container.attr(DATA_INSTANCE));
              },

              /**
               * Dump Kanji internal data structure (use for debugging and diagnostic).
               * @param callback callback function.
               */
              'com:dump': function(callback) {
                callback(repository);
              }
            }
          }
        }
      };

      $.fn.ready(function() {
        var $document  = $(document),
            len        = lazySelectorQueue.length,                                                 // lazySelectorQueue stores selectors to data-lazy="false" element and not initialized yet
            queueIndex = 0,
            $containers, count, containerIndex, $container, componentId, Component;

        // Mark flag that DOM is ready. $ready may be executed after DOM ready, this flag
        // ensures $ready knows how to initialize none-lazy components
        isDomReady = 1;

        // Initialize none-lazy/none-initialized components which have classes in place (script imported)
        while (queueIndex < len) {
          $containers    = $(lazySelectorQueue[queueIndex++]);                                     // TODO optimize: get all data-com element once, then filter with lazySelectorQueue
          count          = $containers.length;
          containerIndex = 0;

          if (count) {
            while (containerIndex < count) {
              $container   = $($containers[containerIndex++]);
              componentId = $container.attr(DATA_COMPONENT).split('/')[0],
              Component   = repository[componentId];

              if (Component.prototype.lazy === false || Component.hasNondelegableEvents) {
                initComponentFromEvent({ target: $container[0] }, CLICK, true);
              }
            }
          }
        }

        // Delegate default event type (click or touchend) on [data-act] elements to document
        $document.on(TOUCH_END, function(event) {
          actionFlag = true;                                                                       // prevent 'click' handler from executing
          return initComponentFromEvent(event, CLICK);
        }).on(CLICK, function(event) {
          if ( !actionFlag) {                                                                      // only execute handler if 'touchend' handler was not executed
            return initComponentFromEvent(event, CLICK);
          }
          actionFlag = false;
        });

        // Bind delegable events to $document
        $document.on(DELEGABLE_EVENTS, function(event) {
          return initComponentFromEvent(event, event.type);
        });

        // Schedule garbage collection on detached DOM elements (DOM detach -> remove instance reference)
        timeout(gc, GC_TIMEOUT);
      });
    }
  };
});