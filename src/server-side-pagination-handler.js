class ServerSidePaginationHandler {

  constructor({path, loader}) {
    if (!(path && loader)) {
      throw new Error("`path` or `loader` missing from `serverSidePagination` object");
    }
    this.paginationPath  = path;
    this.resultHandlerFn = loader;
    this.sortDir         = void 0;
    this.sortField       = void 0;
    this.perPage         = void 0;
    this.currentPage     = void 0;
    this.filter          = void 0;
  }

  getData() {
    return new Promise((resolve, reject) => {
      const preparedData = new Map()
        .set('perPage',  this.perPage)
        .set('page',     this.currentPage)
        .set('filter',  (this.filter  || this.filter === 0)  ? this.filter  : void 0);

      if ((this.sortField || this.sortField === 0) && (this.sortDir || this.sortDir === 0))
        preparedData
          .set('sortDir',   this.sortDir)
          .set('sortField', this.sortField);

      const url = `${this.paginationPath}?` +
        [
          for ([key, val] of preparedData)
            if (val || val === 0)
              `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
        ].join('&');

      let req = new XMLHttpRequest();
      req.open('GET', url, true);
      req.setRequestHeader('Content-Type', 'application/json');
      req.onload = () => {
        if (req.status >= 200 && req.status < 400) {
          resolve(JSON.parse(req.responseText));
        } else {
          reject(new Error("Error communicating with server"));
        }
      };
      req.onerror = reject;
      req.send();
    })
    .then(response => new Promise((resolve, reject) => {
      if ((response.total || response.total === 0) && response.results) {
        resolve({
          numFilteredRows: response.total,
          numPages:        Math.ceil(response.total / this.perPage),
          pagedRows:       response.results.map(this.resultHandlerFn)
        });
      } else {
        reject(new Error("Server response missing either `total` or `results` (or both)"));
      }
    }));
  }
}
