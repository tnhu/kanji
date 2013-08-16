LI.StylistView = Class(LI.Component, {
  componentId  : 'StylistView',
  componentType: 'shared',

  /** @override */
  init: function(element, config) {
    this.log('StylistView: init');
  },

  onFeedback: function() {
    this.log('StylistView: Leave a feedback');
  },

  onEmail: function() {
    this.log('StylistView: Send email to stylist');
  },

  onCall: function() {
    this.log('StylistView: Make a call');
  },

  onProfile: function() {
    this.log('StylistView: View stylist\' profile');
  }
});