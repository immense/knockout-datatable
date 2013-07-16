# a row in the datatable
class Row

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
      filterFn: (filter) ->
        filterRegex = new RegExp "#{filter}", 'i'
        (row) ->
          filterRegex.test(row.foo) or filterRegex.test(row.bar) or row.test(row.baz)

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
      filter = @filter()
      if @exampleTable()? then @exampleTable().filter filter
    .extend throttle: 250

    ko.applyBindings @
    $('.cloak').removeClass 'cloak'
    $('.bindingloader').remove()