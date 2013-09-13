(function() {
  this.DataTable = (function() {
    function DataTable(rows, options) {
      var _this = this;
      if (options.sortField == null) {
        throw new Error('sortField must be supplied.');
      }
      this.options = {
        recordWord: options.recordWord || 'record',
        recordWordPlural: options.recordWordPlural,
        sortDir: options.sortDir || 'asc',
        sortField: options.sortField,
        perPage: options.perPage || 15,
        filterFn: options.filterFn || function() {}
      };
      this.sortDir = ko.observable(this.options.sortDir);
      this.sortField = ko.observable(this.options.sortField);
      this.perPage = ko.observable(this.options.perPage);
      this.currentPage = ko.observable(1);
      this.filter = ko.observable('');
      this.loading = ko.observable(false);
      this.filter.subscribe(function() {
        return _this.currentPage(1);
      });
      this.rows = ko.observableArray(rows);
      this.filteredRows = ko.computed(function() {
        var filter;
        filter = _this.filter();
        rows = _this.rows();
        if (filter !== '') {
          rows = rows.filter(_this.options.filterFn(filter));
        }
        return rows.sort(function(a, b) {
          var aVal, bVal;
          aVal = ko.utils.unwrapObservable(a[_this.sortField()]);
          bVal = ko.utils.unwrapObservable(b[_this.sortField()]);
          if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
          }
          if (typeof bVal === 'string') {
            bVal = bVal.toLowerCase();
          }
          if (_this.sortDir() === 'asc') {
            if (aVal < bVal || aVal === '' || (aVal == null)) {
              return -1;
            } else {
              if (aVal > bVal || bVal === '' || (bVal == null)) {
                return 1;
              } else {
                return 0;
              }
            }
          } else {
            if (aVal < bVal || aVal === '' || (aVal == null)) {
              return 1;
            } else {
              if (aVal > bVal || bVal === '' || (bVal == null)) {
                return -1;
              } else {
                return 0;
              }
            }
          }
        });
      });
      this.pagedRows = ko.computed(function() {
        var pageIndex, perPage;
        pageIndex = _this.currentPage() - 1;
        perPage = _this.perPage();
        return _this.filteredRows().slice(pageIndex * perPage, (pageIndex + 1) * perPage);
      });
      this.pages = ko.computed(function() {
        return Math.ceil(_this.filteredRows().length / _this.perPage());
      });
      this.leftPagerClass = ko.computed(function() {
        if (_this.currentPage() === 1) {
          return 'disabled';
        }
      });
      this.rightPagerClass = ko.computed(function() {
        if (_this.currentPage() === _this.pages()) {
          return 'disabled';
        }
      });
      this.total = ko.computed(function() {
        return _this.filteredRows().length;
      });
      this.from = ko.computed(function() {
        return (_this.currentPage() - 1) * _this.perPage() + 1;
      });
      this.to = ko.computed(function() {
        var to;
        to = _this.currentPage() * _this.perPage();
        if (to > _this.total()) {
          return _this.total();
        } else {
          return to;
        }
      });
      this.recordsText = ko.computed(function() {
        var from, pages, recordWord, recordWordPlural, to, total;
        pages = _this.pages();
        total = _this.total();
        from = _this.from();
        to = _this.to();
        recordWord = _this.options.recordWord;
        recordWordPlural = _this.options.recordWordPlural || recordWord + 's';
        if (pages > 1) {
          return "" + from + " to " + to + " of " + total + " " + recordWordPlural;
        } else {
          return "" + total + " " + (total > 1 || total === 0 ? recordWordPlural : recordWord);
        }
      });
      this.showNoData = ko.computed(function() {
        return _this.pagedRows().length === 0 && !_this.loading();
      });
      this.showLoading = ko.computed(function() {
        return _this.loading();
      });
      this.sortClass = function(column) {
        return ko.computed(function() {
          if (_this.sortField() === column) {
            if (_this.sortDir() === 'asc') {
              return 'icon-sort-up';
            } else {
              return 'icon-sort-down';
            }
          } else {
            return 'icon-sort';
          }
        });
      };
    }

    DataTable.prototype.toggleSort = function(field) {
      var _this = this;
      return function() {
        if (_this.sortField() === field) {
          return _this.sortDir(_this.sortDir() === 'asc' ? 'desc' : 'asc');
        } else {
          _this.sortDir('asc');
          return _this.sortField(field);
        }
      };
    };

    DataTable.prototype.prevPage = function() {
      var page;
      page = this.currentPage();
      if (page !== 1) {
        return this.currentPage(page - 1);
      }
    };

    DataTable.prototype.nextPage = function() {
      var page;
      page = this.currentPage();
      if (page !== this.pages()) {
        return this.currentPage(page + 1);
      }
    };

    DataTable.prototype.gotoPage = function(page) {
      var _this = this;
      return function() {
        return _this.currentPage(page);
      };
    };

    DataTable.prototype.pageClass = function(page) {
      var _this = this;
      return ko.computed(function() {
        if (_this.currentPage() === page) {
          return 'active';
        }
      });
    };

    return DataTable;

  })();

}).call(this);
