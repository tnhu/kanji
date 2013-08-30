Class(Kanji, {
  id  : 'Reporter',
  type: 'shared',

  listeners: {
    'com:not-found': function(componentId, $container) {
      console.log('Reporter: Component', componentId, ': implementation not found. Sending report...');
    }
  }
});