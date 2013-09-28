Class(Kanji, {
  id: 'LoginForm',

  actions: {
    '[name=username]': 'keydown:checkUsername',
    '[name=password]': 'keydown:checkPassword',
    '[type=submit]':   'login'
  },

  init: function(form, config) {
    console.log('init ', config);
    this.id = config;
  },

  checkUsername: function(event, input) {
    // do something when keydown event happens on username field
    console.log('onCheckUsername from', this.id);
  },

  checkPassword: function(event, input) {
    // do something when keydown event happens on password field
    console.log('onCheckPassword from', this.id);
  },

  login: function(event, input) {
    // do something when click event happens on button submit
    console.log('onLogin from', this.id);

    // prevent form from submitting
    return false;
  }
});
