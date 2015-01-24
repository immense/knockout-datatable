describe('DataTable', function(){

  var view;

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
      it('should return correct number of results', function(){
        assert.lengthOf(view.pagedRows(), 15);
      });
    });

    describe('#nextPage()', function(){
      it('should adjust results returned by pagedRows()', function(){
        assert.equal(view.pagedRows()[0].id, 1);
        view.nextPage();
        assert.equal(view.pagedRows()[0].id, 16);
      });
    });

    describe('#prevPage()', function(){
      it('should adjust results returned by pagedRows()', function(){
        view.prevPage();
        assert.equal(view.pagedRows()[0].id, 1);
      });
    });

    describe('#perPage(numPerPage)', function(){
      it('should adjust the number of results returned by pagedRows()', function(){
        view.perPage(10);
        assert.lengthOf(view.pagedRows(), 10);
      });

      it('should reset current page to 1', function(){
        view.nextPage();
        assert.equal(view.pagedRows()[0].id, 11);
        view.perPage(15);
        assert.equal(view.pagedRows()[0].id, 1);
      });
    });
  });
});
