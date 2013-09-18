/* jshint newcap:false */
/* global Class, Kanji, console */

Class(LI.Component, {
  id   : 'Page',
  debug: false,

  actions: {
    self          : 'mouseenter:preloadStylist',
    '.bt-stylist' : 'switchView',
    '.bt-blog'    : 'switchView',
    '.bt-featured': 'switchView',
    '.bt-wardrope': 'switchView'
  },

  init: function(element, config) {
    this.debug = config.debug;
    this.log('Page: init(), debug:', this.debug);
  },

  switchView: function(event, $button) {
    var ACTIVE = 'active',
        viewId = $button.attr("data-viewid");

    if (this.debug) {
      this.log('Page: onSwitchView(), viewId:', viewId); /* log is inherited from LI.Component */
    }

    $('.view.active').removeClass(ACTIVE);
    $('.view.' + viewId).addClass(ACTIVE);
  },

  preloadStylist: function(event, $target) {
    console.log('Page: do some preloading for stylist...', event, $target);
  }
});