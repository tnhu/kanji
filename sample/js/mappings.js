var LoginForm = Class(Kanji, {
  id: 'LoginForm',
  lazy: false,
  type: 'shared',

  actions: {
    self: 'mouseenter:prefetchData|onClick|mouseout:defetchData',
    '.username': 'focus|keydown:checkUserName',
    '.password': 'focus1|keydown:checkPassword',
    '.submit': 'submit'
  },

  init: function($container, config) {
    console.log('init with config', config);
  },

  focus: function(event) {
    console.log('focus in....');
  },

  prefetchData: function(event) {
    console.log('prefetchData');
  },

  checkUserName: function(event) {
    console.log('checkUserName');
  },

  checkPassword: function(event) {
    console.log('checkPassword');
  },

  submit: function(event) {
    console.log('submit');
    return false;
  }
});

/*
instanceRefs[instanceId] = {
  instance: INSTANCE,
  1: 'prefetchData',
  2: {
    keydown: 'checkUserName'
  }
  3: 'checkPassword',
  4: 'submit'
};

<form data-com="LoginForm" data-instance="1">
  <input class="username" name="username" data-act="1/2"/>
</form>

*/