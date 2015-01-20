describe('DataTable', function(){

  var view;

  describe("client-side pagination", function(){

    it('should initialize with rows as first parameter', function(){
      view = new DataTable([{foo: 'bar'}, {bar: 'baz'}], {
        recordWord: 'city',
        recordWordPlural: 'cities',
        sortDir: 'desc',
        sortField: 'population',
        perPage: 15
      });
      assert.lengthOf(view.rows(), 2);
    });
  });
});
