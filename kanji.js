/* jshint newcap:false */
/* global Kanji:true, Class, console, jsface, setTimeout, document */

/**
 * Kanji 感じ - web declarative component framework
 *
 * @author Tan Nhu, http://lnkd.in/tnhu
 * @licence MIT
 * @dependency jsface, jsface.ready, jQuery, JSON || jQuery.parseJSON
 */
Class(function() {
  var EVENT_TYPE          = window.Touch ? 'touchend' : 'click',     // event type
      SELECTOR            = 'button,[role~=button]',                 // selector to touch/event elements
      KEY_ACTION          = 'act',
      KEY_CONFIG          = 'cfg',
      DATA_CONFIG         = 'data-' + KEY_CONFIG,
      KEY_COMPONENT       = 'com',
      KEY_AUTO_GENERATED  = 'instance',                              // component instance generated id
      DATA_AUTO_GENERATED = 'data-' + KEY_AUTO_GENERATED,
      SEL_COMPONENT       = '[data-com]',
      GC_TIMEOUT          = 2000,                                    // garbage collection checking routine (ms)
      GC_MAX_WORKING_TIME = 250,                                     // duration GC can work (ms), more than that, terminate itself
      repository          = { instanceRefs: {} },                    // components and their instances reference repository
      autoId              = 1,
      isString            = jsface.isString,
      isFunction          = jsface.isFunction,
      $                   = jQuery,
      timeout             = setTimeout,
      slice               = [].slice,
      isDomReady          = 0,
      lazyComponentSelectorQueue = [],
      parseJSON           = (typeof JSON === 'object') && JSON.parse || $.parseJSON;  // fallback to jQuery.parseJSON if JSON does not exist

  /**
   * Log an error message, params as console.log
   */
  function error() {
    var msg = slice.call(arguments).join(' ');
    Kanji.notify('log.error', msg);              // notify a 'log.error' event, hope there are some listener
    console.log('ERROR:', msg);                  // and also a console message
  }

  /**
   * Parse config data.
   * @param cfg config as in data-KEY_CONFIG
   * @return a valid JSON, or the original string if data is not JSON well-formed.
   */
  function parseConfig(cfg) {
    // preformat the string, cfg support single quote
    cfg = cfg && cfg.replace(/'/g, '"');

    try {
      cfg = cfg && parseJSON(cfg);
    } catch (error) {}

    return cfg;
  }

  /**
   * Lookup shared instance of a component. If there's no instance found, create a new one
   * @param component component class
   * @return pair of { instanceId: instance id, instance: instance object }
   */
  function lookupSharedInstance(Component) {
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
   * @see description in initComponent under $statics
   */
  function initComponent(container) {
    var componentId  = container.data(KEY_COMPONENT),                // get component identifier
        instanceId   = container.data(KEY_AUTO_GENERATED),           // get auto generated instanceId attached to this component (if any)
        instanceRefs = repository.instanceRefs,
        config, Component, type, shared, instance;

    if ( !componentId) {
      error('component is not declared on [', container, ']');
    } else {
      Component = repository[componentId];

      if (Component) {
        type   = Component.componentType;                            // get component type (instance|shared)
        config = parseConfig(container.attr(DATA_CONFIG));           // parse configuration, bypass jQuery.data as it's slower

        switch (type) {
        case 'shared':  // 'shared': lookup shared component
          shared     = instanceRefs[instanceId] || lookupSharedInstance(Component);
          instanceId = shared.instanceId;
          instance   = instanceRefs[instanceId] = shared.instance;
          break;

        default:        // default is 'instance', simply create a new instance
          instanceId = instanceId || autoId++;                       // if instanceId exists, use it, otherwise, generate a new instanceId
          instance   = instanceRefs[instanceId] || new Component();  // if instance exists in instanceRefs, reuse it (in case of detach/attach), otherwise, create a new one
          instanceRefs[instanceId] = instance;                       // update instanceRefs
          break;
        }

        // init is called every time, no matter what type is
        instance.init(container, config);

        // mark the component is already initialized
        container.attr(DATA_AUTO_GENERATED, instanceId);
      } else {
        error('Component does not exist [', componentId, ']');
      }
    }

    return instanceRefs[instanceId];
  }

  /**
   * Schedule garbage collection
   */
  function gc() {
    var instanceRefs = repository.instanceRefs,
        startTime    = +new Date(),
        instanceId, element;

    // look up in instanceRefs, if found then return
    for (instanceId in instanceRefs) {
      element = $([ '[', DATA_AUTO_GENERATED, '=', instanceId, ']' ].join(''));

      if ( !element.length) {
        delete instanceRefs[instanceId];
      }

      // don't block UI, ever
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
       * Initialize a specific component
       * @param container jQuery container object
       * @return reference to instance of the component
       */
      initComponent: initComponent,

      /**
       * Notify listeners of an event
       * @param eventId event id
       * @param any...  parameters
       */
      notify: function() {
        var args          = slice.call(arguments),
            eventId       = args.shift(),
            instanceRefs  = repository.instanceRefs,
            instanceId, instance, listeners, event;

        for (instanceId in instanceRefs) {
          instance  = instanceRefs[instanceId];
          listeners = instance.listeners;

          for (event in listeners) {
            if (event === eventId) {
              listeners[event].apply(instance, args);
              break; // event is unique so terminate looping, turn to next instance
            }
          }
        }
      }
    },

    /**
     * init is called when component's attached DOM element is ready. Normally subclasses overrides this method.
     * @param config configuration
     * @param element jQuery attached DOM object
     */
    init: function(element, config) {
    },

    /**
     * Event listeners as pair of eventId: handler()
     */
    listeners: 0,

    /*
     * Ready handler: capture sub-class definitions, save in repository and do
     * some initialization if needed
     */
    $ready: function(clazz, parent, api) {
      var componentId, componentSelector;

      if (this !== clazz) {
        componentId = api.componentId;

        if (componentId) {
          if ( !repository[componentId]) {
            repository[componentId] = clazz;
            componentSelector       = [ '[data-com="', componentId, '"][data-lazy="false"]' ].join('');

            // do initialization for declared data-lazy="false" fragments if DOM is ready
            // otherwise, put component selector in queue for later
            if (isDomReady) {
              $(componentSelector).each(function() {
                initComponent($(this));
              });
            } else {
              lazyComponentSelectorQueue.push(componentSelector);
            }

            // save component type if it's specified in api
            if (api.componentType) {
              clazz.componentType = api.componentType;
            }
          }
        } else {
          error('componentId must exist in api', api);
        }
      }
    },

    /*
     * Class entry point
     */
    main: function(clazz) {
      Kanji = clazz;

      $.fn.ready(function() {
        var _document = $(document),
            len       = lazyComponentSelectorQueue.length,
            i         = 0,
            container, count, j;

        // mark flag that DOM is ready
        isDomReady = 1;

        while (i < len) {
          container = $(lazyComponentSelectorQueue[i++]);
          count     = container.length;
          j         = 0;

          if (count) {
            while (j < count) {
              initComponent($(container[j++]));
            }
          }
        }

        //
        // Bind events on button, and role='button'... elements (based on SELECTOR)
        //
        _document.on(EVENT_TYPE, SELECTOR, function() {
          var button      = $(this),
              parent      = button.closest(SEL_COMPONENT),
              componentId = parent.data(KEY_AUTO_GENERATED),
              action      = button.data(KEY_ACTION),
              instance    = repository.instanceRefs[componentId],
              fn, config;

          action = action && [ 'on', action.charAt(0).toUpperCase(), action.slice(1) ].join('');
          fn     = action && instance && instance[action];

          // component is not initialized, do lazy initializaion
          if ( !componentId || !instance) {
            instance = initComponent(parent);

            // no component implementation found: return. Error reporting happened on initComponent()
            if ( !instance) {
              return;
            }

            fn = instance && action && instance[action];
          }

          // TODO caching json on action: Parsing everytime seems costly
          if ( !action || !fn) {
            error('action [', action, '] not found in component [', parent.data(KEY_COMPONENT), ']');
          } else if (isFunction(fn)) {
            fn.call(instance, button, parent, parseConfig(button.attr(DATA_CONFIG)));
          } else {
            error('action [', action, '] found in component [', parent.data(KEY_COMPONENT), '] is not a function');
          }
        });

        //
        // TODO Bind keydown, keyup... on input and textarea
        //
        _document.on('keydown', 'input,textarea', function(event) {
        });

        //
        // TODO Support hover state
        //

        //
        // Schedule garbage collection on detached DOM elements (DOM detach -> remove instance reference)
        //
        timeout(gc, GC_TIMEOUT);
      });
    }
  };
});