describe('DataTable', function(){
  var view;

  describe('server-side pagination', function(){
    var server;

    var _examplePaginationResponseFromServer = function(perPage, page, opts){
      if (!opts) opts = {};
      var total = opts.total || 100;
      if (!(perPage && page)) {
        throw new Error("perPage and page required to construct example response");
        return;
      }
      var results = [];
      for (var i = ((page - 1) * perPage + 1); i <= Math.min(total, page * perPage); i++){
        results.push({
          id: i,
          name: 'res' + i
        });
      }
      return JSON.stringify({
        total: total,
        results: results
      });
    };

    // Waits 501ms (since datatable sends request 500ms after
    // changes have stopped) and triggers a response from the mock server
    var _waitAndServerRespond = function(perPage, page, opts, cb){
      setTimeout(function(){
        req = server.requests[0]
        req.respond(200, {
          "Content-Type": "application/json"
        }, _examplePaginationResponseFromServer(13, 1, opts));
        server.restore();
        server = sinon.fakeServer.create();
        cb(req);
      }, 501);
    }

    beforeEach(function(){
      server = sinon.fakeServer.create();
    });

    afterEach(function(){
      server.restore()
    });

    describe('construction', function(){
      it('should throw error if missing loader', function(){
        assert.throws(function(){
          new DataTable({
            perPage: 13,
            serverSidePagination: {
              enabled: true,
              path: '/api/communitites'
            }
          })
        });
      });

      it('should throw error if missing path', function(){
        assert.throws(function(){
          new DataTable({
            perPage: 13,
            serverSidePagination: {
              enabled: true,
              loader: function(result){return result;}
            }
          })
        });
      });

      it('should get initial results', function(done){
        assert.doesNotThrow(function(){
          view = new DataTable({
            perPage: 13,
            serverSidePagination: {
              enabled: true,
              path: '/api/communities',
              loader: function(result){

                // attach a flag to test that the loader is being used
                result.type = 'foobar';
                return result;
              }
            }
          });
        });
        _waitAndServerRespond(13, 1, {}, function(request){
          var decodedURI = window.decodeURI(request.url);
          assert.include(decodedURI, '/api/communities?');
          assert.include(decodedURI, 'perPage=13');
          assert.include(decodedURI, 'page=1');
          assert.notInclude(decodedURI, 'sortBy=');
          assert.notInclude(decodedURI, 'sortDir=');
          assert.notInclude(decodedURI, 'filter=');
          done();
        });
      });
    });
    describe('#pagedRows()', function(){
      describe('should return the correct results', function(){

        it('should return correct number of results', function(){
          assert.lengthOf(view.pagedRows(), 13);
        });

        it('should map results using `loader` function', function(){
          var rows = view.pagedRows();
          assert.equal(rows[0].name, 'res1');
          assert.equal(rows[0].type, 'foobar');
        });
      });
    });
    describe('#nextPage()', function(){
      it('should submit request for next page', function(done){
        view.nextPage();
        _waitAndServerRespond(13, 2, {}, function(request){
          var decodedURI = window.decodeURI(request.url);
          assert.include(decodedURI, '/api/communities?');
          assert.include(decodedURI, 'perPage=13');
          assert.include(decodedURI, 'page=2');
          assert.notInclude(decodedURI, 'sortBy=');
          assert.notInclude(decodedURI, 'sortDir=');
          assert.notInclude(decodedURI, 'filter=');
          done();
        });
      });
    });
    describe('#prevPage()', function(){
      it('should submit request for previous page', function(done){
        view.prevPage();
        _waitAndServerRespond(13, 1, {}, function(request){
          var decodedURI = window.decodeURI(request.url);
          assert.include(decodedURI, '/api/communities?');
          assert.include(decodedURI, 'perPage=13');
          assert.include(decodedURI, 'page=1');
          assert.notInclude(decodedURI, 'sortBy=');
          assert.notInclude(decodedURI, 'sortDir=');
          assert.notInclude(decodedURI, 'filter=');
          done()
        });
      });
    });
    describe('#toggleSort(fieldName)()', function(){
      it('should submit request for current page, sorted desc', function(done){
        view.toggleSort('name')();
        _waitAndServerRespond(13, 1, {}, function(request){
          var decodedURI = window.decodeURI(request.url);
          assert.include(decodedURI, '/api/communities?');
          assert.include(decodedURI, 'perPage=13');
          assert.include(decodedURI, 'page=1');
          assert.include(decodedURI, 'sortBy=name');
          assert.include(decodedURI, 'sortDir=asc');
          assert.notInclude(decodedURI, 'filter=');
          done();
        });
      });

      it('should submit request for current page, sorted asc', function(done){
        view.toggleSort('name')();
        _waitAndServerRespond(13, 1, {}, function(request){
          var decodedURI = window.decodeURI(request.url);
          assert.include(decodedURI, '/api/communities?');
          assert.include(decodedURI, 'perPage=13');
          assert.include(decodedURI, 'page=1');
          assert.include(decodedURI, 'sortBy=name');
          assert.include(decodedURI, 'sortDir=desc');
          assert.notInclude(decodedURI, 'filter=');
          done();
        });
      });
    });

    describe('#filter(filterText)', function(){
      it('should submit request for current page, with filter', function(done){
        view.filter('foo bar baz');
        _waitAndServerRespond(13, 1, {total: 5}, function(request){
          var decodedURI = window.decodeURI(request.url);
          assert.include(decodedURI, '/api/communities?');
          assert.include(decodedURI, 'perPage=13');
          assert.include(decodedURI, 'page=1');
          assert.include(decodedURI, 'sortBy=name');
          assert.include(decodedURI, 'sortDir=desc');
          assert.include(decodedURI, 'filter=foo bar baz');
          done();
        });
      });
    });

    describe('#gotoPage(pageNum)()', function(){
      it('should submit request with page = pageNum', function(done){
        view.filter('');
        view.toggleSort('')();
        _waitAndServerRespond(13, 1, {}, function(request){
          view.gotoPage(3)();
          _waitAndServerRespond(13, 3, {}, function(request){
            var decodedURI = window.decodeURI(request.url);
            assert.include(decodedURI, '/api/communities?');
            assert.include(decodedURI, 'perPage=13');
            assert.include(decodedURI, 'page=3');
            done();
          });
        });
      });

      it('should do something specific when pageNum is out of range?');
    });

    describe('#pages()', function(){
      it('should be correct number of pages determined by response from server', function(done){
        view.filter('');
        view.toggleSort('')();
        view.gotoPage(1)();
        _waitAndServerRespond(13, 1, {}, function(request){
          // from mock server: {total: 100, results: [...]}
          // with perPage of 13 and total of 100, should get (100 / 13).ceil
          assert.equal(view.pages(), Math.ceil(100 / 13));
          done()
        });
      });

      it('should change when a request returns that server has a different total', function(done){
        view.nextPage();
        _waitAndServerRespond(13, 2, {total: 120}, function(request){
          assert.equal(view.pages(), Math.ceil(120 / 13));
          done();
        });
      });
    });

    describe('#pageClass(pageNum)()', function(){

      it("should be undefined for pages that aren't the current page", function(done){
        view.gotoPage(1)();
        _waitAndServerRespond(13, 1, {}, function(request){
          assert.equal(view.pageClass(2)(), undefined);
          assert.equal(view.pageClass(3)(), undefined);
          assert.equal(view.pageClass(20)(), undefined);
          done()
        });
      });

      it("should be active for current page", function(done){
        assert.equal(view.pageClass(1)(), 'active');
        view.gotoPage(2)();
        _waitAndServerRespond(13, 2, {}, function(request){
          assert.equal(view.pageClass(2)(), 'active');
          assert.equal(view.pageClass(1)(), undefined);
          done();
        });
      });
    });

    describe('#refreshData()', function(){
      it('should submit request with current state of view model', function(done){
        view.perPage(13);
        view.gotoPage(1)();
        view.filter('');
        view.toggleSort('')();
        _waitAndServerRespond(13, 1, {}, function(request){
          assert.equal(server.requests.length, 0);
          view.refreshData();
          assert.equal(server.requests.length, 1);

          var decodedURI = window.decodeURI(server.requests[0].url);
          assert.include(decodedURI, '/api/communities?');
          assert.include(decodedURI, 'perPage=13');
          assert.include(decodedURI, 'page=1');
          assert.notInclude(decodedURI, 'sortBy=');
          assert.notInclude(decodedURI, 'sortDir=');
          assert.notInclude(decodedURI, 'filter=');

          server.requests[0].respond(200, {
            "Content-Type": "application/json"
          }, _examplePaginationResponseFromServer(13, 1));
          done();
        });
      });
    });

    describe('#addRecord(newRecord)', function(){
      it('should throw error if called', function(){
        assert.throws(function(){
          view.addRecord({any: 'thing'});
        }, '#addRecord() not applicable with serverSidePagination enabled');
      });
    });

    describe('#removeRecord(record)', function(){
      it('should throw error if called', function(){
        assert.throws(function(){
          view.removeRecord({any: 'thing'});
        }, '#removeRecord() not applicable with serverSidePagination enabled');
      });
    });

    describe('#replaceRows(array)', function(){
      it('should throw error if called', function(){
        assert.throws(function(){
          view.replaceRows([{any: 'thing'}]);
        }, '#replaceRows() not applicable with serverSidePagination enabled');
      });
    });
  });
});
