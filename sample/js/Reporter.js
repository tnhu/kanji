Class(Kanji, {
  id  : 'Reporter',
  type: 'shared',
  lazy: false,

  listeners: {
    'com:not-found': function(componentId, $container) {
      console.log('Reporter: Component', componentId, ': implementation not found. Sending report...');
    }
  }
});