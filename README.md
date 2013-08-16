Kanji 感じ
==========

[![Build Status](https://travis-ci.org/tnhu/kanji.png?branch=master)](https://travis-ci.org/tnhu/kanji)

## What is Kanji?

Kanji is a web declarative component framework. The idea behind Kanji is when you develop a web component, HTML and CSS come first, then JavaScript only gets involved when user interacting happens. Kanji's mission is to help you to build web components fast, easy, elegant, extensible, and testable.

Kanji is tiny. When minimized and gziped, standalone version is less than 1K, full version including dependencies (without jQuery) is around 1.8K.

## Setup

In your webpage, import Kanji and its dependencies separately:

``` html
<script src="lib/jquery.js" type="text/javascript"></script>
<script src="lib/jsface.js" type="text/javascript"></script>
<script src="lib/jsface.ready.js" type="text/javascript"></script>
<script src="kanji.js" type="text/javascript"></script>
```

Or import Kanji full which includes jsface and jsface.ready:

``` html
<script src="lib/jquery.js" type="text/javascript"></script>
<script src="kanji-full.js" type="text/javascript"></script>
```

## Trivial sample

First, assume you have an HTML element like below. You declare it as a component by specifying attribute data-com="YourComponentId".

``` html
<div data-com="MyComponent">
  <button data-act="hi">Say hi</button>
</div>
```

And then capture event when users click (or touch) on the button in your component's implementation.

``` js
Class(Kanji, {
  componentId: "MyComponent",

  onHi: function() {
    alert("Hello World!");
  }
});
```

## Declarative API

### Declare a component

Simply add data-com="YourComponentId" into any HTML elements. For example:

``` html
<div data-com="MyExampleComponent">
</div>
```

By default, all components are lazy instantiated. Meaning the JavaScript instance of the component will be created on demand, whenever an event happens inside it. If you want your component to be initialized when its DOM element is ready, add data-lazy="false".

``` html
<div data-com="MyExampleComponent" data-lazy="false">
</div>
```

If you want to pass an extra parameter/configuration into your component. Declare it under data-cfg="VALUE". VALUE can be anything.

``` html
<div data-com="MyExampleComponent" data-lazy="false" data-cfg="{ 'foo': 'bar' }">
</div>
```

A component can include other components.

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

### Declare actions

Actions happen when users click (or touch) on an element inside a component. By default, button and elements have role="button" are action targets. You declare behavior of an action by specifying data-act="actionName".

``` html
<div data-com="MyExampleComponent" data-lazy="false">
  <button data-act="hi">Say hi</button>
  <a role="button" data-act="bye">Say bye</a>
</div>
```

Like component declaration, you can add an extra parameter/configuration to your action.

``` html
<div data-com="MyExampleComponent" data-lazy="false">
  <button data-act="hi" data-cfg="">Say hi</button>
  <a role="button" data-act="bye" data-cfg="['foo', 'bar']">Say bye</a>
</div>
```

## Component API

A component is a class extends from Kanji with a unique componentId.

``` js
MyExampleComponent = Class(Kanji, {
  componentId: "MyExampleComponent"
});
```

If you want to handle something when component DOM is ready. Implement init() method:

``` js
MyExampleComponent = Class(Kanji, {
  componentId: "MyExampleComponent",

  init: function(container, config) {
  }
});
```

In which:

* container: jQuery object represents the component element (HTML)
* config: configuration declared in the component (if any)

Map your declared actions to your component's methods by implementing "on" + action methods. When an action accurs, there are three parameters will be passed to its handler:

* button: jQuery object represents the button (target element)
* container: jQuery object represents the component element
* config: configuration declared in the button (if any)

``` js
MyExampleComponent = Class(Kanji, {
  componentId: "MyExampleComponent",

  onHi: function(button, container, config) {
  },

  onBye: function(button, container, config) {
  }
});
```

## Shared component instance

By default, an instance of the component class will be created per each declared DOM elememt. Kanji supports shared instance where only one instance of the component is instantiated for all declared DOM elements. You can enable shared instance by adding componentType="shared" when declaring your component.

``` js
MyExampleComponent = Class(Kanji, {
  componentId: "MyExampleComponent",
  componentType: "shared"
});
```

## Inheritance and extending

Powered by [jsface](https://github.com/tannhu/jsface), Kanji allows multiple level inheritance. Subclass can override and invoke parent's actions (methods).

``` js
Component = Class(Kanji, {
  componentId: "Component",

  onModal: function(button, container, config) {
    // ...
  }
});

Dialog = Class(Component, {
  componentId: "Dialog",

  onModal: function(button, container, config) {
    // do something specificly for Dialog

    // call Component's onModal
    Dialog.$superp.onModal.call(this, button, container, config);
  }
});

LoginDialog = Class(Component, {
  componentId: "LoginDialog",

  onModal: function(button, container, config) {
    // do something specificly for LoginDialog

    // call Dialog's onModal
    LoginDialog.$superp.onModal.call(this, button, container, config);
  }
});
```

## More about instantiation

By default, Kanji does not do anything until there's a user interaction happens inside the component's actual DOM representation. If there are multiple declarations of the same component on the page, Kanji instantiates only one instance of the component to handle in that DOM's scope. Imaging you have 100 declarations of a component named "Card":

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

When you click button "Say hi" on the first card (or any card), first instance of Card is instantiated. When you click "Say hi" on the second card, another instance is instantiated.

What happens if you specify componentType="shared" in Card? When you first click "Say hi" on any card, one instance of Card is instantiated and this instance will be shared accross all the cards inside the page, meaning when you click the button on another card, the shared instance will handle the event.

Kanji has a garbage collector. When all the DOM elements represent a component are detached, all of its instances will be removed. In the other word, components can be attached and detached as will.

## Best practice

I would recommend to define a root class component which includes all shared actions in it. Other components extend the root component (or its subclass) rather than inheriting from Kanji class directly. And it would be always better to group your components under a namespace instead of making a lot of global variables.

``` js
LI = {};
LI.Component = Class(Kanji, {
  componentId: "Component",

  // shared actions
});

LI.MyExampleComponent = Class(LI.Component, {
  componentId: "MyExampleComponent",

  // ...
});
```

## License

Copyright (c) 2013 Tan Nhu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.