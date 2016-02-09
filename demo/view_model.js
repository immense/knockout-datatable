'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// a row in the datatable

var Row = function () {
  _createClass(Row, [{
    key: 'match',
    value: function match(filter) {
      return this.foo().toLowerCase().indexOf(filter) >= 0 || this.bar().toLowerCase().indexOf(filter) >= 0 || this.baz.toLowerCase().indexOf(filter) >= 0;
    }
  }]);

  function Row(view, row) {
    _classCallCheck(this, Row);

    this.view = view;
    this.foo = ko.observable(row.foo);
    this.bar = ko.observable(row.bar);
    this.baz = row.baz;
  }

  return Row;
}();

window.ExampleModel = function ExampleModel() {
  var _this = this;

  _classCallCheck(this, ExampleModel);

  var tableOptions = {
    recordWord: 'thing',
    recordWordPlural: 'snakes', // This is optional. If left blank, the datatable will just append an 's' to recordWord
    sortDir: 'desc',
    sortField: 'foo',
    perPage: 15
  };

  this.exampleTable = new DataTable(tableOptions);
  this.exampleTable.loading(true);
  this.exampleTable.registerPaginationHandler(new ClientSidePaginationHandler());

  var rows = [{ foo: 'foo', bar: 'bar', baz: 'baz' }, { foo: 'bar', bar: 'baz', baz: 'foo' }, { foo: 'baz', bar: 'foo', baz: 'bar' }].map(function (row) {
    return new Row(_this, row);
  });

  this.exampleTable.rows(rows);
  this.exampleTable.loading(false);

  ko.applyBindings(this);

  Array.prototype.slice.call(document.getElementsByClassName('cloak'), 0).forEach(function (el) {
    return el.classList.remove('cloak');
  });
};
