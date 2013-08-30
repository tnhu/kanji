LI.Stylist = Class(LI.Component, {
  id  : 'Stylist',
  type: 'shared',

  /** @override */
  init: function(element, config) {
    this.log('Stylist: init');
  },

  onFeedback: function() {
    this.log('Stylist: Leave a feedback');
  },

  onEmail: function() {
    this.log('Stylist: Send email to stylist');
  },

  onCall: function() {
    this.log('Stylist: Make a call');
  },

  onProfile: function() {
    this.log('Stylist: View stylist\'s profile');
  },

  onPreloadStylist: function(event, $container) {
    this.log('Stylist: onPreloadStylist. Do something when mouseenter');
  }
});