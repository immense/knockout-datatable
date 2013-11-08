# a row in the datatable
class Row

  match: (filter) ->
    @foo().toLowerCase().indexOf(filter) >= 0 or
    @bar().toLowerCase().indexOf(filter) >= 0 or
    @baz  .toLowerCase().indexOf(filter) >= 0

  constructor: (@view, row) ->
    @foo = ko.observable row.foo
    @bar = ko.observable row.bar
    @baz = row.baz

class @ExampleModel

  constructor: ->

    tableOptions =
      recordWord: 'thing'
      recordWordPlural: 'snakes' # This is optional. If left blank, the datatable will just append an 's' to recordWord
      sortDir: 'desc'
      sortField: 'foo'
      perPage: 15

    @exampleTable = new DataTable [], tableOptions
    @exampleTable.loading true

    req = $.getJSON "/api/rows"

    req.done (response) =>
      if response.error?
        messenger.error 'Unable to retrieve rows.'
      else
        rows = response.results.map (row) => new Row @, row
        @exampleTable.rows rows
      @exampleTable.loading false

    req.fail (jqXHR, textStatus, errorThrown) =>
      messenger.error "Unknown error: #{errorThrown}"
      @exampleTable.loading false

    @filter = ko.observable ''

    ko.computed =>
      @exampleTable.filter @filter()
    .extend throttle: 250

    ko.applyBindings @
    $('.cloak').removeClass 'cloak'
    $('.bindingloader').remove()
