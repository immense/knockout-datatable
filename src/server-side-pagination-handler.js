class ServerSidePaginationHandler extends PaginationHandler {

  constructor(paginationPath, resultHandlerFn) {
    super();
    this.paginationPath = paginationPath;
    this.resultHandlerFn = resultHandlerFn;
  }

  getData() {
    const _getDataFromServer = (data, cb) => {
      const url = `${this.options.paginationPath}?${
        [
          for ([key, val] of Iterable(data))
            `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
        ].join('&')
      }`;

      return fetch(url).then(response => response.json());
    }




    _gatherData = function(perPage, currentPage, filter, sortDir, sortField) {
      var data;
      data = {
        perPage: perPage,
        page: currentPage
      };
      if (filter || filter === 0) {
        data.filter = filter;
      }
      if ((sortDir || sortDir === 0) && (sortField || sortField === 0)) {
        data.sortDir = sortDir;
        data.sortBy = sortField;
      }
      return data;
    };
    this.filtering = ko.observable(false);
    this.pagedRows = ko.observableArray([]);
    this.numFilteredRows = ko.observable(0);
    this.filter.subscribe((function(_this) {
      return function() {
        return _this.currentPage(1);
      };
    })(this));
    this.perPage.subscribe((function(_this) {
      return function() {
        return _this.currentPage(1);
      };
    })(this));
    ko.computed((function(_this) {
      return function() {
        var data;
        _this.loading(true);
        _this.filtering(true);
        data = _gatherData(_this.perPage(), _this.currentPage(), _this.filter(), _this.sortDir(), _this.sortField());
        return _getDataFromServer(data, function(err, response) {
          var results, total;
          _this.loading(false);
          _this.filtering(false);
          if (err) {
            return console.log(err);
          }
          total = response.total;
          results = response.results;
          _this.numFilteredRows(total);
          return _this.pagedRows(results.map(_this.options.resultHandlerFn));
        });
      };
    })(this)).extend({
      rateLimit: 500,
      method: 'notifyWhenChangesStop'
    });
    this.pages = pureComputed((function(_this) {
      return function() {
        return Math.ceil(_this.numFilteredRows() / _this.perPage());
      };
    })(this));
    this.leftPagerClass = pureComputed((function(_this) {
      return function() {
        if (_this.currentPage() === 1) {
          return 'disabled';
        }
      };
    })(this));
    this.rightPagerClass = pureComputed((function(_this) {
      return function() {
        if (_this.currentPage() === _this.pages()) {
          return 'disabled';
        }
      };
    })(this));
    this.from = pureComputed((function(_this) {
      return function() {
        return (_this.currentPage() - 1) * _this.perPage() + 1;
      };
    })(this));
    this.to = pureComputed((function(_this) {
      return function() {
        var to, total;
        to = _this.currentPage() * _this.perPage();
        if (to > (total = _this.numFilteredRows())) {
          return total;
        } else {
          return to;
        }
      };
    })(this));
    this.recordsText = pureComputed((function(_this) {
      return function() {
        var from, pages, recordWord, recordWordPlural, to, total;
        pages = _this.pages();
        total = _this.numFilteredRows();
        from = _this.from();
        to = _this.to();
        recordWord = _this.options.recordWord;
        recordWordPlural = _this.options.recordWordPlural || recordWord + 's';
        if (pages > 1) {
          return "" + from + " to " + to + " of " + total + " " + recordWordPlural;
        } else {
          return "" + total + " " + (total > 1 || total === 0 ? recordWordPlural : recordWord);
        }
      };
    })(this));
    this.showNoData = pureComputed((function(_this) {
      return function() {
        return _this.pagedRows().length === 0 && !_this.loading();
      };
    })(this));
    this.showLoading = pureComputed((function(_this) {
      return function() {
        return _this.loading();
      };
    })(this));
    this.sortClass = (function(_this) {
      return function(column) {
        return pureComputed(function() {
          if (_this.sortField() === column) {
            return 'sorted ' + (_this.sortDir() === 'asc' ? _this.options.ascSortClass : _this.options.descSortClass);
          } else {
            return _this.options.unsortedClass;
          }
        });
      };
    })(this);
    this.addRecord = function() {
      throw new Error("#addRecord() not applicable with serverSidePagination enabled");
    };
    this.removeRecord = function() {
      throw new Error("#removeRecord() not applicable with serverSidePagination enabled");
    };
    this.replaceRows = function() {
      throw new Error("#replaceRows() not applicable with serverSidePagination enabled");
    };
    this.refreshData = (function(_this) {
      return function() {
        var data;
        _this.loading(true);
        _this.filtering(true);
        data = _gatherData(_this.perPage(), _this.currentPage(), _this.filter(), _this.sortDir(), _this.sortField());
        return _getDataFromServer(data, function(err, response) {
          var results, total;
          _this.loading(false);
          _this.filtering(false);
          if (err) {
            return console.log(err);
          }
          total = response.total;
          results = response.results;
          _this.numFilteredRows(total);
          return _this.pagedRows(results.map(_this.options.resultHandlerFn));
        });
      };
    })(this);
  }
}
