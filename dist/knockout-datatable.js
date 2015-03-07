"use strict";

(function () {

  this.DataTable = (function () {
    var primitiveCompare, pureComputed;

    pureComputed = ko.pureComputed || ko.computed;

    primitiveCompare = function (item1, item2) {
      if (item2 === null || item2 === undefined) {
        return item1 === null || item1 === undefined;
      } else if (item1 !== null && item1 !== undefined) {
        if ("boolean" === typeof item1) {
          return item1 === item2;
        } else {
          return item1.toString().toLowerCase().indexOf(item2.toString().toLowerCase()) >= 0 || item1 === item2;
        }
      } else {
        return false;
      }
    };

    function DataTable(rows, options) {
      var serverSideOpts;
      if (!options) {
        if (!(rows instanceof Array)) {
          options = rows;
          rows = [];
        } else {
          options = {};
        }
      }
      this.options = {
        recordWord: options.recordWord || "record",
        recordWordPlural: options.recordWordPlural,
        sortDir: options.sortDir || "asc",
        sortField: options.sortField || void 0,
        perPage: options.perPage || 15,
        filterFn: options.filterFn || void 0,
        unsortedClass: options.unsortedClass || "",
        descSortClass: options.descSortClass || "",
        ascSortClass: options.ascSortClass || ""
      };
      this.initObservables();
      if ((serverSideOpts = options.serverSidePagination) && serverSideOpts.enabled) {
        if (!(serverSideOpts.path && serverSideOpts.loader)) {
          throw new Error("`path` or `loader` missing from `serverSidePagination` object");
        }
        this.options.paginationPath = serverSideOpts.path;
        this.options.resultHandlerFn = serverSideOpts.loader;
        this.initWithServerSidePagination();
      } else {
        this.initWithClientSidePagination(rows);
      }
    }

    DataTable.prototype.initObservables = function () {
      this.sortDir = ko.observable(this.options.sortDir);
      this.sortField = ko.observable(this.options.sortField);
      this.perPage = ko.observable(this.options.perPage);
      this.currentPage = ko.observable(1);
      this.filter = ko.observable("");
      this.loading = ko.observable(false);
      this.rows = ko.observableArray([]);
    };

    DataTable.prototype.initWithClientSidePagination = function (rows) {
      var _defaultMatch,
          self = this;
      this.filtering = ko.observable(false);
      this.filter.subscribe(function () {
        self.currentPage(1);
      });
      this.perPage.subscribe(function () {
        self.currentPage(1);
      });
      this.rows(rows);
      this.rowAttributeMap = pureComputed((function (_this) {
        return function () {
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
        };
      })(this));
      this.filteredRows = pureComputed((function (_this) {
        return function () {
          var filter, filterFn, sortField;
          _this.filtering(true);
          filter = _this.filter();
          rows = _this.rows.slice(0);
          if (filter !== "") {
            filterFn = _this.filterFn(filter);
            rows = rows.filter(filterFn);
          }
          if ((sortField = _this.sortField()) || sortField === 0) {
            rows.sort(function (a, b) {
              var aVal, bVal;
              aVal = ko.utils.unwrapObservable(a[sortField]);
              bVal = ko.utils.unwrapObservable(b[sortField]);
              if ("string" === typeof aVal) {
                aVal = aVal.toLowerCase();
              }
              if ("string" == typeof bVal) {
                bVal = bVal.toLowerCase();
              }
              if (_this.sortDir() === "asc") {
                if (aVal < bVal || aVal === "" || aVal === null || aVal === undefined) {
                  return -1;
                } else {
                  if (aVal > bVal || bVal === "" || bVal === null || bVal === undefined) {
                    return 1;
                  } else {
                    return 0;
                  }
                }
              } else {
                if (aVal < bVal || aVal === "" || aVal === null || aVal === undefined) {
                  return 1;
                } else {
                  if (aVal > bVal || bVal === "" || bVal === null || bVal === undefined) {
                    return -1;
                  } else {
                    return 0;
                  }
                }
              }
            });
          }
          _this.filtering(false);
          return rows;
        };
      })(this)).extend({
        rateLimit: 50,
        method: "notifyWhenChangesStop"
      });
      this.pagedRows = pureComputed((function (_this) {
        return function () {
          var pageIndex, perPage;
          pageIndex = _this.currentPage() - 1;
          perPage = _this.perPage();
          return _this.filteredRows().slice(pageIndex * perPage, (pageIndex + 1) * perPage);
        };
      })(this));
      this.pages = pureComputed((function (_this) {
        return function () {
          return Math.ceil(_this.filteredRows().length / _this.perPage());
        };
      })(this));
      this.leftPagerClass = pureComputed((function (_this) {
        return function () {
          if (_this.currentPage() === 1) {
            return "disabled";
          }
        };
      })(this));
      this.rightPagerClass = pureComputed((function (_this) {
        return function () {
          if (_this.currentPage() === _this.pages()) {
            return "disabled";
          }
        };
      })(this));
      this.total = pureComputed((function (_this) {
        return function () {
          return _this.filteredRows().length;
        };
      })(this));
      this.from = pureComputed((function (_this) {
        return function () {
          return (_this.currentPage() - 1) * _this.perPage() + 1;
        };
      })(this));
      this.to = pureComputed((function (_this) {
        return function () {
          var to;
          to = _this.currentPage() * _this.perPage();
          if (to > _this.total()) {
            return _this.total();
          } else {
            return to;
          }
        };
      })(this));
      this.recordsText = pureComputed((function (_this) {
        return function () {
          var from, pages, recordWord, recordWordPlural, to, total;
          pages = _this.pages();
          total = _this.total();
          from = _this.from();
          to = _this.to();
          recordWord = _this.options.recordWord;
          recordWordPlural = _this.options.recordWordPlural || recordWord + "s";
          if (pages > 1) {
            return "" + from + " to " + to + " of " + total + " " + recordWordPlural;
          } else {
            return "" + total + " " + (total > 1 || total === 0 ? recordWordPlural : recordWord);
          }
        };
      })(this));
      this.showNoData = pureComputed((function (_this) {
        return function () {
          return _this.pagedRows().length === 0 && !_this.loading();
        };
      })(this));
      this.showLoading = pureComputed((function (_this) {
        return function () {
          return _this.loading();
        };
      })(this));
      this.sortClass = (function (_this) {
        return function (column) {
          return pureComputed(function () {
            if (_this.sortField() === column) {
              return "sorted " + (_this.sortDir() === "asc" ? _this.options.ascSortClass : _this.options.descSortClass);
            } else {
              return _this.options.unsortedClass;
            }
          });
        };
      })(this);
      this.addRecord = (function (_this) {
        return function (record) {
          return _this.rows.push(record);
        };
      })(this);
      this.removeRecord = (function (_this) {
        return function (record) {
          _this.rows.remove(record);
          if (_this.pagedRows().length === 0) {
            return _this.prevPage();
          }
        };
      })(this);
      this.replaceRows = (function (_this) {
        return function (rows) {
          _this.rows(rows);
          _this.currentPage(1);
          return _this.filter(void 0);
        };
      })(this);
      _defaultMatch = function (filter, row, attrMap) {
        var key, val;
        return (function () {
          var _results;
          _results = [];
          for (key in attrMap) {
            val = attrMap[key];
            _results.push(val);
          }
          return _results;
        })().some(function (val) {
          return primitiveCompare(ko.isObservable(row[val]) ? row[val]() : row[val], filter);
        });
      };
      this.filterFn = this.options.filterFn || (function (_this) {
        return function (filterVar) {
          var filter = [],
              specials = {};
          filterVar.split(" ").forEach(function (word) {
            var words;
            if (word.indexOf(":") >= 0) {
              words = word.split(":");
              specials[words[0]] = (function () {
                switch (words[1].toLowerCase()) {
                  case "yes":
                  case "true":
                    return true;
                  case "no":
                  case "false":
                    return false;
                  case "blank":
                  case "none":
                  case "null":
                  case "undefined":
                    return void 0;
                  default:
                    return words[1].toLowerCase();
                }
              })();
            } else {
              filter.push(word);
            }
          });
          filter = filter.join(" ");
          return function (row) {
            var conditionals = [],
                key,
                val;
            for (key in specials) {
              val = specials[key];
              var rowAttr = _this.rowAttributeMap()[key.toLowerCase()];
              if (rowAttr) {
                conditionals.push(primitiveCompare(ko.isObservable(row[rowAttr]) ? row[rowAttr]() : row[rowAttr], val));
              } else {
                conditionals.push(false);
              }
            }
            if (conditionals.indexOf(false) === -1) {
              if (filter !== "") {
                if ("function" === typeof row.match) {
                  return row.match(filter);
                } else {
                  return _defaultMatch(filter, row, _this.rowAttributeMap());
                }
              } else {
                return true;
              }
            } else {
              return false;
            }
          };
        };
      })(this);
    };

    DataTable.prototype.initWithServerSidePagination = function () {
      var _gatherData, _getDataFromServer;
      _getDataFromServer = (function (_this) {
        return function (data, cb) {
          var key, req, url, val;
          url = "" + _this.options.paginationPath + "?" + (function () {
            var _results;
            _results = [];
            for (key in data) {
              val = data[key];
              _results.push("" + encodeURIComponent(key) + "=" + encodeURIComponent(val));
            }
            return _results;
          })().join("&");
          req = new XMLHttpRequest();
          req.open("GET", url, true);
          req.setRequestHeader("Content-Type", "application/json");
          req.onload = function () {
            if (req.status >= 200 && req.status < 400) {
              return cb(null, JSON.parse(req.responseText));
            } else {
              return cb(new Error("Error communicating with server"));
            }
          };
          req.onerror = function () {
            return cb(new Error("Error communicating with server"));
          };
          return req.send();
        };
      })(this);
      _gatherData = function (perPage, currentPage, filter, sortDir, sortField) {
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
      this.filter.subscribe((function (_this) {
        return function () {
          return _this.currentPage(1);
        };
      })(this));
      this.perPage.subscribe((function (_this) {
        return function () {
          return _this.currentPage(1);
        };
      })(this));
      ko.computed((function (_this) {
        return function () {
          var data;
          _this.loading(true);
          _this.filtering(true);
          data = _gatherData(_this.perPage(), _this.currentPage(), _this.filter(), _this.sortDir(), _this.sortField());
          return _getDataFromServer(data, function (err, response) {
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
        method: "notifyWhenChangesStop"
      });
      this.pages = pureComputed((function (_this) {
        return function () {
          return Math.ceil(_this.numFilteredRows() / _this.perPage());
        };
      })(this));
      this.leftPagerClass = pureComputed((function (_this) {
        return function () {
          if (_this.currentPage() === 1) {
            return "disabled";
          }
        };
      })(this));
      this.rightPagerClass = pureComputed((function (_this) {
        return function () {
          if (_this.currentPage() === _this.pages()) {
            return "disabled";
          }
        };
      })(this));
      this.from = pureComputed((function (_this) {
        return function () {
          return (_this.currentPage() - 1) * _this.perPage() + 1;
        };
      })(this));
      this.to = pureComputed((function (_this) {
        return function () {
          var to, total;
          to = _this.currentPage() * _this.perPage();
          if (to > (total = _this.numFilteredRows())) {
            return total;
          } else {
            return to;
          }
        };
      })(this));
      this.recordsText = pureComputed((function (_this) {
        return function () {
          var from, pages, recordWord, recordWordPlural, to, total;
          pages = _this.pages();
          total = _this.numFilteredRows();
          from = _this.from();
          to = _this.to();
          recordWord = _this.options.recordWord;
          recordWordPlural = _this.options.recordWordPlural || recordWord + "s";
          if (pages > 1) {
            return "" + from + " to " + to + " of " + total + " " + recordWordPlural;
          } else {
            return "" + total + " " + (total > 1 || total === 0 ? recordWordPlural : recordWord);
          }
        };
      })(this));
      this.showNoData = pureComputed((function (_this) {
        return function () {
          return _this.pagedRows().length === 0 && !_this.loading();
        };
      })(this));
      this.showLoading = pureComputed((function (_this) {
        return function () {
          return _this.loading();
        };
      })(this));
      this.sortClass = (function (_this) {
        return function (column) {
          return pureComputed(function () {
            if (_this.sortField() === column) {
              return "sorted " + (_this.sortDir() === "asc" ? _this.options.ascSortClass : _this.options.descSortClass);
            } else {
              return _this.options.unsortedClass;
            }
          });
        };
      })(this);
      this.addRecord = function () {
        throw new Error("#addRecord() not applicable with serverSidePagination enabled");
      };
      this.removeRecord = function () {
        throw new Error("#removeRecord() not applicable with serverSidePagination enabled");
      };
      this.replaceRows = function () {
        throw new Error("#replaceRows() not applicable with serverSidePagination enabled");
      };
      this.refreshData = (function (_this) {
        return function () {
          var data;
          _this.loading(true);
          _this.filtering(true);
          data = _gatherData(_this.perPage(), _this.currentPage(), _this.filter(), _this.sortDir(), _this.sortField());
          return _getDataFromServer(data, function (err, response) {
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
    };

    DataTable.prototype.toggleSort = function (field) {
      return (function (_this) {
        return function () {
          _this.currentPage(1);
          if (_this.sortField() === field) {
            return _this.sortDir(_this.sortDir() === "asc" ? "desc" : "asc");
          } else {
            _this.sortDir("asc");
            return _this.sortField(field);
          }
        };
      })(this);
    };

    DataTable.prototype.prevPage = function () {
      var page;
      page = this.currentPage();
      if (page !== 1) {
        return this.currentPage(page - 1);
      }
    };

    DataTable.prototype.nextPage = function () {
      var page;
      page = this.currentPage();
      if (page !== this.pages()) {
        return this.currentPage(page + 1);
      }
    };

    DataTable.prototype.gotoPage = function (page) {
      return (function (_this) {
        return function () {
          return _this.currentPage(page);
        };
      })(this);
    };

    DataTable.prototype.pageClass = function (page) {
      return pureComputed((function (_this) {
        return function () {
          if (_this.currentPage() === page) {
            return "active";
          }
        };
      })(this));
    };

    return DataTable;
  })();
}).call(undefined);
//# sourceMappingURL=knockout-datatable.js.map