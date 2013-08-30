LI.Feedback = Class(LI.Component, {
  id  : 'Feedback',
  type: 'shared',

  /** @override */
  init: function(element, config) {
    this.log('Feeback: init');
  },

  onNameKeyup: function(target, event, container) {
    this.log('Feeback: onNameKeyup');
  },

  onNameKeydown: function(target, event, container) {
    this.log('Feeback: onNameKeydown char:', this.count++);
    return false;
  },

  onNameKeypress: function(target, event, container) {
    this.log('Feeback: onNameKeypress');
  },

  onMessageKeyup: function(target, event, container) {
    this.log('Feeback: onMessageKeyup');
  },

  onMessageKeydown: function(target, event, container) {
    this.log('Feeback: onMessageKeydown');
  },

  onMessageKeypress: function(target, event, container) {
    this.log('Feeback: onMessageKeypress');
  }
});