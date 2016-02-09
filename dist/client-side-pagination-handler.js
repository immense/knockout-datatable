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
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var unwrapObservable = ko.unwrap || ko.utils.unwrapObservable;

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

	function buildRowAttributeMap(rows) {
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
	  function ClientSidePaginationHandler(rows) {
	    var _this = this;

	    _classCallCheck(this, ClientSidePaginationHandler);

	    var _private = new Map();
	    private_map.set(this, _private);

	    this.sortDir = null;
	    this.sortField = null;
	    this.perPage = null;
	    this.currentPage = null;
	    this.filter = ko.observable(null);
	    var rowAttributeMap = ko.observable({});

	    rowAttributeMap(buildRowAttributeMap(rows));

	    var filter__specials = ko.observableArray([]);
	    var filter__non_special_words = ko.observable(null);

	    ko.computed(function () {
	      var filterVar = _this.filter();
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
	        filter__specials(specials);
	        filter__non_special_words(non_special_words.join(' '));
	      } else {
	        filter__specials([]);
	        filter__non_special_words(null);
	      }
	    });

	    filter__special_row_attrs = ko.pureComputed(function () {
	      var rowAttrs = rowAttributeMap();
	      return filter__specials().map(function (_ref3) {
	        var _ref4 = _slicedToArray(_ref3, 2);

	        var k = _ref4[0];
	        var v = _ref4[1];
	        return [rowAttrs[k], v];
	      });
	    });

	    _private.set('filterRows', function (rows) {
	      // TODO Need a way to make sure these observables are up-to-date before
	      // unwrapping them.
	      var rowAttrs = unwrapObservable(rowAttributeMap);
	      var specials = unwrapObservable(filter__special_row_attrs);
	      var filter_words = unwrapObservable(filter__non_special_words);

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

/***/ }
/******/ ])
});
;