LI.Stylist = Class(LI.Component, {
  id  : 'Stylist',
  type: 'shared',
  lazy: false,

  actions: {
    self          : 'mouseenter:preloadStylist',
    '.bt-feedback': 'feedback',
    '.bt-email'   : 'email|mouseenter,mouseout:trackingEmail',
    '.bt-call'    : 'call',
    '.bt-profile' : 'profile'
  },

  init: function(element, config) {
    this.log('Stylist: init');
  },

  feedback: function() {
    this.log('Stylist: Leave a feedback');
  },

  email: function() {
    this.log('Stylist: Send email to stylist');
  },

  call: function() {
    this.log('Stylist: Make a call');
  },

  profile: function() {
    this.log('Stylist: View stylist\'s profile');
  },

  preloadStylist: function(event, $container) {
    this.log('Stylist: onPreloadStylist. Do something when mouseenter');
  }
});