/* jshint newcap:false */
/* global Class, Kanji, console */

LI.Card = Class(LI.Component, {
  componentId   : 'Card',     // required
  componentType : 'shared',   // instance|shared (instance by default), optional

  onCheck: function(button, container) {
    console.log(button, container);
  }
});