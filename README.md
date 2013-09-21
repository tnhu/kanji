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
  <input name="username"></input>
  <input type="password" name="password"></input>
  <input type="submit" value="Login"></input>
</form>
```

Next you implement LoginForm:

``` js
Class(Kanji, {          // a component is a sub-class of Kanji
  id: 'LoginForm',      // id is component unique identifier

  actions: {            // mapping actions
    '[name=username]': 'keydown:checkUsername|keyup:checkUsername',
    '[name=password]': 'keydown:checkPassword',
    '[type=submit]':   'login'
  },

  init: function(form, config) {
    console.log('initialization');
  },

  checkUsername: function(event, input) {
    console.log('checking username');
  },

  checkPassword: function(event, input) {
    console.log('checking password');
  },

  login: function(event, input) {
    console.log('about to login');
    return false;
  }
});
```

What happens here is you declare the form as a component named `LoginForm` with three actions `checkUsername`, `checkPassword` and `login`. `checkUsername` is bound to `keydown` and `keyup` events on the username field, `checkPassword` handles `keydown` event on password field and `login` handles `click` event on the submit button (click event is default event so you don't have to specify `click:login`).

Import the script in the same page with the HTML fragment. When you start interacting with the form, you notice the component is instantiated and its handlers are executed (open your browser JavaScript console first). You can play with [this sample online](http://jsfiddle.net/tannhu/H4fTe/15/).

## Reference

### HTML data attributes

Kanji defines two custom HTML data attributes to declare a component and its configuration.

| Name                                | Required  |
| ----------------------------------- | --------- |
| data-com="ComponentNameAsString"    | yes       |
| data-cfg="Any"                      | no        |

#### data-com

Add `data-com="YourComponentId"` into any HTML elements to declare it's a component. For example:

``` html
<div data-com="LoginForm">
</div>
```

Components can be nested:

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

#### data-cfg

This data attribute is used to pass an extra parameter/configuration into your component.

``` html
<div data-com="LoginForm" data-cfg="{ 'debug': true }">
</div>
```

### JavaScript API

#### id, type, and lazy

A component is a class extends from Kanji with a unique component id.

``` js
LoginForm = Class(Kanji, {
  id: 'LoginForm'
});
```

Kanji supports two component types: instance and shared components. With instance component, one instance of the component is instantiated per its HTML fragment declaration. With shared component, only one instance of the component is instantiated to handle all HTML fragment declarations. Specifying shared component by adding `type: 'shared'` in component implementation:

``` js
LoginForm = Class(Kanji, {
  id: 'LoginForm',
  type: 'shared'
});
```

By default, all components are lazy instantiated. Meaning a JavaScript instance of the component will be created on demand, when there's a need of creating it (normally when an event happens inside the component DOM). If you want your component to be initialized right away when its DOM fragment is ready, specify `lazy: false`.

``` js
LoginForm = Class(Kanji, {
  id: 'LoginForm',
  lazy: false
});
```

#### init() and render()

init() is the place to handle some initialization when component DOM is ready:

``` js
LoginForm = Class(Kanji, {
  id: 'LoginForm',

  init: function(container, config) {
  }
});
```

* `container`: jQuery object represents the component element (HTML)
* `config`: configuration declared in the component (if any)

If you want to do some rendering when component DOM is ready, implement render() method. render() is invoked right after init().

``` js
LoginForm = Class(Kanji, {
  id: 'LoginForm',

  render: function(container) {
  }
});
```

* `container`: jQuery object represents the component element (HTML)

#### actions

`actions` is used to map HTML elements inside the component with events and handlers. Each entry in `actions` is a set of CSS selector to an HTML element, event names, and handler names.

``` js
Class(Kanji, {
  id: 'LoginForm',

  actions: {
    '[name=username]': 'keydown:checkUsername|keyup:checkUsername',
    '[name=password]': 'keydown:checkPassword',
    '[type=submit]':   'login'
  },

  checkUsername: function(event, input) {
    console.log('checking username');
  },

  checkPassword: function(event, input) {
    console.log('checking password');
  },

  login: function(event, input) {
    console.log('about to login');
    return false;
  }
});
```

Kanji supports inheritance in `actions`. A sub-class inherits actions from its parent. It can also redefine them, or add more actions.

``` js
Class(Kanji, {
  id: 'Dialog',

  actions: {
    self: 'mouseenter:fetch|mouseout:fetch'
  },

  fetch: function() {
  }
});

