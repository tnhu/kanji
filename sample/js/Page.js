/* jshint newcap:false */
/* global Class, Kanji, console */

Class(LI.Component, {
  id   : 'Page',
  debug: false,

  /** @override */
  init: function(element, config) {
    this.debug = config.debug;
    this.log('Page: init(), debug:', this.debug);
  },

  onSwitchView: function(event, $button) {
    var ACTIVE = 'active',
        viewId = $button.attr("data-viewid");

    if (this.debug) {
      this.log('Page: onSwitchView(), viewId:', viewId);               /* log is inherited from LI.Component */
    }

    $('.view.active').removeClass(ACTIVE);
    $('.view.' + viewId).addClass(ACTIVE);
  },

  onPreloadStylist: function(event, $target) {
    console.log('Page: do some preloading for stylist...', event, $target);
  }
});