/* jshint newcap:false */
/* global Class, Kanji, console */

Class(LI.Component, {
  componentId: 'Page',

  debug: false,

  /** @override */
  init: function(element, config) {
    this.debug = config.debug;
    this.log('Page: init(), debug:', this.debug);
  },

  onSwitchView: function(button, container, viewId) {
    var ACTIVE = 'active';

    if (this.debug) {
      this.log('Page: onSwitchView(), viewId:', viewId);               /* log is inherited from LI.Component */
    }

    $('.view.active').removeClass(ACTIVE);
    $('.view.' + viewId).addClass(ACTIVE);
  }
});