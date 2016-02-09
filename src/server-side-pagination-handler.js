export default class ServerSidePaginationHandler {

  constructor({path, loader}) {
    if (!(path && loader)) {
      throw new Error("`path` or `loader` missing from `serverSidePagination` object");
    }
    this.paginationPath = path;
    this.resultHandlerFn = loader;
    this.sortDir = null;
    this.sortField = null;
    this.perPage = null;
    this.currentPage = null;
    this.filter = null;
  }

  getData() {
    return new Promise((resolve, reject) => {
      const preparedData = {
        perPage: this.perPage,
        page: this.currentPage,
        filter: this.filter || this.filter === 0 ? this.filter : null
      };

      if ((this.sortField || this.sortField === 0) && (this.sortDir || this.sortDir === 0)) {
        preparedData.sortDir = this.sortDir;
        preparedData.sortField = this.sortField;
      }

      let url = `${this.paginationPath}?`;

      for (key in preparedData) {
        const val = preparedData[key];
        if (val || val === 0) {
          url = `${url}&${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
        }
      }

      const req = new XMLHttpRequest();
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
          numPages: Math.ceil(response.total / this.perPage),
          pagedRows: response.results.map(this.resultHandlerFn)
        });
      } else {
        reject(new Error("Server response missing either `total` or `results` (or both)"));
      }
    }));
  }
};
