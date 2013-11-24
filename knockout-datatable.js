(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  this.DataTable = (function() {
    var primitiveCompare;

    primitiveCompare = function(item1, item2) {
      if (item2 == null) {
        return item1 == null;
      } else if ((item1 != null) && (item2 != null)) {
        if (typeof item1 === 'boolean') {
          return item1 === item2;
        } else {
          return item1.toString().toLowerCase().indexOf(item2.toString().toLowerCase()) >= 0 || item1 === item2;
        }
      } else {
        return false;
      }
    };

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
        filterFn: options.filterFn || void 0,
        sortIconClass: options.sortIconClass || 'icon-sort',
        sortDescIconClass: options.sortDescIconClass || 'icon-sort-down',
        sortAscIconClass: options.sortAscIconClass || 'icon-sort-up'
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
      this.rowAttributeMap = ko.computed(function() {
        var attrMap, key, row;
        rows = _this.rows();
        attrMap = {};
        if (rows.length > 0) {
          row = rows[0];
          for (key in row) {
            if (row.hasOwnProperty(key)) {
              attrMap[key.toLowerCase()] = key;
            }
          }
        }
        return attrMap;
      });
      this.filteredRows = ko.computed(function() {
        var filter, filterFn;
        filter = _this.filter();
        rows = _this.rows();
        if (filter !== '') {
          filterFn = _this.filterFn(filter);
          rows = rows.filter(filterFn);
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
              return _this.options.sortAscIconClass;
            } else {
              return _this.options.sortDescIconClass;
            }
          } else {
            return _this.options.sortIconClass;
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

    DataTable.prototype.defaultMatch = function(filter, row, attrMap) {
      var key, val;
      console.log(filter);
      console.log(row);
      console.log(attrMap);
      return ((function() {
        var _results;
        _results = [];
        for (key in attrMap) {
          val = attrMap[key];
          _results.push(val);
        }
        return _results;
      })()).some(function(val) {
        return primitiveCompare((ko.isObservable(row[val]) ? row[val]() : row[val]), filter);
      });
    };

    DataTable.prototype.filterFn = function(filterVar) {
      var attrMap, defaultMatch, filter, specials, _ref;
      if (this.options.filterFn != null) {
        return this.options.filterFn(filterVar);
      } else {
        _ref = [[], {}], filter = _ref[0], specials = _ref[1];
        filterVar.split(' ').forEach(function(word) {
          var words;
          if (word.indexOf(':') >= 0) {
            words = word.split(':');
            return specials[words[0]] = (function() {
              switch (words[1].toLowerCase()) {
                case 'yes':
                case 'true':
                  return true;
                case 'no':
                case 'false':
                  return false;
                case 'blank':
                case 'none':
                case 'null':
                case 'undefined':
                  return void 0;
                default:
                  return words[1].toLowerCase();
              }
            })();
          } else {
            return filter.push(word);
          }
        });
        filter = filter.join(' ');
        defaultMatch = this.defaultMatch;
        attrMap = this.rowAttributeMap();
        return function(row) {
          var conditionals, key, val;
          conditionals = (function() {
            var _results,
              _this = this;
            _results = [];
            for (key in specials) {
              val = specials[key];
              _results.push((function(key, val) {
                var rowAttr;
                if (rowAttr = attrMap[key.toLowerCase()]) {
                  return primitiveCompare((ko.isObservable(row[rowAttr]) ? row[rowAttr]() : row[rowAttr]), val);
                } else {
                  return false;
                }
              })(key, val));
            }
            return _results;
          }).call(this);
          return (__indexOf.call(conditionals, false) < 0) && (filter !== '' ? (row.match != null ? row.match(filter) : defaultMatch(filter, row, attrMap)) : true);
        };
      }
    };

    return DataTable;

  })();

}).call(this);
