class PaginationHandler {

  constructor() {
    this.perPage = void 0;
    this.currentPage = void 0;
    this.sortDir = void 0;
    this.sortField = void 0;
    this.filter = void 0;
  }

  getData(rows) {
    // Classes extending PaginationHandler should overwrite getData() without calling super()
    // Method should return a promise, resolving the result with format:
    //// {numPages: Number, numFilteredRows: Number, pagedRows: Array}
    return new Promise(null,
      reject => reject(new Error(
        "This method should have been overwritten by classes which subclass " +
        "PaginationHandler, but it was not. Do not call super() in " +
        "subclasses for this method."
      ))
    );
  }

  set perPage(value) {
    if (this.perPage !== value) {
      this.currentPage = 1;
      this.perPage = value;
    }
  }
  set sortDir(value) {
    if (this.sortDir !== value) {
      this.currentPage = 1;
      this.sortDir = value;
    }
  }
  set sortField(value) {
    if (this.sortField !== value) {
      this.currentPage = 1;
      this.sortField = value;
    }
  }
  set filter(value) {
    if (this.filter !== value) {
      this.currentPage = 1;
      this.filter = value;
    }
  }
}
