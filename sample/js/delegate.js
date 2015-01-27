Class(Kanji, {
  id: 'TableView',

  actions: {
    '.row': 'rowEventHandler'
  },

  delegate: {
    numberOfRow: function(tableView) {           // required method
      throw 'numberOfRow delegation required';
    },

    rowAtIndex: function(tableView, index) {
      return 0;
    },

    rowSelected: function(tableView, event, $row) {}
  },

  init: function($container, config) {
  },

  render: function($container) {
    var delegate = this.delegate;
        rows     = delegate.numberOfRow(this),
        index    = 0,
        output   = [],
        html;

    while (count < rows) {
      html = delegate.cellAtIndex(this, index);
      output.push(html);
    }

    $(output.join('')).appendTo($container);
  },

  rowEventHandler: function(event, $target, $container) {
    this.delegate.rowSelected(this, event, $target);
  }
});

Class(Kanji, {
  id: 'DelegatePage',

  TableViewDelegate: {
    numberOfRow: function(tableView) {
      return 10;
    },

    rowAtIndex: function(tableView, index) {
      return '<div class="row">Row ' + index + '</div>';
    },

    rowSelected: function(tableView, event, $row) {
      alert('Row ' + index + ' selected');
    }
  }
});