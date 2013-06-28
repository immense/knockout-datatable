class @DataTable

  constructor: (@rows, options) ->

    if not options.sortField?
      throw new Error 'sortField must be supplied.'

    # set some default options if none were passed in
    @options =
      recordWord: options.recordWord or 'record'
      sortDir: options.sortDir or 'asc'
      sortField: options.sortField
      perPage: options.perPage or 15
      filterFn: options.filterFn or ->

    console.log @rows()[0]

    @sortDir = ko.observable @options.sortDir
    @sortField = ko.observable @options.sortField
    @perPage = ko.observable @options.perPage
    @currentPage = ko.observable 1
    @filter = ko.observable ''

    @filter.subscribe => @currentPage 1

    @filteredRows = ko.computed =>
      filter = @filter()

      rows = @rows()

      if filter isnt ''
        rows = rows.filter @options.filterFn filter

      rows.sort (a,b) =>
        aVal = ko.utils.unwrapObservable a[@sortField()]
        bVal = ko.utils.unwrapObservable b[@sortField()]
        if @sortDir() is 'asc'
          if aVal < bVal then -1 else (if aVal > bVal then 1 else 0)
        else
          if aVal < bVal then 1 else (if aVal > bVal then -1 else 0)

    @pagedRows = ko.computed =>
      pageIndex = @currentPage() - 1
      perPage = @perPage()
      @filteredRows().slice pageIndex * perPage, (pageIndex+1) * perPage

    @pages = ko.computed => Math.ceil @filteredRows().length / @perPage()

    @leftPagerClass = ko.computed => 'disabled' if @currentPage() is 1
    @rightPagerClass = ko.computed => 'disabled' if @currentPage() is @pages()

    # info
    @total = ko.computed => @filteredRows().length
    @from = ko.computed => (@currentPage() - 1) * @perPage() + 1
    @to = ko.computed =>
      to = @currentPage() * @perPage()
      if to > @total()
        @total()
      else
        to

    @recordsText = ko.computed =>
      pages = @pages()
      total = @total()
      from = @from()
      to = @to()
      recordWord = @options.recordWord
      if pages > 1
        "#{from} to #{to} of #{total} #{recordWord}s"
      else
        s = if total > 1 or total is 0 then 's' else ''
        "#{total} #{recordWord}#{s}"

  toggleSort: (field) -> =>
    if @sortField() is field
      @sortDir if @sortDir() is 'asc' then 'desc' else 'asc'
    else
      @sortDir 'asc'
      @sortField field

  prevPage: ->
    page = @currentPage()
    if page isnt 1
      @currentPage page - 1

  nextPage: ->
    page = @currentPage()
    if page isnt @pages()
      @currentPage page + 1

  gotoPage: (page) -> => @currentPage page

  pageClass: (page) -> ko.computed => 'active' if @currentPage() is page