const _option_defaults = {
  recordWord: 'record',
  recordWordPlural: 'records',
  sortDir: 'asc',
  sortField: null,
  perPage: 15,
  filterFn: null,
  unsortedClass: '',
  descSortClass: '',
  ascSortClass: '',
  rateLimitTimeout: null
};

const _com = ko.pureComputed || ko.computed;
const _obs = (arg = null) => ko.observable(arg);
const _unwrap = ko.utils.unwrapObservable;

export class DataTable {

  constructor(rows, options) {
    if (!options) {
      if (!(rows instanceof Array)) {
        options = rows;
        rows = [];
      } else {
        options = {};
      }
    }

    const serverSideOpts = options.serverSidePagination;

    this._rows = rows.slice(0);

    this.options = Object.assign({}, _option_defaults, options);
    if (options.recordWord != null && options.recordWordPlural == null) {
      this.options.recordWordPlural = `${this.options.recordWord}s`;
    }

    this.numPages = _obs();
    this.numFilteredRows = _obs();
    this.pagedRows = _obs();
    this.firstRecordIndex = _obs();
    this.lastRecordIndex = _obs();

    this.sortDir = _obs(this.options.sortDir);
    this.sortField = _obs(this.options.sortField);
    this.perPage = _obs(this.options.perPage);
    this.currentPage = _obs(1);
    this.filter = _obs('');
    this.loading = _obs(false);
  }

  registerPaginationHandler(handler) {
    this.handler = handler;
    const subscribeToProperties = [
      'sortDir',
      'sortField',
      'perPage',
      'currentPage',
      'filter'
    ];
    const refreshListener = _com(() => {
      subscribeToProperties.forEach(property => {
        handler[property] = _unwrap(this[property]);
      });
      this.refreshData();
    });
    if (this.options.rateLimitTimeout || this.options.rateLimitTimeout === 0) {
      refreshListener.extend({rateLimit: {
        timeout: this.options.rateLimitTimeout,
        method: 'notifyWhenChangesStop'
      }});
    }
  }

  toggleSort(field) {
    return () => {
      this.currentPage(1);
      if (this.sortField() === field) {
        if ('asc' === this.sortDir()) {
          this.sortDir('desc');
        } else {
          this.sortDir('asc');
        }
      } else {
        this.sortDir('asc');
        this.sortField(field);
      }
    };
  }

  onLastPage() {
    return this.currentPage() === this.numPages();
  }

  onFirstPage() {
    return this.currentPage() === 1;
  }

  moveToPrevPage() {
    if (!this.onFirstPage()) {
      this.currentPage(this.currentPage() - 1);
    } else {
      this.refreshData();
    }
  }

  moveToNextPage() {
    if (!this.onLastPage()) {
      this.currentPage(this.currentPage() + 1);
    } else {
      this.refreshData();
    }
  }

  moveToPage(page) {
    return () => {
      this.currentPage(page);
    };
  }

  get recordIndexes() {
    let firstRecordIndex = ((this.currentPage() - 1) * this.perPage()) + 1,
        lastRecordIndex = this.currentPage() * this.perPage(),
        numFilteredRows = this.numFilteredRows();

    if (lastRecordIndex > numFilteredRows) {
      lastRecordIndex = numFilteredRows;
    }

    return {
      firstRecordIndex: firstRecordIndex,
      lastRecordIndex: lastRecordIndex
    };
  }

  refreshData() {
    if (this.handler) {
      this.loading(true);
      this.handler
        .getData(this._rows)
        .then(({numPages, numFilteredRows, pagedRows}) => {
          this.numPages(numPages);
          this.numFilteredRows(numFilteredRows);

          const recordIndexes = this.recordIndexes;

          this.pagedRows(pagedRows);
          this.firstRecordIndex(recordIndexes.firstRecordIndex);
          this.lastRecordIndex(recordIndexes.lastRecordIndex);

          this.loading(false);
        });
    }
  }

  addRecord(record) {
    this._rows.push(record);
    this.refreshData();
  }

  removeRecord(record) {
    const index = this._rows.indexOf(record);
    if (index !== -1) {
      this._rows.splice(index, 1);
      if (this.onLastPage() && this.pagedRows().length === 1) {
        this.moveToPrevPage();
      } else {
        this.refreshData();
      }
    } else {
      throw new Error("Could not remove record; record not found");
    }
  }

  replaceRows(rows) {
    this._rows = rows.slice(0);
    this.currentPage(1);
    this.filter(null);
  }

  rows(rows) {this.replaceRows(rows)}

  // TODO: Should this be here? It's more related to the view than the underlying datatable
  pageClass(page) {
    return _com(() => {
      if (this.currentPage() === page) {
        return 'active';
      }
    });
  }

  // TODO: Should this be here? It's more related to the view than the underlying datatable
  get leftPagerClass() {
    return _com(() => {
      if (this.currentPage() === 1) {
        return 'disabled';
      }
    });
  }

  // TODO: Should this be here? It's more related to the view than the underlying datatable
  get rightPagerClass() {
    return _com(() => {
      if (this.currentPage() === this.numPages()) {
        return 'disabled';
      }
    });
  }

  // TODO: Should this be here? It's more related to the view than the underlying datatable
  get recordsText() {
    return _com(() => {
      const pages = this.numPages(),
            total = this.numFilteredRows(),
            from = this.firstRecordIndex(),
            to = this.lastRecordIndex(),
            recordWord = this.options.recordWord,
            recordWordPlural = this.options.recordWordPlural;

      if (pages > 1) {
        return `${from} to ${to} of ${total} ${recordWordPlural}`;
      } else {
        return `${total} ${(total > 1 || total === 0 ? recordWordPlural : recordWord)}`;
      }
    });
  }

  // TODO: Should this be here? It's more related to the view than the underlying datatable
  get showNoData() {
    return _com(() => {
      const pagedRows = this.pagedRows();
      if (pagedRows) {
        return !pagedRows.length && !this.loading();
      } else {
        return true;
      }
    });
  }

  // TODO: Should this be here? It's more related to the view than the underlying datatable
  get showLoading() {
    return _com(() => {
      return this.loading();
    });
  }

  // TODO: Should this be here? It's more related to the view than the underlying datatable
  sortClass(column) {
    return _com(() => {
      if (this.sortField() === column) {
        if ('asc' === this.sortDir()) {
          return this.options.ascSortClass;
        } else {
          return this.options.descSortClass;
        }
      } else {
        return this.options.unsortedClass;
      }
    });
  }
};

export {default as ClientSidePaginationHandler} from './client-side-pagination-handler';
export {default as ServerSidePaginationHandler} from './server-side-pagination-handler';
