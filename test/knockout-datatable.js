// these tests will be run in a browser via Karma.js

describe('DataTable', function(){
  var view;

  describe('construction', function(){
    it('should accept options as first parameter', function(){
      var opts = {
        recordWord: 'community',
        recordWordPlural: 'communities',
        sortDir: 'asc',
        sortField: 'name',
        perPage: 50,
        unsortedClass: 'sort-unsorted',
        descSortClass: 'sort-desc',
        ascSortClass: 'sort-asc'
      };
      view = new DataTable(opts);
    });

    it('should return instance of DataTable', function(){
      assert.instanceOf(view, DataTable);
    });
  });

  describe("client-side instance", function(){
    view = new DataTable({});

    it('should do client-side things', function(){
      assert.equal(true, true);
    });

  });

  describe('server-side instance', function(){
    var server, examplePaginationResponseFromServer = JSON.stringify({
      total: 30,
      results: [0,1,2,3,4,5,6,7,8,9,10,11,12].map(function(i){return {name: 'res' + i}})
    });

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
              loader: function(result){return result}
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
              loader: function(result){return result}
            }
          });
        });
        setTimeout(function(){
          assert.equal(server.requests.length, 1);
          assert.include(server.requests[0].url, '/api/communities?perPage=13&page=1');
          server.requests[0].respond(200, {
            "Content-Type": "application/json"
          }, examplePaginationResponseFromServer);
          done()
        }, 600);
      });
    });
    describe('#pagedRows()', function(){
      it('should return the correct results', function(){
        var pagedRows = view.pagedRows();
        assert.lengthOf(pagedRows, 13);
        assert.equal(pagedRows[0].name, 'res0');
      });
    });
    describe('#nextPage()', function(){
      it('should submit request for next page', function(){

      });
    });
    describe('#prevPage()', function(){
      it('should submit request for previous page', function(){

      });
    });
    describe('#toggleSort(fieldName)', function(){
      it('should do something specific', function(){

      });
    });
    describe('#gotoPage(pageNum)', function(){
      it('should do something specific', function(){

      });
    });
    describe('#pageClass(pageNum)', function(){
      it('should do something specific', function(){

      });
    });
    describe('#addRecord(newRecord)', function(){
      it('should do something specific', function(){

      });
    });
    describe('#removeRecord(record)', function(){
      it('should do something specific', function(){

      });
    });
    describe('#replaceRows(array)', function(){
      it('should do something specific', function(){

      });
    });

    describe('#pagedRows()', function(){
      it('should be equivelent to #rows()', function(){

      });
    });
  });

});
