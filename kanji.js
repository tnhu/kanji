/* jshint newcap:false */
/* global Kanji:true, Class, console, jsface, setTimeout, document */

/**
 * Kanji web declarative component framework.
 *
 * @author Tan Nhu, http://lnkd.in/tnhu
 * @license MIT
 * @dependency jsface, jsface.ready, jQuery, JSON || jQuery.parseJSON
 */
Class(function() {
  var CLICK                = 'click',
      TOUCH_END            = 'touchend',                              // on mobile: translate 'click' to 'touchend' (faster)

      // data attribute names
      DATA_COMPONENT       = 'data-com',
      DATA_NS              = 'data-ns',                               // namespace attribute
      DATA_CONFIG          = 'data-cfg',
      DATA_INSTANCE_ID     = 'data-instance',                         // component instance id (value is auto generated)
      DATA_ACTION          = 'data-act',

      // selectors
      SELECTOR_COMPONENT   = '[data-com]',                            // component selector
      SELECTOR_ACTION      = '[data-act]',                            // action selector

      // delegable events (from document), except click and touchend (unperformant events should be moved to INDELEGABLE_EVENTS)
      DELEGABLE_EVENTS     = 'blur change contextmenu dblclick error focus focusin focusout keydown keypress keyup load mousedown mouseup resize scroll select submit touchcancel touchleave touchmove touchstart unload',

      // indelegable events (delegable but unperformant)
      INDELEGABLE_EVENTS   = { mouseenter:1, mouseout:1, mousemove:1, mouseleave:1, mouseover:1, hover:1 },

      // message prefix
      KANJI                = 'Kanji:',
      ERROR                = '[ERROR] ' + KANJI,

      // garbage collection settings
      GC_TIMEOUT           = 3000,                                    // checking routine (ms)
      GC_MAX_WORKING_TIME  =  250,                                    // duration GC is allowed work (ms), more than that, terminate itself

      // shortcuts
      functionOrNil        = jsface.functionOrNil,
      $                    = jQuery,
      timeout              = setTimeout,
      slice                = [].slice,
      parseJSON            = (typeof JSON === 'object') && JSON.parse || $.parseJSON,

      // internal vars
      isDomReady           = 0,
      lazySelectorQueue    = [],                                      // lazy component selectors
      autoId               = 1,                                       // auto generated instance id
      repository,                                                     // components and their instances reference repository
      actionFlag;                                                     // prevent 'click' handler from executing when 'touchend' handler already executed


  /**
   * Get config as JavaScript object if it's a valid JavaScript object, or as original string if it's not.
   * @param config config string as in data-cfg.
   * @return a valid JavaScript typed object, or the original string if it's not a JavaScript typed object.
   */
  function configAsObjectOrRaw(config) {
    // preformat the string, config support single quote
    config = config && config.replace(/'/g, '"');

    try {
      config = config && parseJSON(config);
    } catch (error) {}

    return config;
  }

  /**
   * Parse an action string (value of data-act attribute).
   * @param action action string. (I.e: "switchView|mouseenter,mouseout:preloadStylist")
   * @return declared action structure. (I.e: { click: "switchView", mouseenter: "preloadStylist", mouseout: "preloadStylist" })
   */
  function parseAction(action) {                       // "click:switchView|mouseenter,mouseout:preloadStylist"
    var actions = {},
        parts   = action && action.split('|'),         // [ "click:switchView", "mouseenter,mouseout:preloadStylist" ]
        len     = parts && parts.length || 0,          // 2
        pair, pairLen, actionSet, actionSetLen;

    while (len--) {
      pair    = parts[len].split(':');                 // [ "mouseenter,mouseout", "preloadStylist" ]
      pairLen = pair.length;                           // 2

      if (0 < pairLen && pairLen < 3) {                // 0 < 2 < 3
        if (pair.length === 1) {                       // in case of shortcut action: "switchView|mouseenter,mouseout:preloadStylist" > [ "switchView" ]
          pair.unshift(CLICK);                         // > [ "click" or "touchend",  "switchView" ]
        }

        actionSet    = pair[0].split(',');             // [ "mouseenter,mouseout" ] [ [ "mouseenter", "mouseout" ] ]
        actionSetLen = actionSet.length;

        while (actionSetLen--) {
          actions[actionSet[actionSetLen]] = pair[1];  // actions.mouseenter = "preloadStylist"
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
   * @return pair of { instanceId: instance id, instance: instance object }.
   */
  function lookupOrInstantiateSharedInstance(Component) {
    var instanceRefs = repository.instanceRefs,
        instanceId, instance;

    // look up in instanceRefs, if found then return
    for (instanceId in instanceRefs) {
      instance = instanceRefs[instanceId];
      if (instance instanceof Component) {
        return { instanceId: instanceId, instance: instance };
      }
    }

    // not found, create a new one
    return { instanceId: autoId++, instance: new Component() };
  }

  /**
   * Locate instance information of a component in its HTML scope.
   * @param element jQuery element.
   * @param initIfNeeded false to locate only, otherwise initialize the component if there's no
   *        instance bound to the HTML scope yet.
   * @return instance of the component bound to the HTML scope.
   */
  function instanceInfoOrNil(element, initIfNeeded) {
    var $parent     = element.closest(SELECTOR_COMPONENT),
        instanceId  = $parent.length && $parent.attr(DATA_INSTANCE_ID),
        instance    = instanceId && repository.instanceRefs[instanceId];

    // if instance was not created before and initIfNeeded !== false and parent is a component then init the component
    if ( !instance && initIfNeeded !== false && $parent.length) {
      instance = initComponentFromContainer($parent);
    }

    return instance && { parent: $parent, instance: instance };
  }

  /**
   * Invoke action handler from an event.
   * @param e event object associated with target when the event happens
   * @param translatedEventType if provided, translatedEventType is used to override e.type (optional).
   */
  function invokeActionHandlerFromEvent(e, translatedEventType) {
    var $target      = translatedEventType ? $(e.target) : $(this),
        eventName    = translatedEventType || e.type,                // event type
        meta         = elementMetadataOrNil($target),                // retrieve element meta from target context
        instanceInfo = instanceInfoOrNil($target, true),             // locate instance info in context (note: never use from meta as it's out of context already)
        meta, instance, fnName, fn;

    if (meta && instanceInfo) {
      instance = instanceInfo.instance;
      fnName   = meta.actions[eventName];

      // if action is declared, locate and execute it, otherwise, just ignore
      if (fnName) {
        fnName   = [ 'on', fnName.charAt(0).toUpperCase(), fnName.slice(1) ].join('');
        fn       = instance && functionOrNil(instance[fnName]);

        if (fn) {
          return fn.call(instance, e, $target, instanceInfo.parent);
        } else {
          console.log(ERROR, fnName, 'not yet implemented');
        }
      }
    }
  }

  /**
   * Bind DOM events to component container and its actions HTML elements which may be not performant
   * if being delegated. Events like mouseenter, mouseout are very costly if being delegated to document level.
   * @param meta component metadata
   */
  function indelegableEventsBinding(meta) {
    var event, index;

    for (event in meta.actions) {                             // loop through actions
      if (INDELEGABLE_EVENTS[event]) {                        // if event is on the list then bind it
        meta.element.on(event, invokeActionHandlerFromEvent);
      }
    }

    for (index in meta.children) {
      indelegableEventsBinding(meta.children[index]);
    }
  }

  /**
   * Get direct action elements of a component element.
   * @param $element jQuery
   */
  function directActionElementsOrNil($element) {
    var $actions = $element.children(':not([data-com])[data-act]');

    return $actions.length && $actions || 0;
  }

  /**
   * Parse element and construct declared metadata structure.
   * @param $element jQuery element.
   * @param componentMeta internal use, never pass it
   * @param ignoreChildrenScanning internal use, never pass it
   * @return declared data structure or 0 if element is not a declared object. If element is a component,
   * the function return { instanceId:, element:, config: }, if it's an action, return { actions: }
   */
  function elementMetadataOrNil($element) {
    var result = 0,
        componentId, action, $actions, len, children, rawId, split, namespace;

    if ( !$element || !$element.length) {
      return result;
    }

    rawId = $element.attr(DATA_COMPONENT);
    if (rawId) {
      split       = rawId.split('/');
      componentId = split.shift();
      namespace   = split.length ? split.join('') : null;

      result = {
        element    : $element,
        componentId: componentId,
        namespace  : namespace,
        config     : configAsObjectOrRaw($element.attr(DATA_CONFIG)),
        actions    : parseAction($element.attr(DATA_ACTION))           // actions on component level, i.e data-com="Stylist" data-act="mouseenter:preloading"
      };

      // get metadata of direct actions
      $actions = directActionElementsOrNil($element);
      if ($actions) {
        len      = $actions.length;
        children = [];

        while (len--) {
          children.push(elementMetadataOrNil($($actions[len])));
        }
        result.children = children;
      }
    } else {
      action = $element.attr(DATA_ACTION);
      if (action) {
        result = {
          element: $element,
          actions: parseAction(action)
        };
      }
    }

    return result;
  }

  /**
   * Initialize a component.
   * @param $container jQuery object which declares the component.
   * @see 'com.init' listener.
   */
  function initComponentFromContainer($container) {
    var meta         = elementMetadataOrNil($container),
        instanceRefs = repository.instanceRefs,
        componentId, instanceId, config, Component,
        type, sharedInstanceInfo, instance, namespace, eventId, listeners, nsListeners;

    if (meta) {
      componentId  = meta.componentId;              // get component identifier
      instanceId   = meta.instanceId;               // get auto generated instanceId attached to this component (if any)
      Component    = repository[componentId];       // get the component class in repository

      if (Component) {
        type   = Component.type;                    // get component type (instance|shared)
        config = meta.config;                       // get config

        switch (type) {
        case 'shared':
          // 'shared': lookup or create a new shared instance of Component
          sharedInstanceInfo = instanceRefs[instanceId] || lookupOrInstantiateSharedInstance(Component);
          instanceId         = sharedInstanceInfo.instanceId;                                       // get instance id
          instance           = instanceRefs[instanceId] = sharedInstanceInfo.instance;              // get actual instance
          break;

        default:
          // default is 'instance', simply create a new instance per this $container
          instanceId = instanceId || autoId++;                       // if instanceId exists, use it, otherwise, generate a new instanceId
          instance   = instanceRefs[instanceId] || new Component();  // if instance exists in instanceRefs, reuse it (in case of detach/attach), otherwise, create a new one
          instanceRefs[instanceId] = instance;                       // update instanceRefs
          namespace                = meta.namespace;
          instance.namespace       = namespace;

          // transform instance.listeners if namespace is declared
          // instance.listeners[eventId] -> instance.listeners[eventId + '/' + namespace]
          if (namespace) {
            listeners   = instance.listeners;
            nsListeners = {};

            for (eventId in listeners) {
              nsListeners[eventId + '/' + namespace] = listeners[eventId];
            }
            instance.listeners = nsListeners;
          }
          break;
        }

        // init is called every time, no matter what type is
        // TODO document about this init() behavior on DOM detach / attach
        instance.init($container, config);

        // mark the component is already initialized
        $container.attr(DATA_INSTANCE_ID, instanceId);

        // bind self binding events (events which can't not be delegated as could not be performant)
        indelegableEventsBinding(meta);
      } else {
        console.log(ERROR, 'Component not found', componentId);

        // notify interested listeners (script loader, error reporter maybe)
        Kanji.notify('com:not-found', componentId, $container);
      }
    }

    return instanceRefs[instanceId];
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
      if (instanceId === "0") {
        continue;
      }

      element = $([ '[', DATA_INSTANCE_ID, '=', instanceId, ']' ].join(''));

      if ( !element.length) {
        delete instanceRefs[instanceId];
      }

      // don't block UI when GC is working, ever
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
        eventId = (this.type === 'shared') ? eventId : (this.namespace ? [ eventId, '/', this.namespace ].join('') : eventId);

        for (instanceId in instanceRefs) {
          instance  = instanceRefs[instanceId];
          listeners = instance.listeners;

          if (listeners[eventId]) {
            listeners[eventId].apply(instance, args);
          }
        }

        // output eventId to console if debug is turned on
        if (Kanji.debug) {
          console.log(KANJI, eventId);
        }
      }
    },

    /**
     * init is called when component's attached DOM element is ready. Normally subclasses overrides this method.
     * @param config configuration.
     * @param element jQuery attached DOM object.
     */
    init: function(element, config) {
    },

    /**
     * Event listeners as pair of eventId: handler()
     */
    listeners: {},

    /*
     * Ready handler: capture sub-class definitions, save in repository and do initialization if needed.
     */
    $ready: function(clazz, parent, api) {
      var componentId, componentSelector, eventId, listeners, parent, superp;

      if (this !== clazz) {
        componentId = api.id;

        if (componentId) {
          if ( !repository[componentId]) {
            repository[componentId] = clazz;
            componentSelector       = [ '[data-com="', componentId, '"][data-lazy="false"],[data-com^="', componentId, '/"][data-lazy="false"]' ].join(''); // TODO benchmark this selector

            // merge listeners: no multiple inheritance support, just single parent
            superp = clazz.$superp;
            parent = clazz.$super;

            while (superp) {
              listeners = superp.listeners;

              for (eventId in listeners) {
                if ( !api.listeners[eventId]) {
                  api.listeners[eventId] = listeners[eventId];
                }
              }
              superp = parent.$superp;
              parent = parent.$super;
            }

            // save component type in class for referencing later
            if (api.type) {
              clazz.type = api.type;
            }

            // do initialize for declared data-lazy="false" fragments if DOM is ready
            // otherwise, put component selector in queue for later initialization
            if (isDomReady) {
              $(componentSelector).each(function() {
                initComponentFromContainer($(this));
              });
            } else {
              lazySelectorQueue.push(componentSelector);
            }
          }
        } else {
          console.log(ERROR, 'componentId not defined on api', api);
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
               */
              'com:init': initComponentFromContainer
            }
          }
        }
      };

      $.fn.ready(function() {
        var $document  = $(document),
            len        = lazySelectorQueue.length,   // lazySelectorQueue stores selectors to data-lazy="false" element and not initialized yet
            queueIndex = 0,
            $container, count, containerIndex;

        // Mark flag that DOM is ready. $ready may be executed after DOM ready, this flag
        // ensures $ready knows how to initialize none-lazy components
        isDomReady = 1;

        // Initialize none-lazy/none-initialized components which have classes in place (script imported)
        while (queueIndex < len) {
          $container     = $(lazySelectorQueue[queueIndex++]);
          count          = $container.length;
          containerIndex = 0;

          if (count) {
            while (containerIndex < count) {
              initComponentFromContainer($($container[containerIndex++]));
            }
          }
        }

        // Notify some components have data-lazy="false" but not initialized because scripts are not imported?
        //  -> No need because of lazy script importing
        // $(':not([data-instance])[data-com][data-lazy]');

        // Delegate default event type (click or touchend) on [data-act] elements to document
        $document.on(TOUCH_END, SELECTOR_ACTION, function(event) {
          actionFlag = true;                                          // prevent 'click' handler from executing
          return invokeActionHandlerFromEvent(event, CLICK);
        }).on(CLICK, SELECTOR_ACTION, function(event) {
          if ( !actionFlag) {                                         // only execute handler if 'touchend' handler was not executed
            return invokeActionHandlerFromEvent(event, CLICK);
          }
          actionFlag = false;
        });

        // Bind delegable events to $document
        $document.on(DELEGABLE_EVENTS, function(event) {
          return invokeActionHandlerFromEvent(event, event.type);
        });

        // Schedule garbage collection on detached DOM elements (DOM detach -> remove instance reference)
        timeout(gc, GC_TIMEOUT);
      });
    }
  };
});