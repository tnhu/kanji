/* jshint newcap:false */
/* global Kanji:true, Class, console, jsface, setTimeout, document */

// jsface.js
(function(h,u,v,w,z,A,x,l){function y(a){return a&&typeof a===u&&!(typeof a.length===v&&!a.propertyIsEnumerable(w))}function q(a){return a&&typeof a===u&&typeof a.length===v&&!a.propertyIsEnumerable(w)}function r(a){return a&&"function"===typeof a}function s(a){return r(a)&&a.prototype&&a===a.prototype.constructor}function t(a,b,d){function m(b,f){d&&d.hasOwnProperty(b)||(a[b]=f,c&&(g[b]=f))}if(q(b))for(var f=b.length;0<=--f;)t(a,b[f],d);else{d=d||{constructor:1,$super:1,prototype:1,$superb:1};var c=
s(a),f=s(b),g=a.prototype,k,n;if(y(b))for(k in b)m(k,b[k]);if(f)for(k in n=b.prototype,n)m(k,n[k]);c&&f&&t(g,b.prototype,d)}}function p(a,b){b||(a=(b=a,0));var d,m,f,c,g,k,n=0,e,h={constructor:1,$singleton:1,$statics:1,prototype:1,$super:1,$superp:1,main:1};g=p.overload;var l=p.plugins;b=("function"===typeof b?b():b)||{};d=b.hasOwnProperty("constructor")?b.constructor:0;m=b.$singleton;f=b.$statics;for(c in l)h[c]=1;d=m?{}:d?g?g("constructor",d):d:function(){};g=m?d:d.prototype;for(k=(a=!a||q(a)?a:
[a])&&a.length;n<k;){e=a[n++];for(c in e)h[c]||(g[c]=e[c],m||(d[c]=e[c]));for(c in e.prototype)h[c]||(g[c]=e.prototype[c])}for(c in b)h[c]||(g[c]=b[c]);for(c in f)d[c]=g[c]=f[c];m||(e=a&&a[0]||a,d.$super=e,d.$superp=e&&e.prototype?e.prototype:e);for(c in l)l[c](d,a,b);r(b.main)&&b.main.call(d,d);return d}p.plugins={};l={Class:p,extend:t,isMap:y,isArray:q,isFunction:r,isString:function(a){return"[object String]"===z.apply(a)},isClass:s};"undefined"!==typeof module&&module.exports?module.exports=l:
(x=h.Class,h.Class=p,h.jsface=l,l.noConflict=function(){h.Class=x})})(this,"object","number","length",Object.prototype.toString);

// jsface.ready.js
(function(a){a=a.jsface||require("./jsface");var p=a.isFunction,k=[],l=0;a.Class.plugins.$ready=function q(c,b,a,r){for(var f=a.$ready,d=b?b.length:0,m=d,n=d&&b[0].$super,g,e,h;d--;)for(e=0;e<l&&(h=k[e],g=b[d],g===h[0]&&(h[1].call(g,c,b,a),m--),m);e++);n&&q(c,[n],a,!0);!r&&p(f)&&(f.call(c,c,b,a),k.push([c,f]),l++)}})(this);

/**
 * Kanji (感じ feeling, sense, impression) declarative component framework
 *
 * @author Tan Nhu, tannhu@gmail.com
 * @licence MIT
 * @dependency jsface, jsface.ready, jQuery, JSON || jQuery.parseJSON
 * @date Aug 13, 2013
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
      parseJSON           = (typeof JSON === 'object') && JSON.parse || $.parseJSON;  // fallback to jQuery.parseJSON if JSON does not exist

  /**
   * Log an error message, params as console.log
   */
  function error() {
    console.log('ERROR:', [].slice.call(arguments).join(' '));
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
   * Initialize non-lazy components (data-lazy="false")
   * TODO better name
   */
  function initAllLazy() {
    $(SEL_COMPONENT).each(function() {
      var container = $(this);

      // not want lazy loading? then initialize the component
      if (container.data('lazy') === false) {
        initComponent(container);
      }
    });
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

      // TODO a better name
      initAllLazy: initAllLazy
    },

    /**
     * init is called when component's attached DOM element is ready. Normally subclasses overrides this method.
     * @param config configuration
     * @param element jQuery attached DOM object
     */
    init: function(element, config) {
    },

    /*
     * Ready handler: capture sub-class definitions, save in repository and do
     * some initialization if needed
     */
    $ready: function(clazz, parent, api) {
      var componentId;

      if (this !== clazz) {
        componentId = api.componentId;

        if (componentId) {
          if ( !repository[componentId]) {
            repository[componentId] = clazz;

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
        var _document = $(document);
        initAllLazy();

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
            fn       = instance && action && instance[action];
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
        // Bind keydown, keyup... on input and textarea
        //
        _document.on('keydown', 'input', function(event) {
        });

        //
        // Schedule garbage collection on detached DOM elements (DOM detach -> remove instance reference)
        //
        timeout(gc, GC_TIMEOUT);
      });
    }
  };
});