Class(Kanji, {
  id: "LoginForm",

  init: function(form, config) {
    // do some initialization
    // form is jQuery object represents <form/>
    // config is the object passed from data-cfg
  },

  onCheckUsername: function(event, input, form) {
    // do something when keydown event happens on username field
    console.log('onCheckUsername');
  },

  onCheckPassword: function(event, input, form) {
    // do something when keydown event happens on password field
    console.log('onCheckPassword');
  },

  onLogin: function(event, input, form) {
    // do something when click event happens on button submit
    console.log('onLogin');

    // prevent form from submitting
    return false;
  }
});
