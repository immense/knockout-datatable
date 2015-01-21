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

});
