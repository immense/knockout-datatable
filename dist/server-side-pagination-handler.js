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