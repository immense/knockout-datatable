# a row in the datatable
class Row

  constructor: (@view, row) ->
    @foo = ko.observable row.foo
    @bar = ko.observable row.bar
    @baz = row.baz

class @ExampleModel

  constructor: ->

    @exampleTable = ko.observable()

    $.getJSON "/api/rows", (response) =>
      if response.error?
        messenger.error 'Unable to retrieve rows.'
      else
        tableOptions =
          recordWord: 'thing'
          recordWordPlural: 'snakes' # This is optional. If left blank, the datatable will just append an 's' to recordWord
          sortDir: 'desc'
          sortField: 'foo'
          perPage: 15
          filterFn: (filter) ->
            filterRegex = new RegExp "#{filter}", 'i'
            (row) ->
              filterRegex.test(row.foo) or filterRegex.test(row.bar) or row.test(row.baz)

        rows = ko.observableArray response.results.map (row) => new Row @, row
        @exampleTable new DataTable rows, tableOptions

    @filter = ko.observable ''

    ko.computed =>
      filter = @filter()
      if @exampleTable()? then @exampleTable().filter filter
    .extend throttle: 250

    ko.applyBindings @