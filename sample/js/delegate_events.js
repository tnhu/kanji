Class(Kanji, {
  id: 'LoginForm',

  actions: {
    '[name=username]': 'keydown:checkUsername',
    '[name=password]': 'keydown:checkPassword',
    '[type=submit]':   'login'
  },

  init: function(form, config) {
    console.log('init');
  },

  checkUsername: function(event, input) {
    // do something when keydown event happens on username field
    console.log('onCheckUsername');
  },

  checkPassword: function(event, input) {
    // do something when keydown event happens on password field
    console.log('onCheckPassword');
  },

  login: function(event, input) {
    // do something when click event happens on button submit
    console.log('onLogin');

    // prevent form from submitting
    return false;
  }
});
