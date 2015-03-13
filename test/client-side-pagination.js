describe('DataTable', function(){

  var view;

  var whenDoneLoading = function(){
    var redo = function(callback){
      if (view.loading()) {
        setTimeout(redo, 10, callback);
      } else {
        callback();
      }
    };
    return new Promise(function(resolve){
      redo(resolve);
    });
  };

  describe("client-side pagination", function(){

    describe('construction', function(){
      it('should initialize with rows as first parameter', function(){
        var rows = [];
        for (var i = 1; i <= 50; i++) {
          rows.push({id: i, name: 'row' + i});
        }
        assert.doesNotThrow(function(){
          view = new DataTable(rows, {
            recordWord: 'city',
            recordWordPlural: 'cities',
            perPage: 15
          });
        });
      });
    });

    describe('#pagedRows()', function(){
      it('should return correct number of results', function(done){
        whenDoneLoading().then(function(){
          assert.lengthOf(view.pagedRows(), 15);
          done();
        });
      });
    });

    describe('#nextPage()', function(){
      it('should adjust results returned by pagedRows()', function(done){
        assert.equal(view.pagedRows()[0].id, 1);
        view.moveToNextPage();
        whenDoneLoading().then(function(){
          assert.equal(view.pagedRows()[0].id, 16);
          done();
        });
      });
    });

    describe('#prevPage()', function(){
      it('should adjust results returned by pagedRows()', function(done){
        view.moveToPrevPage();
        whenDoneLoading().then(function(){
          assert.equal(view.pagedRows()[0].id, 1);
          done();
        });
      });
    });

    describe('#perPage(numPerPage)', function(){
      it('should adjust the number of results returned by pagedRows()', function(done){
        view.perPage(10);
        whenDoneLoading().then(function(){
          assert.lengthOf(view.pagedRows(), 10);
          done();
        });
      });

      it('should reset current page to 1', function(){
        view.moveToNextPage();
        whenDoneLoading().then(function(){
          assert.equal(view.pagedRows()[0].id, 11);
          view.perPage(15);
          return whenDoneLoading();
        }).then(function(){
          assert.equal(view.pagedRows()[0].id, 1);
          done();
        });
      });
    });
  });
});
