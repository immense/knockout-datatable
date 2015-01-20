describe('DataTable', function(){
  var view;

  describe('server-side pagination', function(){
    var server, examplePaginationResponseFromServer = function(perPage, page, opts){
      if (!opts) opts = {};
      if (!(perPage && page)) {
        throw new Error("perPage and page required to construct example response");
        return;
      }
      return JSON.stringify({
        total: (opts.total || 100),
        results: [0,1,2,3,4,5,6,7,8,9,10,11,12].map(function(i){
          var id = ((page - 1) * perPage) + i;
          return {
            id: id,
            name: 'res' + id
          }
        })
      });
    };

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
        setTimeout(function(){
          assert.equal(server.requests.length, 1);
          assert.include(server.requests[0].url, '/api/communities?');
          assert.include(server.requests[0].url, 'perPage=13');
          assert.include(server.requests[0].url, 'page=1');
          server.requests[0].respond(200, {
            "Content-Type": "application/json"
          }, examplePaginationResponseFromServer(13, 1));
          done();
        }, 501);
      });
    });
    describe('#pagedRows()', function(){
      describe('should return the correct results', function(){

        it('should return correct number of results', function(){
          assert.lengthOf(view.pagedRows(), 13);
        });

        it('should map results using `loader` function', function(){
          var rows = view.pagedRows();
          assert.equal(rows[0].name, 'res0');
          assert.equal(rows[0].type, 'foobar');
        });
      });
    });
    describe('#nextPage()', function(){
      it('should submit request for next page', function(done){
        view.nextPage();
        setTimeout(function(){
          assert.equal(server.requests.length, 1);
          assert.include(server.requests[0].url, '/api/communities?');
          assert.include(server.requests[0].url, 'perPage=13');
          assert.include(server.requests[0].url, 'page=2');
          assert.notInclude(server.requests[0].url, 'sortBy=');
          assert.notInclude(server.requests[0].url, 'sortDir=');
          server.requests[0].respond(200, {
            "Content-Type": "application/json"
          }, examplePaginationResponseFromServer(13, 2));
          done();
        }, 501);
      });
    });
    describe('#prevPage()', function(){
      it('should submit request for previous page', function(done){
        view.prevPage();
        setTimeout(function(){
          assert.equal(server.requests.length, 1);
          assert.include(server.requests[0].url, '/api/communities?');
          assert.include(server.requests[0].url, 'perPage=13');
          assert.include(server.requests[0].url, 'page=1');
          assert.notInclude(server.requests[0].url, 'sortBy=');
          assert.notInclude(server.requests[0].url, 'sortDir=');
          server.requests[0].respond(200, {
            "Content-Type": "application/json"
          }, examplePaginationResponseFromServer(13, 1));
          done();
        }, 501);
      });
    });
    describe('#toggleSort(fieldName)()', function(){
      it('should submit request for current page, sorted desc', function(done){
        view.toggleSort('name')();
        setTimeout(function(){
          assert.equal(server.requests.length, 1);
          assert.include(server.requests[0].url, '/api/communities?');
          assert.include(server.requests[0].url, 'perPage=13');
          assert.include(server.requests[0].url, 'page=1');
          assert.include(server.requests[0].url, 'sortBy=name');
          assert.include(server.requests[0].url, 'sortDir=asc');
          server.requests[0].respond(200, {
            "Content-Type": "application/json"
          }, examplePaginationResponseFromServer(13, 1));
          done();
        }, 501);
      });

      it('should submit request for current page, sorted asc', function(done){
        view.toggleSort('name')();
        setTimeout(function(){
          assert.equal(server.requests.length, 1);
          assert.include(server.requests[0].url, '/api/communities?');
          assert.include(server.requests[0].url, 'perPage=13');
          assert.include(server.requests[0].url, 'page=1');
          assert.include(server.requests[0].url, 'sortBy=name');
          assert.include(server.requests[0].url, 'sortDir=desc');
          server.requests[0].respond(200, {
            "Content-Type": "application/json"
          }, examplePaginationResponseFromServer(13, 1));
          done();
        }, 501);
      });
    });

    describe('#pages()', function(){
      it('should be correct number of pages determined by response from server', function(){
        // from mock server: {total: 100, results: [...]}
        // with perPage of 13 and total of 100, should get (100 / 13).ceil
        assert.equal(view.pages(), Math.ceil(100 / 13));
      });

      it('should change when a request returns that server has a different total', function(done){
        view.nextPage();
        setTimeout(function(){
          server.requests[0].respond(200, {
            "Content-Type": "application/json"
          }, examplePaginationResponseFromServer(13, 2, {total: 120}));
          assert.equal(view.pages(), Math.ceil(120 / 13));
          done();
        }, 501);
      });
    });

    describe('#gotoPage(pageNum)()', function(){
      it('should submit request with page = pageNum', function(done){
        view.gotoPage(3)();
        setTimeout(function(){
          assert.equal(server.requests.length, 1);
          assert.include(server.requests[0].url, '/api/communities?');
          assert.include(server.requests[0].url, 'perPage=13');
          assert.include(server.requests[0].url, 'page=3');
          assert.include(server.requests[0].url, 'sortBy=name');
          assert.include(server.requests[0].url, 'sortDir=desc');
          server.requests[0].respond(200, {
            "Content-Type": "application/json"
          }, examplePaginationResponseFromServer(13, 3));
          done();
        }, 501);
      });

      it('should do something specific when pageNum is out of range?');
    });

    describe('#pageClass(pageNum)()', function(){

      it("should be undefined for pages that aren't the current page", function(){
        assert.equal(view.pageClass(1)(), undefined);
        assert.equal(view.pageClass(2)(), undefined);
        assert.equal(view.pageClass(20)(), undefined);
      });

      it("should be active for current page", function(done){
        assert.equal(view.pageClass(3)(), 'active');
        view.gotoPage(2)();
        setTimeout(function(){
          assert.equal(view.pageClass(2)(), 'active');
          assert.equal(view.pageClass(3)(), undefined);
          server.requests[0].respond(200, {
            "Content-Type": "application/json"
          }, examplePaginationResponseFromServer(13, 2));
          done();
        }, 501);
      });
    });

    describe('#refreshData()', function(){
      it('should submit request with current state of view model', function(){
        view.refreshData();
        assert.equal(server.requests.length, 1);
        assert.include(server.requests[0].url, '/api/communities?');
        assert.include(server.requests[0].url, 'perPage=13');
        assert.include(server.requests[0].url, 'page=2');
        assert.include(server.requests[0].url, 'sortBy=name');
        assert.include(server.requests[0].url, 'sortDir=desc');
        server.requests[0].respond(200, {
          "Content-Type": "application/json"
        }, examplePaginationResponseFromServer(13, 2));
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
