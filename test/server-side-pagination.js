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

    var wait = function(time_in_ms){
      return new Promise(function(resolve){
        setTimeout(resolve, time_in_ms);
      });
    };

    var serverRespond = function(perPage, page, opts){
      return function(){
        req = server.requests[0];
        req.respond(200, {
          "Content-Type": "application/json"
        }, _examplePaginationResponseFromServer(13, 1, opts));
        server.restore();
        server = sinon.fakeServer.create();
        return Promise.resolve(req);
      };
    };

    beforeEach(function(){
      server = sinon.fakeServer.create();
    });

    afterEach(function(){
      server.restore()
    });

    describe('construction', function(){
      it('should throw error if missing loader', function(done){
        try {
          assert.throws(function(){
            new DataTable({
              perPage: 13,
              serverSidePagination: {
                enabled: true,
                path: '/api/communitites'
              }
            })
          });
          done();
        } catch (e) {
          done(e);
        }
      });

      it('should throw error if missing path', function(done){
        try {
          assert.throws(function(){
            new DataTable({
              perPage: 13,
              serverSidePagination: {
                enabled: true,
                loader: function(result){return result;}
              }
            })
          });
          done();
        } catch (e) {
          done(e);
        }
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

        wait(501)
        .then(serverRespond(13, 1, {}))
        .then(function(request){
          try {
            var decodedURI = window.decodeURI(request.url);
            assert.include(decodedURI, '/api/communities?');
            assert.include(decodedURI, 'perPage=13');
            assert.include(decodedURI, 'page=1');
            assert.notInclude(decodedURI, 'sortField=');
            assert.notInclude(decodedURI, 'sortDir=');
            assert.notInclude(decodedURI, 'filter=');
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });
    describe('#pagedRows()', function(){
      describe('should return the correct results', function(){

        it('should return correct number of results', function(done){
          try {
            assert.lengthOf(view.pagedRows(), 13);
            done();
          } catch (e) {
            done(e);
          }
        });

        it('should map results using `loader` function', function(done){
          var rows = view.pagedRows();
          try {
            assert.equal(rows[0].name, 'res1');
            assert.equal(rows[0].type, 'foobar');
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });
    describe('#nextPage()', function(){
      it('should submit request for next page', function(done){
        view.moveToNextPage();
        wait(501)
        .then(serverRespond(13, 2, {}))
        .then(function(request){
          var decodedURI = window.decodeURI(request.url);
          try {
            assert.include(decodedURI, '/api/communities?');
            assert.include(decodedURI, 'perPage=13');
            assert.include(decodedURI, 'page=2');
            assert.notInclude(decodedURI, 'sortField=');
            assert.notInclude(decodedURI, 'sortDir=');
            assert.notInclude(decodedURI, 'filter=');
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });
    describe('#prevPage()', function(){
      it('should submit request for previous page', function(done){
        view.moveToPrevPage();
        wait(501)
        .then(serverRespond(13, 1, {}))
        .then(function(request){
          var decodedURI = window.decodeURI(request.url);
          try {
            assert.include(decodedURI, '/api/communities?');
            assert.include(decodedURI, 'perPage=13');
            assert.include(decodedURI, 'page=1');
            assert.notInclude(decodedURI, 'sortField=');
            assert.notInclude(decodedURI, 'sortDir=');
            assert.notInclude(decodedURI, 'filter=');
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });
    describe('#toggleSort(fieldName)()', function(){
      it('should submit request for current page, sorted desc', function(done){
        view.toggleSort('name')();
        wait(501)
        .then(serverRespond(13, 1, {}))
        .then(function(request){
          var decodedURI = window.decodeURI(request.url);
          try {
            assert.include(decodedURI, '/api/communities?');
            assert.include(decodedURI, 'perPage=13');
            assert.include(decodedURI, 'page=1');
            assert.include(decodedURI, 'sortField=name');
            assert.include(decodedURI, 'sortDir=asc');
            assert.notInclude(decodedURI, 'filter=');
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it('should submit request for current page, sorted asc', function(done){
        view.toggleSort('name')();
        wait(501)
        .then(serverRespond(13, 1, {}))
        .then(function(request){
          var decodedURI = window.decodeURI(request.url);
          try {
            assert.include(decodedURI, '/api/communities?');
            assert.include(decodedURI, 'perPage=13');
            assert.include(decodedURI, 'page=1');
            assert.include(decodedURI, 'sortField=name');
            assert.include(decodedURI, 'sortDir=desc');
            assert.notInclude(decodedURI, 'filter=');
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });

    describe('#filter(filterText)', function(){
      it('should submit request for current page, with filter', function(done){
        view.filter('foo bar baz');
        wait(501)
        .then(serverRespond(13, 1, {total: 5}))
        .then(function(request){
          var decodedURI = window.decodeURI(request.url);
          try {
            assert.include(decodedURI, '/api/communities?');
            assert.include(decodedURI, 'perPage=13');
            assert.include(decodedURI, 'page=1');
            assert.include(decodedURI, 'sortField=name');
            assert.include(decodedURI, 'sortDir=desc');
            assert.include(decodedURI, 'filter=foo bar baz');
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });

    describe('#moveToPage(pageNum)()', function(){
      it('should submit request with page = pageNum', function(done){
        view.filter('');
        view.toggleSort('')();
        wait(501)
        .then(serverRespond(13, 1, {}))
        .then(function(request){
          view.moveToPage(3)();
          return wait(501);
        })
        .then(serverRespond(13, 2, {}))
        .then(function(request){
          var decodedURI = window.decodeURI(request.url);
          try {
            assert.include(decodedURI, '/api/communities?');
            assert.include(decodedURI, 'perPage=13');
            assert.include(decodedURI, 'page=3');
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it('should do something specific when pageNum is out of range?');
    });

    describe('#numPages()', function(){
      it('should be correct number of pages determined by response from server', function(done){
        view.filter('');
        view.toggleSort('')();
        view.moveToPage(1)();
        wait(501)
        .then(serverRespond(13, 1, {}))
        .then(function(){return wait(0)}) // allow DataTable to respond to changes before we assert changes to its structure
        .then(function(request){
          // from mock server: {total: 100, results: [...]}
          // with perPage of 13 and total of 100, should get (100 / 13).ceil
          try {
            assert.equal(view.numPages(), Math.ceil(100 / 13));
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it('should change when a request returns that server has a different total', function(done){
        view.moveToNextPage();
        wait(501)
        .then(serverRespond(13, 2, {total: 120}))
        .then(function(){return wait(0)}) // allow DataTable to respond to changes before we assert changes to its structure
        .then(function(request){
          try {
            assert.equal(view.numPages(), Math.ceil(120 / 13));
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });

    describe('#pageClass(pageNum)()', function(){

      it("should be undefined for pages that aren't the current page", function(done){
        view.moveToPage(1)();
        wait(501)
        .then(serverRespond(13, 1, {}))
        .then(function(){return wait(0)}) // allow DataTable to respond to changes before we assert changes to its structure
        .then(function(request){
          try {
            assert.equal(view.pageClass(2)(), undefined);
            assert.equal(view.pageClass(3)(), undefined);
            assert.equal(view.pageClass(20)(), undefined);
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("should be active for current page", function(done){
        assert.equal(view.pageClass(1)(), 'active');
        view.moveToPage(2)();
        wait(501)
        .then(serverRespond(13, 2, {}))
        .then(function(){return wait(0)}) // allow DataTable to respond to changes before we assert changes to its structure
        .then(function(request){
          try {
            assert.equal(view.pageClass(2)(), 'active');
            assert.equal(view.pageClass(1)(), undefined);
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });

    describe('#refreshData()', function(){
      it('should submit request with current state of view model', function(done){
        view.perPage(13);
        view.moveToPage(1)();
        view.filter('');
        view.toggleSort('')();
        wait(501)
        .then(serverRespond(13, 1, {}))
        .then(function(request){
          try {
            assert.equal(server.requests.length, 0);
            view.refreshData();
            assert.equal(server.requests.length, 1);

            var decodedURI = window.decodeURI(server.requests[0].url);
            assert.include(decodedURI, '/api/communities?');
            assert.include(decodedURI, 'perPage=13');
            assert.include(decodedURI, 'page=1');
            assert.notInclude(decodedURI, 'sortField=');
            assert.notInclude(decodedURI, 'sortDir=');
            assert.notInclude(decodedURI, 'filter=');

            server.requests[0].respond(200, {
              "Content-Type": "application/json"
            }, _examplePaginationResponseFromServer(13, 1));
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });

    describe('#addRecord(newRecord)', function(){
      it('should throw error if called', function(done){
        try {
          assert.throws(function(){
            view.addRecord({any: 'thing'});
          }, '#addRecord() not applicable with serverSidePagination enabled');
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    describe('#removeRecord(record)', function(){
      it('should throw error if called', function(done){
        try {
          assert.throws(function(){
            view.removeRecord({any: 'thing'});
          }, '#removeRecord() not applicable with serverSidePagination enabled');
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    describe('#replaceRows(array)', function(){
      it('should throw error if called', function(done){
        try {
          assert.throws(function(){
            view.replaceRows([{any: 'thing'}]);
          }, '#replaceRows() not applicable with serverSidePagination enabled');
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
