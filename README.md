Kanji 感じ
==========

[![Build Status](https://travis-ci.org/tnhu/kanji.png?branch=master)](https://travis-ci.org/tnhu/kanji)

Kanji is a web declarative component framework. The idea behind Kanji is when you develop a web component, HTML and CSS should come first, then JavaScript only gets involved when user interactions happen. Kanji defines a small set of custom HTML data attributes and simple JavaScript APIs to build elegant, standardized, extensible, and testable web components.

Design philosophy:

1. HTML and CSS first. A web component starts with its viewable presentation. Even with JavaScript disabled, users are able to view the content. JavaScript involves only when needed.
2. HTML should be readable in the way that it's connected to both CSS (how the content looks) and JavaScript (which does what when an event happens).
3. Event bindings among DOM elements and JavaScript handlers should not be verbose and painful.
4. A component should be an isolated piece of software. Components interact with other components by events, not APIs.

Kanji is small. When being minimized and gziped, standalone version is about 1.7K, full version including dependencies (without jQuery) is less than 2.6K.

## Setup

In your web page, import Kanji and its dependencies separately:

``` html
<script src="lib/jquery.js"></script>
<script src="lib/jsface.js"></script>
<script src="lib/jsface.ready.js"></script>
<script src="kanji.js"></script>
```

Or import Kanji full version which includes jsface and jsface.ready:

``` html
<script src="lib/jquery.js"></script>
<script src="kanji-full.js"></script>
```

## Short tutorial

Assume you have an HTML fragment like below for a login form with two input fields and one submit button.

``` html
<form>
  <input name="username"></input>
  <input type="password" name="password"></input>
  <input type="submit" value="Login"></input>
</form>
```

You declare the fragment as a Kanji component by adding extra information into it via data attributes (`data-*`).

``` html
<form data-com="LoginForm" data-cfg="{ 'debug': true }">
  <input name="username" data-act="keydown:checkUsername"></input>
  <input type="password" name="password" data-act="keydown:checkPassword"></input>
  <input type="submit" value="Login" data-act="login"></input>
</form>
```

What happens here is you declare the form as a component named `LoginForm` with three actions `checkUsername`, `checkPassword` and `login`. `checkUsername` is bound to `keydown` event on the username field, `checkPassword` handles `keydown` event on password field and `login` handles `click` event on the submit button (click event is default event so you don't have to specify `click:login`).

Next you implement LoginForm:

``` js
Class(Kanji, {          // a component is a sub-class of Kanji
  id   : "LoginForm",   // id is component unique identifier
  debug: false,

  init: function(form, config) {
    this.debug = config.debug;
    console.log('initialization');
  },

  onCheckUsername: function(event, input, form) {
    if (this.debug) {
      console.log('checking username');
    }
  },

  onCheckPassword: function(event, input, form) {
    if (this.debug) {
      console.log('checking password');
    }
  },

  onLogin: function(event, input, form) {
    if (this.debug) {
      console.log('about to login');
    }
    return false;
  }
});
```

Import the script in the same page with the HTML fragment. When you start interacting with the form, you notice the component is instantiated and its handlers are executed (open your browser JavaScript console first). You can play with [this sample online at jsfiddle](http://jsfiddle.net/tannhu/H4fTe/6/), another more comprehensive sample can be found [here](http://jsfiddle.net/tannhu/ysXRk/3/).

## Reference

### Declarative HTML data attributes

Kanji defines small set of custom HTML data attributes to declare component, configuration, action and component instantiation strategy.

| Name                                | Required  | Availability  | Default value   |
| ----------------------------------- | --------- | ------------- | --------------- |
| data-com="ComponentNameAsString"    | yes       | Component     |                 |
| data-cfg="Any"                      | no        | Component     |                 |
| data-act="action(s)"                | no        | Any           |                 |
| data-lazy="false"                   | no        | Component     | true            |

#### data-com

Add `data-com="YourComponentId"` into any HTML elements to declare it's a component. For example:

``` html
<div data-com="MyExampleComponent">
</div>
```

Note that components can be nested.

``` html
<div data-com="Page">
  <div data-com="Table">
    <div data-com="Cell">
    </div>
    <div data-com="Cell">
    </div>
  </div>
  <div data-com="Table">
  </div>
</div>
```

#### data-lazy

By default, all components are lazy instantiated. Meaning the JavaScript instance of the component will be created on demand, whenever an event happens inside it. If you want your component to be initialized when its DOM fragment is ready, add `data-lazy="false"`.

``` html
<div data-com="MyExampleComponent" data-lazy="false">
</div>
```

#### data-cfg

This data attribute is used to pass an extra parameter/configuration into your component. Declare it under `data-cfg="VALUE"`. VALUE can be anything.

``` html
<div data-com="MyExampleComponent" data-cfg="{ 'foo': 'bar' }">
</div>
```

#### data-act

Declare action(s) on any element inside a component (including component's container itself) by using data-act attribute.

**Syntax**:

```html
data-act="event1[,event2...]:handler|eventN:handlerN|..."
```

If event is not specify but only handler (i.e: `data-act="login"`) then handler will be bound to `'click'` event or `'touchend'` event (on mobile devices).

**Supported events:**

``` js
blur change contextmenu dblclick error focus focusin focusout hover keydown keypress keyup load
mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup resize scroll select submit
touchcancel touchleave touchmove touchstart unload
```

Sample of data-act declaration with multiple events and handlers.

``` html
<div data-com="MyExampleComponent" data-act="mouseenter:preloadData">
  <input data-act="keydown,keyup:type|mouseenter:foo|mouseout:bar"></input>
  <button data-act="hi">Say hi</button>
  <a role="button" data-act="bye">Say bye</a>
</div>
```

### Component API

#### Component implementation

A component is a class extends from Kanji with a unique component id.

``` js
MyExampleComponent = Class(Kanji, {
  id: "MyExampleComponent"
});
```

If you want to handle something when component DOM is ready. Implement `init()` method:

``` js
MyExampleComponent = Class(Kanji, {
  id: "MyExampleComponent",

  init: function(container, config) {
  }
});
```

* `container`: jQuery object represents the component element (HTML)
* `config`: configuration declared in the component (if any)

Map your declared actions to your component's methods by implementing `"on" + action methods`. When an action occurs, there are three parameters will be passed to its handler:

* `event`: event object
* `target`: jQuery object represents the target element
* `container`: jQuery object represents the component element

``` js
MyExampleComponent = Class(Kanji, {
  id: "MyExampleComponent",

  onHi: function(event, target, container) {
  },

  onBye: function(event, target, container) {
  }
});
```

#### Kanji reserved properties

When implementing your components, note that Kanji reserves these properties for its internal use.

| Name                                | Required  |
| ----------------------------------- | --------- |
| id                                  | yes       |
| type                                | no        |
| listeners                           | no        |
| namespace                           | no        |

#### Inter-component communication

A component uses `notify()` to send notifications.

``` js
Class(Kanji, {
  id: "MyExampleComponent",

  onHi: function(event, target, container) {
    this.notify("log.info", "Say hi");
  },

  onBye: function(event, target, container) {
    this.notify("log.info", "Say bye");
  }
});
```

Any components want to capture a notification need to implement a listener. For example, Logger listens to `log.info` to do some logging:

``` js
Class(Kanji, {
  id: "Logger",

  listeners: {
    "log.info": function() {
      // do something when being notified
    }
  }
});
```

Play with a sample [online](http://jsfiddle.net/tannhu/YFCVX/2/).

Listeners in Kanji are inherited. If a parent component has some listeners, its child components will have them as default listeners. The child components are also able to override those inherited listeners.

#### Namespace and listeners

Instances of non-shared components are able to communicate privately via namespace mechanism. When a component is declared with a namespace, notifications sent intentionally to it must be postfixed by its namespace.

Give an example ([see online](http://jsfiddle.net/tannhu/AzCdA/2/)), we have a Timer component listens to `'time:show'` event like this:

``` js
Class(Kanji, {
  id: 'Timer',

  init: function() {
    this.notify('time:up');
  },

  listeners: {
    'time:show': function() {
      // ...
    }
  }
});
```

When having declarations:

``` html
<script data-com="Timer/red" data-cfg="{ 'src': 'Red Timer' }" data-lazy="false"></script>
<script data-com="Timer" data-cfg="{ 'src': 'Timer1' }" data-lazy="false"></script>
<script data-com="Timer" data-cfg="{ 'src': 'Timer2' }" data-lazy="false"></script>
<script data-com="Timer" data-cfg="{ 'src': 'Timer3' }" data-lazy="false"></script>
```

The call from a component:

``` js
this.notify('time:show');
```

notifies Timer1, Timer2, and Timer3, and Red Timer. The call:

``` js
this.notify('time:show/red');
```

notifies Red Timer. But not Timer1, Timer2, and Timer3.

Listeners also support namespace.

``` js
Class(Kanji, {
  id: 'Listener',

  listeners: {
    /**
     * Listen to 'time:up' event on Timer with namespace 'red'
     */
    'time:up/red': function() {
    },

    /**
     * Listen to 'time:up' event on other timers (Red timer excluded 'cause it's declared with namespace)
     */
    'time:up': function() {
    }
  }
});
```

When a component is namespaced, its notifications are scoped in its namespace. In the example above, you see Red Timer is namespaced as 'red' hence in order to capture Red Timer '`time:up'` event, Listener declares `'time:up/red'`.

Kanji implements simple namespace notify/listeners routing. In the example above, if Listener component is also namespaced, then it won't work as expected. So please keep your code simple!

#### Shared instance

By default, an instance of the component class is instantiated per each declared DOM fragment. Kanji supports shared instance where only one instance of the component is instantiated for all declared fragments. Enabling shared instance by adding `type="shared"` when implementing your component.

``` js
MyExampleComponent = Class(Kanji, {
  id: "MyExampleComponent",
  type: "shared"
});
```

#### Inheritance and extending

Powered by [jsface](https://github.com/tannhu/jsface), Kanji allows multiple level inheritance. Subclass can override and invoke parent's actions (methods).

``` js
Component = Class(Kanji, {
  id: "Component",

  onModal: function(button, container) {
    // ...
  }
});

Dialog = Class(Component, {
  id: "Dialog",

  onModal: function(button, container) {
    // do something specifically for Dialog

    // call Component's onModal
    Dialog.$superp.onModal.call(this, button, container);
  }
});

LoginDialog = Class(Component, {
  id: "LoginDialog",

  onModal: function(button, container) {
    // do something specifically for LoginDialog

    // call Dialog's onModal
    LoginDialog.$superp.onModal.call(this, button, container);
  }
});
```

#### Delegable and non-delegable events

In its implementation, Kanji delegates these events to document:

``` js
blur change contextmenu dblclick error focus focusin focusout keydown keypress
keyup load mousedown mouseup resize scroll select submit touchcancel touchleave
touchmove touchstart unload
```

Components have delegable actions only are able to detach and attach their DOM fragments as will. Kanji makes sure event handlers are bound properly.

These below events are costly to delegate to document (Kanji's term: non-delegable events):

``` js
mouseenter mouseout mousemove mouseleave mouseover hover
```

Kanji binds non-delegable events to target elements directly. This approach helps to boost performance but results a downside: When a component which has non-delegable actions is detached from the page, all bound handlers are lost. When it's attached to the page again, it's developers' duty to tell Kanji to re-initialize the component by sending a `'com:init'`
notification manually.

A component has non-delegable actions is initialized automatically without the need of specifying `lazy="false"`.

#### Kanji internal notifications

Kanji notifies `'com:not-found'` when it tries to initialize a component but its implementation is not found. Frameworks built on top of Kanji can capture this notification to do some handy stuff like fetching scripts or error reporting, etc.

You are able to force Kanji to initialize a component by sending a `'com:init'` notification.

**Syntax:**

``` js
Kanji.notify('com:init', container); // jQuery object represents the component DOM fragment
```

What is the use of `'com:init'` notification? It's useful when you detach HTML fragment of a component which has actions bound to non-delegable events (`mouseenter`, `mouseout`, `mousemove`, `mouseleave`, `mouseover`, `hover`) then later on attach the fragment. In such situation, you need to tell Kanji to re-initialize the component again.

### More about instantiation

Kanji automatically initializes components with `data-lazy="false"` and components declare non-delegable actions. With delegable components (component with `data-lazy!="false" and declare only delegable actions), Kanji does not do anything until there's a user interaction happens inside their  HTML fragment. If there are multiple declarations of the same component on the page, Kanji instantiates only one instance of the component to handle in that fragment's scope. Imaging you have 100 declarations of a component named `Card`:

``` html
<div data-com="Card">
  <p>Card 1</p>
  <button data-act="hello">Say hi</button>
</div>
<div data-com="Card">
  <p>Card 2</p>
  <button data-act="hello">Say hi</button>
</div>

...

<div data-com="Card">
  <p>Card 100</p>
  <button data-act="hello">Say hi</button>
</div>
```

When you click button `Say hi` on the first card (or any card), first instance of Card is instantiated. When you click `Say hi` on the second card, another instance is instantiated.

What happens if you specify `type="shared"` in Card? When you first click `Say hi` on any card, one instance of Card is instantiated and this instance will be shared across all the cards inside the page, meaning when you click the button on another card, the shared instance will handle the event.

Kanji has a garbage collector. When all the DOM fragments represent a component are detached, all of its instances will be removed. In the other word, components can be attached and detached as will.

## Best practice

I would recommend to define a root class component which includes all shared actions. Other components extend the root component (or its subclass) rather than inheriting from Kanji class directly. And it would be always better to group your components under a namespace instead of making a lot of global variables.

``` js
LI = {};
LI.Component = Class(Kanji, {
  id: "Component",

  // shared actions
});

LI.MyExampleComponent = Class(LI.Component, {
  id: "MyExampleComponent",

  // ...
});
```