Class(Component, {
  id: 'LoginDialog',

  actions: {
    self: 'mousedown:contextMenu|mouseout:contextMenu'   // inherit 'mouseenter', override 'mouseout', add 'mousedown'
  },

  contextMenu: function() {
  }
});
```

#### listeners and notify(): Inter-component communication

A component uses `notify()` to send notifications.

``` js
Class(Kanji, {
  id: 'LoginForm',

  sayHi: function(event, target) {
    this.notify('logger:info', 'Say hi');
  },

  sayBye: function(event, target) {
    this.notify('logger:info', 'Say bye');
  }
});
```

Any components want to capture a notification need to implement a listener. For example, Logger listens to `log.info` to do logging:

``` js
Class(Kanji, {
  id: 'Logger',

  listeners: {
    'logger:info': function(message) {
      // do something when being notified
    }
  }
});
```

Play with a sample [online](http://jsfiddle.net/tannhu/YFCVX/3/).

Like `actions`, `listeners` in Kanji are inherited. If a parent component has some listeners, its child components will have them as default listeners. The child components are also able to override those inherited listeners.

#### Namespace and listeners

Instances of non-shared components are able to communicate directly via namespace mechanism. When a component is declared with a namespace, notifications sent intentionally to it must be postfixed by its namespace.

Give an example ([see online](http://jsfiddle.net/tannhu/AzCdA/3/)), we have a Timer component listens to `timer:show` event like this:

``` js
Class(Kanji, {
  id: 'Timer',

  init: function() {
    this.notify('timer:up');
  },

  listeners: {
    'timer:show': function() {
      // ...
    }
  }
});
```

When having declarations:

``` html
<script data-com="Timer/red" data-cfg="{ 'src': 'Red Timer' }"></script>
<script data-com="Timer" data-cfg="{ 'src': 'Timer1' }"></script>
<script data-com="Timer" data-cfg="{ 'src': 'Timer2' }"></script>
<script data-com="Timer" data-cfg="{ 'src': 'Timer3' }"></script>
```

The call from a component:

``` js
this.notify('timer:show');
```

notifies Timer1, Timer2, and Timer3, and Red Timer. The call:

``` js
this.notify('timer:show/red');
```

notifies Red Timer. But not Timer1, Timer2, and Timer3.

Listeners also support namespace.

``` js
Class(Kanji, {
  id: 'Listener',

  listeners: {
    /**
     * Listen to 'timer:up' event on Timer with namespace 'red'
     */
    'timer:up/red': function() {
    },

    /**
     * Listen to 'timer:up' event on all timers (Red timer include)
     */
    'timer:up': function() {
    }
  }
});
```

Kanji implements simple namespace notify/listeners routing. In the example above, if Listener component is also namespaced, then it won't work as expected.

I would recommend to prefix notification id by component name in lowercase (`Timer` -> `timer:up`) to make the code consistent and easy to lookup.

#### Inheritance and extending

Powered by [jsface](https://github.com/tannhu/jsface), Kanji allows multiple level inheritance. Subclass can override and invoke parent's actions (methods).

``` js
Component = Class(Kanji, {
  id: 'Component',

  openModal: function(event, target) {
    // ...
  }
});

Dialog = Class(Component, {
  id: 'Dialog',

  openModal: function(event, target) {
    // do something specifically for Dialog

    // call Component's openModal
    Dialog.$superp.openModal.call(this, event, target);
  }
});

LoginDialog = Class(Component, {
  id: 'LoginDialog',

  openModal: function(event, target) {
    // do something specifically for LoginDialog

    // call Dialog's openModal
    LoginDialog.$superp.openModal.call(this, event, target);
  }
});
```

#### Kanji internal notifications

Kanji has three internal notifications:

| Name                                | Description                             |
| ----------------------------------- | --------------------------------------- |
| com:not-found                       | Component implementation not found      |
| com:init                            | Re-init a component                     |
| com:config-not-wellformed           | Component configuration not well-formed |

`com:not-found` is fired when Kanji tries to initialize a component but its implementation is not found. Frameworks built on top of Kanji can capture this notification to do some handy stuff like fetching scripts or error reporting, etc.

You are able to force Kanji to initialize/re-init a component by sending a `com:init` notification.

**Syntax:**

``` js
Kanji.notify('com:init', container);
```

What is the use of `com:init` notification? It's useful when you detach HTML fragment of a component which has actions bound to costly events (like `mouseenter`, `mouseout`, `mousemove`, `mouseleave`, `mouseover`, `hover`) then later on attach the fragment. In such situation, you need to tell Kanji to re-initialize the component again in order to make event handlers work properly.

#### Kanji reserved properties

When implementing your components, note that Kanji reserves these properties for its internal use.

| Name                                | Required  |
| ----------------------------------- | --------- |
| id                                  | yes       |
| type                                | no        |
| lazy                                | no        |
| actions                             | no        |
| listeners                           | no        |
| namespace                           | no        |

## Best practice

I would recommend to define a root class component which includes all shared actions. Other components extend the root component (or its subclass) rather than inheriting from Kanji class directly. And it would be always better to group your components under a namespace instead of making a lot of global variables.

``` js
LI = {};
LI.Component = Class(Kanji, {
  id: 'Component'

  // shared actions
});

LI.LoginForm = Class(LI.Component, {
  id: 'LoginForm'

  // ...
});
```