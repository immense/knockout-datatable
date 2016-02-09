(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _clientSidePaginationHandler = __webpack_require__(1);

	Object.defineProperty(exports, 'ClientSidePaginationHandler', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_clientSidePaginationHandler).default;
	  }
	});

	var _serverSidePaginationHandler = __webpack_require__(2);

	Object.defineProperty(exports, 'ServerSidePaginationHandler', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_serverSidePaginationHandler).default;
	  }
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _option_defaults = {
	  recordWord: 'record',
	  recordWordPlural: 'records',
	  sortDir: 'asc',
	  sortField: null,
	  perPage: 15,
	  filterFn: null,
	  unsortedClass: '',
	  descSortClass: '',
	  ascSortClass: '',
	  rateLimitTimeout: null
	};

	var _com = ko.pureComputed || ko.computed;
	var _obs = function _obs() {
	  var arg = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	  return ko.observable(arg);
	};
	var _unwrap = ko.utils.unwrapObservable;

	var DataTable = function () {
	  function DataTable(rows, options) {
	    _classCallCheck(this, DataTable);

	    if (!options) {
	      if (!(rows instanceof Array)) {
	        options = rows;
	        rows = [];
	      } else {
	        options = {};
	      }
	    }

	    var serverSideOpts = options.serverSidePagination;

	    this._rows = rows.slice(0);

	    this.options = Object.assign({}, _option_defaults, options);
	    if (options.recordWord != null && options.recordWordPlural == null) {
	      this.options.recordWordPlural = this.options.recordWord + 's';
	    }

	    this.numPages = _obs();
	    this.numFilteredRows = _obs();
	    this.pagedRows = _obs();
	    this.firstRecordIndex = _obs();
	    this.lastRecordIndex = _obs();

	    this.sortDir = _obs(this.options.sortDir);
	    this.sortField = _obs(this.options.sortField);
	    this.perPage = _obs(this.options.perPage);
	    this.currentPage = _obs(1);
	    this.filter = _obs('');
	    this.loading = _obs(false);
	  }

	  _createClass(DataTable, [{
	    key: 'registerPaginationHandler',
	    value: function registerPaginationHandler(handler) {
	      var _this = this;

	      this.handler = handler;
	      var subscribeToProperties = ['sortDir', 'sortField', 'perPage', 'currentPage', 'filter'];
	      var refreshListener = _com(function () {
	        subscribeToProperties.forEach(function (property) {
	          handler[property] = _unwrap(_this[property]);
	        });
	        _this.refreshData();
	      });
	      if (this.options.rateLimitTimeout || this.options.rateLimitTimeout === 0) {
	        refreshListener.extend({ rateLimit: {
	            timeout: this.options.rateLimitTimeout,
	            method: 'notifyWhenChangesStop'
	          } });
	      }
	    }
	  }, {
	    key: 'toggleSort',
	    value: function toggleSort(field) {
	      var _this2 = this;

	      return function () {
	        _this2.currentPage(1);
	        if (_this2.sortField() === field) {
	          if ('asc' === _this2.sortDir()) {
	            _this2.sortDir('desc');
	          } else {
	            _this2.sortDir('asc');
	          }
	        } else {
	          _this2.sortDir('asc');
	          _this2.sortField(field);
	        }
	      };
	    }
	  }, {
	    key: 'onLastPage',
	    value: function onLastPage() {
	      return this.currentPage() === this.numPages();
	    }
	  }, {
	    key: 'onFirstPage',
	    value: function onFirstPage() {
	      return this.currentPage() === 1;
	    }
	  }, {
	    key: 'moveToPrevPage',
	    value: function moveToPrevPage() {
	      if (!this.onFirstPage()) {
	        this.currentPage(this.currentPage() - 1);
	      } else {
	        this.refreshData();
	      }
	    }
	  }, {
	    key: 'moveToNextPage',
	    value: function moveToNextPage() {
	      if (!this.onLastPage()) {
	        this.currentPage(this.currentPage() + 1);
	      } else {
	        this.refreshData();
	      }
	    }
	  }, {
	    key: 'moveToPage',
	    value: function moveToPage(page) {
	      var _this3 = this;

	      return function () {
	        _this3.currentPage(page);
	      };
	    }
	  }, {
	    key: 'refreshData',
	    value: function refreshData() {
	      var _this4 = this;

	      if (this.handler) {
	        this.loading(true);
	        this.handler.getData(this._rows).then(function (_ref) {
	          var numPages = _ref.numPages;
	          var numFilteredRows = _ref.numFilteredRows;
	          var pagedRows = _ref.pagedRows;

	          _this4.numPages(numPages);
	          _this4.numFilteredRows(numFilteredRows);

	          var recordIndexes = _this4.recordIndexes;

	          _this4.pagedRows(pagedRows);
	          _this4.firstRecordIndex(recordIndexes.firstRecordIndex);
	          _this4.lastRecordIndex(recordIndexes.lastRecordIndex);

	          _this4.loading(false);
	        });
	      }
	    }
	  }, {
	    key: 'addRecord',
	    value: function addRecord(record) {
	      this._rows.push(record);
	      this.refreshData();
	    }
	  }, {
	    key: 'removeRecord',
	    value: function removeRecord(record) {
	      var index = this._rows.indexOf(record);
	      if (index !== -1) {
	        this._rows.splice(index, 1);
	        if (this.onLastPage() && this.pagedRows().length === 1) {
	          this.moveToPrevPage();
	        } else {
	          this.refreshData();
	        }
	      } else {
	        throw new Error("Could not remove record; record not found");
	      }
	    }
	  }, {
	    key: 'replaceRows',
	    value: function replaceRows(rows) {
	      this._rows = rows.slice(0);
	      this.currentPage(1);
	      this.filter(null);
	    }
	  }, {
	    key: 'rows',
	    value: function rows(_rows) {
	      this.replaceRows(_rows);
	    }

	    // TODO: Should this be here? It's more related to the view than the underlying datatable

	  }, {
	    key: 'pageClass',
	    value: function pageClass(page) {
	      var _this5 = this;

	      return _com(function () {
	        if (_this5.currentPage() === page) {
	          return 'active';
	        }
	      });
	    }

	    // TODO: Should this be here? It's more related to the view than the underlying datatable

	  }, {
	    key: 'sortClass',


	    // TODO: Should this be here? It's more related to the view than the underlying datatable
	    value: function sortClass(column) {
	      var _this6 = this;

	      return _com(function () {
	        if (_this6.sortField() === column) {
	          if ('asc' === _this6.sortDir()) {
	            return _this6.options.ascSortClass;
	          } else {
	            return _this6.options.descSortClass;
	          }
	        } else {
	          return _this6.options.unsortedClass;
	        }
	      });
	    }
	  }, {
	    key: 'recordIndexes',
	    get: function get() {
	      var firstRecordIndex = (this.currentPage() - 1) * this.perPage() + 1,
	          lastRecordIndex = this.currentPage() * this.perPage(),
	          numFilteredRows = this.numFilteredRows();

	      if (lastRecordIndex > numFilteredRows) {
	        lastRecordIndex = numFilteredRows;
	      }

	      return {
	        firstRecordIndex: firstRecordIndex,
	        lastRecordIndex: lastRecordIndex
	      };
	    }
	  }, {
	    key: 'leftPagerClass',
	    get: function get() {
	      var _this7 = this;

	      return _com(function () {
	        if (_this7.currentPage() === 1) {
	          return 'disabled';
	        }
	      });
	    }

	    // TODO: Should this be here? It's more related to the view than the underlying datatable

	  }, {
	    key: 'rightPagerClass',
	    get: function get() {
	      var _this8 = this;

	      return _com(function () {
	        if (_this8.currentPage() === _this8.numPages()) {
	          return 'disabled';
	        }
	      });
	    }

	    // TODO: Should this be here? It's more related to the view than the underlying datatable

	  }, {
	    key: 'recordsText',
	    get: function get() {
	      var _this9 = this;

	      return _com(function () {
	        var pages = _this9.numPages(),
	            total = _this9.numFilteredRows(),
	            from = _this9.firstRecordIndex(),
	            to = _this9.lastRecordIndex(),
	            recordWord = _this9.options.recordWord,
	            recordWordPlural = _this9.options.recordWordPlural;

	        if (pages > 1) {
	          return from + ' to ' + to + ' of ' + total + ' ' + recordWordPlural;
	        } else {
	          return total + ' ' + (total > 1 || total === 0 ? recordWordPlural : recordWord);
	        }
	      });
	    }

	    // TODO: Should this be here? It's more related to the view than the underlying datatable

	  }, {
	    key: 'showNoData',
	    get: function get() {
	      var _this10 = this;

	      return _com(function () {
	        var pagedRows = _this10.pagedRows();
	        if (pagedRows) {
	          return !pagedRows.length && !_this10.loading();
	        } else {
	          return true;
	        }
	      });
	    }

	    // TODO: Should this be here? It's more related to the view than the underlying datatable

	  }, {
	    key: 'showLoading',
	    get: function get() {
	      var _this11 = this;

	      return _com(function () {
	        return _this11.loading();
	      });
	    }
	  }]);

	  return DataTable;
	}();

	exports.DataTable = DataTable;
	;

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function primitiveCompare(item1, item2) {
	  if (item2 === null || item2 === undefined) {
	    return item1 === null || item1 === undefined;
	  } else if (item1 !== null && item1 !== undefined) {
	    if ('boolean' === typeof item1) {
	      return item1 === item2;
	    } else {
	      return item1.toString().toLowerCase().indexOf(item2.toString().toLowerCase()) >= 0 || item1 === item2;
	    }
	  } else {
	    return false;
	  }
	}

	function obsCompare(val1, val2) {
	  return primitiveCompare(unwrapObservable(val1), val2);
	}

	function _buildRowAttributeMap(rows) {
	  var obj = {};
	  var row = rows[0];
	  if (row) {
	    for (key in row) {
	      if (row.hasOwnProperty(key)) {
	        obj[key.toLowerCase()] = key;
	      }
	    }
	  }
	  return obj;
	}

	function defaultMatch(attrMap, row) {
	  return function (filter) {
	    return attrMap.some(function (_ref) {
	      var _ref2 = _slicedToArray(_ref, 2);

	      var key = _ref2[1];
	      return obsCompare(row[key], filter);
	    });
	  };
	}

	var private_map = new WeakMap();

	var ClientSidePaginationHandler = function () {
	  _createClass(ClientSidePaginationHandler, [{
	    key: 'buildRowAttributeMap',
	    value: function buildRowAttributeMap(rows) {
	      _private.set('rowAttributeMap', _buildRowAttributeMap(rows));
	    }
	  }, {
	    key: 'splitFilter',
	    value: function splitFilter() {
	      var filterVar = this.filter;
	      var specials = [];
	      var non_special_words = [];
	      if (filterVar) {
	        filterVar.split(' ').forEach(function (word) {
	          if (word.indexOf(':') >= 0) {
	            var words = word.split(':');
	            switch (words[1].toLowerCase()) {
	              case 'yes':
	              case 'true':
	                specials.push([words[0].toLowerCase(), true]);
	                break;
	              case 'no':
	              case 'false':
	                specials.push([words[0].toLowerCase(), false]);
	                break;
	              case 'blank':
	              case 'none':
	              case 'null':
	              case 'undefined':
	                specials.push([words[0].toLowerCase(), void 0]);
	                break;
	              default:
	                specials.push([words[0].toLowerCase(), words[1].toLowerCase()]);
	                break;
	            }
	          } else {
	            non_special_words.push(word);
	          }
	        });
	        _private.set('filter__specials', specials);
	        _private.set('filter__non_special_words', non_special_words.join(' '));
	      } else {
	        _private.set('filter__specials', []);
	        _private.set('filter__non_special_words', null);
	      }
	    }
	  }]);

	  function ClientSidePaginationHandler() {
	    var _this = this;

	    _classCallCheck(this, ClientSidePaginationHandler);

	    var _private = new Map();
	    private_map.set(this, _private);

	    this.sortDir = null;
	    this.sortField = null;
	    this.perPage = null;
	    this.currentPage = null;
	    this.filter = null;
	    _private.set('rowAttributeMap', {});
	    _private.set('filter__specials', []);
	    _private.set('filter__non_special_words', null);

	    _private.set('filterRows', function (rows) {
	      // TODO Need a way to make sure these observables are up-to-date before
	      // unwrapping them.
	      var rowAttrs = _private.get('rowAttributeMap');
	      var specials = _private.get('filter__specials').map(function (_ref3) {
	        var _ref4 = _slicedToArray(_ref3, 2);

	        var k = _ref4[0];
	        var v = _ref4[1];
	        return [rowAttrs[k], v];
	      });
	      var filter_words = _private.get('filter__non_special_words');

	      if (!specials.length && filter_words === '') return Promise.resolve(rows);

	      function filterFn(row) {
	        if (specials.all(function (_ref5) {
	          var _ref6 = _slicedToArray(_ref5, 2);

	          var key = _ref6[0];
	          var val = _ref6[1];
	          return obsCompare(row[key], val);
	        })) {
	          if (filter_words === '') return true;
	          var match = 'function' === typeof row.match ? row.match : defaultMatch(rowAttrs, row);
	          return match(filter_words);
	        } else {
	          return false;
	        }
	      }

	      return Promise.resolve(rows.filter(filterFn));
	    });

	    _private.set('sortRows', function (rows) {
	      if (!_this.sortField && _this.sortField !== 0) {
	        return Promise.resolve(rows.slice(0));
	      }
	      return Promise.resolve(rows.slice(0).sort(function (a, b) {
	        var _map = [a, b].map(function (v) {
	          var unwrapped = unwrapObservable(v[_this.sortField]);
	          if ('string' === typeof unwrapped) {
	            unwrapped = unwrapped.toLowerCase();
	          }
	          return unwrapped;
	        });

	        var _map2 = _slicedToArray(_map, 2);

	        var aVal = _map2[0];
	        var bVal = _map2[1];


	        if ('asc' === _this.sortDir) {
	          if (aVal < bVal || aVal === '' || aVal === null || aVal === undefined) {
	            return -1;
	          } else {
	            if (aVal > bVal || bVal === '' || bVal === null || bVal === undefined) {
	              return 1;
	            } else {
	              return 0;
	            }
	          }
	        } else {
	          if (aVal < bVal || aVal === '' || aVal === null || aVal === undefined) {
	            return 1;
	          } else {
	            if (aVal > bVal || bVal === '' || bVal === null || bVal === undefined) {
	              return -1;
	            } else {
	              return 0;
	            }
	          }
	        }
	      }));
	    });

	    _private.set('pageRows', function (rows) {
	      var pageIndex = _this.currentPage - 1;
	      var perPage = _this.perPage;
	      var pagedRows = rows.slice(pageIndex * perPage, (pageIndex + 1) * perPage);

	      return Promise.resolve({ pagedRows: pagedRows, totalNumRows: rows.length });
	    });
	  }

	  _createClass(ClientSidePaginationHandler, [{
	    key: 'getData',
	    value: function getData(rows) {
	      var _this2 = this;

	      this.splitFilter();
	      this.buildRowAttributeMap(rows);

	      var _private = private_map.get(this);
	      return _private.get('filterRows')(rows).then(function (filteredRows) {
	        return _private.get('sortRows')(filteredRows);
	      }).then(function (sortedRows) {
	        return _private.get('pageRows')(sortedRows);
	      }).then(function (_ref7) {
	        var pagedRows = _ref7.pagedRows;
	        var totalNumRows = _ref7.totalNumRows;
	        return Promise.resolve({
	          numPages: Math.ceil(totalNumRows / _this2.perPage),
	          numFilteredRows: totalNumRows,
	          pagedRows: pagedRows
	        });
	      });
	    }
	  }]);

	  return ClientSidePaginationHandler;
	}();

	exports.default = ClientSidePaginationHandler;
	;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ServerSidePaginationHandler = function () {
	  function ServerSidePaginationHandler(_ref) {
	    var path = _ref.path;
	    var loader = _ref.loader;

	    _classCallCheck(this, ServerSidePaginationHandler);

	    if (!(path && loader)) {
	      throw new Error("`path` or `loader` missing from `serverSidePagination` object");
	    }
	    this.paginationPath = path;
	    this.resultHandlerFn = loader;
	    this.sortDir = null;
	    this.sortField = null;
	    this.perPage = null;
	    this.currentPage = null;
	    this.filter = null;
	  }

	  _createClass(ServerSidePaginationHandler, [{
	    key: 'getData',
	    value: function getData() {
	      var _this = this;

	      return new Promise(function (resolve, reject) {
	        var preparedData = {
	          perPage: _this.perPage,
	          page: _this.currentPage,
	          filter: _this.filter || _this.filter === 0 ? _this.filter : null
	        };

	        if ((_this.sortField || _this.sortField === 0) && (_this.sortDir || _this.sortDir === 0)) {
	          preparedData.sortDir = _this.sortDir;
	          preparedData.sortField = _this.sortField;
	        }

	        var url = _this.paginationPath + '?';

	        for (key in preparedData) {
	          var val = preparedData[key];
	          if (val || val === 0) {
	            url = url + '&' + encodeURIComponent(key) + '=' + encodeURIComponent(val);
	          }
	        }

	        var req = new XMLHttpRequest();
	        req.open('GET', url, true);
	        req.setRequestHeader('Content-Type', 'application/json');
	        req.onload = function () {
	          if (req.status >= 200 && req.status < 400) {
	            resolve(JSON.parse(req.responseText));
	          } else {
	            reject(new Error("Error communicating with server"));
	          }
	        };
	        req.onerror = reject;
	        req.send();
	      }).then(function (response) {
	        return new Promise(function (resolve, reject) {
	          if ((response.total || response.total === 0) && response.results) {
	            resolve({
	              numFilteredRows: response.total,
	              numPages: Math.ceil(response.total / _this.perPage),
	              pagedRows: response.results.map(_this.resultHandlerFn)
	            });
	          } else {
	            reject(new Error("Server response missing either `total` or `results` (or both)"));
	          }
	        });
	      });
	    }
	  }]);

	  return ServerSidePaginationHandler;
	}();

	exports.default = ServerSidePaginationHandler;
	;

/***/ }
/******/ ])
});
;