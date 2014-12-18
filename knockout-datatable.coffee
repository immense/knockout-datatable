class @DataTable

  pureComputed = ko.pureComputed or ko.computed

  primitiveCompare = (item1, item2) ->
    if not item2?
      not item1?
    else if item1?
      if typeof item1 is 'boolean'
        item1 is item2
      else
        item1.toString().toLowerCase().indexOf(item2.toString().toLowerCase()) >= 0 or item1 is item2
    else
      false

  constructor: (rows, options) ->

    # set some default options if none were passed in
    @options =
      recordWord: options.recordWord or 'record'
      recordWordPlural: options.recordWordPlural
      sortDir: options.sortDir or 'asc'
      sortField: options.sortField or undefined
      perPage: options.perPage or 15
      filterFn: options.filterFn or undefined
      unsortedClass: options.unsortedClass or ''
      descSortClass: options.descSortClass or ''
      ascSortClass: options.ascSortClass or ''

    @sortDir = ko.observable @options.sortDir
    @sortField = ko.observable @options.sortField
    @perPage = ko.observable @options.perPage
    @currentPage = ko.observable 1
    @filter = ko.observable ''
    @loading = ko.observable false
    @filtering = ko.observable false

    @filter.subscribe => @currentPage 1
    @perPage.subscribe => @currentPage 1

    @rows = ko.observableArray rows

    @rowAttributeMap = pureComputed =>
      rows = @rows()
      attrMap = {}

      if rows.length > 0
        row = rows[0]
        (attrMap[key.toLowerCase()] = key) for key of row when row.hasOwnProperty(key)

      attrMap

    @filteredRows = pureComputed =>
      @filtering true
      filter = @filter()

      rows = @rows.slice(0)

      if filter isnt ''
        filterFn = @filterFn(filter)
        rows = rows.filter(filterFn)

      if @sortField()? and @sortField() isnt ''
        rows.sort (a,b) =>
          aVal = ko.utils.unwrapObservable a[@sortField()]
          bVal = ko.utils.unwrapObservable b[@sortField()]
          if typeof aVal is 'string' then aVal = aVal.toLowerCase()
          if typeof bVal is 'string' then bVal = bVal.toLowerCase()
          if @sortDir() is 'asc'
            if aVal < bVal or aVal is '' or not aVal? then -1 else (if aVal > bVal or bVal is '' or not bVal? then 1 else 0)
          else
            if aVal < bVal or aVal is '' or not aVal? then 1 else (if aVal > bVal or bVal is '' or not bVal? then -1 else 0)
      else
        rows

      @filtering false

      rows

    @pagedRows = pureComputed =>
      pageIndex = @currentPage() - 1
      perPage = @perPage()
      @filteredRows().slice pageIndex * perPage, (pageIndex+1) * perPage

    @pages = pureComputed => Math.ceil @filteredRows().length / @perPage()

    @leftPagerClass = pureComputed => 'disabled' if @currentPage() is 1
    @rightPagerClass = pureComputed => 'disabled' if @currentPage() is @pages()

    # info
    @total = pureComputed => @filteredRows().length
    @from = pureComputed => (@currentPage() - 1) * @perPage() + 1
    @to = pureComputed =>
      to = @currentPage() * @perPage()
      if to > @total()
        @total()
      else
        to

    @recordsText = pureComputed =>
      pages = @pages()
      total = @total()
      from = @from()
      to = @to()
      recordWord = @options.recordWord
      recordWordPlural = @options.recordWordPlural or recordWord + 's'
      if pages > 1
        "#{from} to #{to} of #{total} #{recordWordPlural}"
      else
        "#{total} #{if total > 1 or total is 0 then recordWordPlural else recordWord}"

    # state info
    @showNoData  = pureComputed => @pagedRows().length is 0 and not @loading()
    @showLoading = pureComputed => @loading()

    # sort arrows
    @sortClass = (column) =>
      pureComputed =>
        if @sortField() is column
          'sorted ' +
          if @sortDir() is 'asc'
            @options.ascSortClass
          else
            @options.descSortClass
        else
          @options.unsortedClass

  toggleSort: (field) -> =>
    @currentPage 1
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

  pageClass: (page) -> pureComputed => 'active' if @currentPage() is page

  addRecord: (record) -> @rows.push record

  removeRecord: (record) -> @rows.remove record

  replaceRows: (rows) ->
    @rows rows
    @currentPage 1
    @filter undefined

  defaultMatch: (filter, row, attrMap) ->
    (val for key, val of attrMap).some (val) ->
      primitiveCompare((if ko.isObservable(row[val]) then row[val]() else row[val]), filter)

  filterFn: (filterVar) ->
    # If the user has defined a filterFn in the table options, use it
    # (for backwards compatibility with older datatable)
    if @options.filterFn?
      return @options.filterFn(filterVar)
    else
      # Split up filterVar into :-based conditionals and a filter
      [filter, specials] = [[],{}]
      filterVar.split(' ').forEach (word) ->
        if word.indexOf(':') >= 0
          words = word.split(':')
          specials[words[0]] = switch words[1].toLowerCase()
            when 'yes', 'true' then true
            when 'no', 'false' then false
            when 'blank', 'none', 'null', 'undefined' then undefined
            else words[1].toLowerCase()
        else
          filter.push word
      filter = filter.join(' ')
      defaultMatch = @defaultMatch
      return (row) =>
        conditionals = for key, val of specials
          do (key, val) =>
            if rowAttr = @rowAttributeMap()[key.toLowerCase()] # If the current key (lowercased) is in the attr map
              primitiveCompare((if ko.isObservable(row[rowAttr]) then row[rowAttr]() else row[rowAttr]), val)
            else # if the current instance doesn't have the "key" attribute, return false (i.e., it's not a match)
              false
        # console.log conditionals
        (false not in conditionals) and (if filter isnt '' then (if row.match? then row.match(filter) else defaultMatch(filter, row, @rowAttributeMap())) else true)
