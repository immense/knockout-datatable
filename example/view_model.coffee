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

    req = new XMLHttpRequest()
    req.open 'GET', '/api/cities', true

    req.onload = =>
      if req.status >= 200 and req.status < 400
        response = JSON.parse req.responseText
        rows = response.results.map (row) => new City @, row
        @table.rows rows
        @table.loading false
      else
        alert "Error communicating with server"
        @table.loading false

    req.onerror = =>
      alert "Error communicating with server"
      @table.loading false

    req.send()

    ko.applyBindings @
    $('.cloak').removeClass 'cloak'
    $('.bindingloader').remove()
