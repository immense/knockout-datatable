// a row in the datatable
class Row {
  match(filter) {
    return (
      this.foo().toLowerCase().indexOf(filter) >= 0 ||
      this.bar().toLowerCase().indexOf(filter) >= 0 ||
      this.baz .toLowerCase().indexOf(filter) >= 0
    );
  }

  constructor(view, row) {
    this.view = view;
    this.foo = ko.observable(row.foo);
    this.bar = ko.observable(row.bar);
    this.baz = row.baz;
  }
}

window.ExampleModel = class ExampleModel {
  constructor() {
    const tableOptions = {
      recordWord: 'thing',
      recordWordPlural: 'snakes', // This is optional. If left blank, the datatable will just append an 's' to recordWord
      sortDir: 'desc',
      sortField: 'foo',
      perPage: 15
    };

    this.exampleTable = new DataTable(tableOptions);
    this.exampleTable.loading(true);
    this.exampleTable.registerPaginationHandler(new ClientSidePaginationHandler());

    const rows = [
      {foo: 'foo', bar: 'bar', baz: 'baz'},
      {foo: 'bar', bar: 'baz', baz: 'foo'},
      {foo: 'baz', bar: 'foo', baz: 'bar'}
    ].map(row => new Row(this, row));

    this.exampleTable.rows(rows);
    this.exampleTable.loading(false);

    ko.applyBindings(this);

    Array.prototype.slice
      .call(document.getElementsByClassName('cloak'), 0)
      .forEach(el => el.classList.remove('cloak'));
  }
}
