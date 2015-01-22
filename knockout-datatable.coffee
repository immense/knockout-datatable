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

    if not options
      unless rows instanceof Array
        options = rows
        rows = []
      else
        options = {}

    # set some default options if none were passed in
    @options =
      recordWord:       options.recordWord    or 'record'
      recordWordPlural: options.recordWordPlural
      sortDir:          options.sortDir       or 'asc'
      sortField:        options.sortField     or undefined
      perPage:          options.perPage       or 15
      filterFn:         options.filterFn      or undefined
      unsortedClass:    options.unsortedClass or ''
      descSortClass:    options.descSortClass or ''
      ascSortClass:     options.ascSortClass  or ''

    @initObservables()

    if (serverSideOpts = options.serverSidePagination) and serverSideOpts.enabled
      unless serverSideOpts.path and serverSideOpts.loader
        throw new Error("`path` or `loader` missing from `serverSidePagination` object")
      @options.paginationPath  = serverSideOpts.path
      @options.resultHandlerFn = serverSideOpts.loader

      # if server-side pagination enabled, we don't care about the initial rows
      @initWithServerSidePagination()

    else
      @initWithClientSidePagination(rows)

  initObservables: ->
    @sortDir     = ko.observable @options.sortDir
    @sortField   = ko.observable @options.sortField
    @perPage     = ko.observable @options.perPage
    @currentPage = ko.observable 1
    @filter      = ko.observable ''
    @loading     = ko.observable false
    @rows        = ko.observableArray []

  initWithClientSidePagination: (rows) ->
    @filtering = ko.observable false

    @filter.subscribe => @currentPage 1
    @perPage.subscribe => @currentPage 1

    @rows rows

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

    .extend {rateLimit: 50, method: 'notifyWhenChangesStop'}

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

    @addRecord = (record) => @rows.push record

    @removeRecord = (record) =>
      @rows.remove record
      if @pagedRows().length is 0
        @prevPage()

    @replaceRows = (rows) =>
      @rows rows
      @currentPage 1
      @filter undefined

    _defaultMatch = (filter, row, attrMap) ->
      (val for key, val of attrMap).some (val) ->
        primitiveCompare((if ko.isObservable(row[val]) then row[val]() else row[val]), filter)

    @filterFn = @options.filterFn or (filterVar) =>
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
      return (row) =>
        conditionals = for key, val of specials
          do (key, val) =>
            if rowAttr = @rowAttributeMap()[key.toLowerCase()] # If the current key (lowercased) is in the attr map
              primitiveCompare((if ko.isObservable(row[rowAttr]) then row[rowAttr]() else row[rowAttr]), val)
            else # if the current instance doesn't have the "key" attribute, return false (i.e., it's not a match)
              false
        (false not in conditionals) and (if filter isnt '' then (if row.match? then row.match(filter) else _defaultMatch(filter, row, @rowAttributeMap())) else true)

  initWithServerSidePagination: ->
    _getDataFromServer = (data, cb) =>
      url = "#{@options.paginationPath}?#{("#{encodeURIComponent(key)}=#{encodeURIComponent(val)}" for key, val of data).join('&')}"

      req = new XMLHttpRequest()
      req.open 'GET', url, true
      req.setRequestHeader 'Content-Type', 'application/json'

      req.onload = =>
        if req.status >= 200 and req.status < 400
          cb null, JSON.parse(req.responseText)
        else
          cb new Error("Error communicating with server")

      req.onerror = => cb new Error "Error communicating with server"

      req.send()

    _gatherData = (perPage, currentPage, filter, sortDir, sortField) ->
      data =
        perPage: perPage
        page:    currentPage

      if filter? and filter isnt ''
        data.filter  = filter

      if sortDir? and sortDir isnt '' and sortField? and sortField isnt ''
        data.sortDir = sortDir
        data.sortBy  = sortField

      return data

    @filtering = ko.observable false
    @pagedRows = ko.observableArray []
    @numFilteredRows = ko.observable 0

    @filter.subscribe => @currentPage 1
    @perPage.subscribe => @currentPage 1

    ko.computed =>
      @loading true
      @filtering true

      data = _gatherData @perPage(), @currentPage(), @filter(), @sortDir(), @sortField()

      _getDataFromServer data, (err, response) =>
        @loading false
        @filtering false
        if err then return console.log err

        {total, results} = response
        @numFilteredRows total
        @pagedRows results.map(@options.resultHandlerFn)

    .extend {rateLimit: 500, method: 'notifyWhenChangesStop'}

    @pages = pureComputed => Math.ceil @numFilteredRows() / @perPage()

    @leftPagerClass = pureComputed => 'disabled' if @currentPage() is 1
    @rightPagerClass = pureComputed => 'disabled' if @currentPage() is @pages()

    # info
    @from = pureComputed => (@currentPage() - 1) * @perPage() + 1
    @to = pureComputed =>
      to = @currentPage() * @perPage()
      if to > (total = @numFilteredRows())
        total
      else
        to

    @recordsText = pureComputed =>
      pages = @pages()
      total = @numFilteredRows()
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

    @addRecord = ->
      throw new Error("#addRecord() not applicable with serverSidePagination enabled")

    @removeRecord = ->
      throw new Error("#removeRecord() not applicable with serverSidePagination enabled")

    @replaceRows = ->
      throw new Error("#replaceRows() not applicable with serverSidePagination enabled")

    @refreshData = =>
      @loading true
      @filtering true

      data = _gatherData @perPage(), @currentPage(), @filter(), @sortDir(), @sortField()

      _getDataFromServer data, (err, response) =>
        @loading false
        @filtering false
        if err then return console.log err

        {total, results} = response
        @numFilteredRows total
        @pagedRows results.map(@options.resultHandlerFn)

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
