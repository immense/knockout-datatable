const pureComputed = ko.pureComputed || ko.computed;

window.DataTable = class DataTable {

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

    this.rows = rows.slice(0);

    this.options = {
      recordWord:       options.recordWord          || 'record',
      recordWordPlural: options.recordWordPlural    || (options.recordWord || 'record') + 's',
      sortDir:          options.sortDir             || 'asc',
      sortField:        options.sortField           || void 0,
      perPage:          options.perPage             || 15,
      filterFn:         options.filterFn            || void 0,
      unsortedClass:    options.unsortedClass       || '',
      descSortClass:    options.descSortClass       || '',
      ascSortClass:     options.ascSortClass        || '',
      rateLimitTimeout: options.rateLimitTimeout    || void 0
    };

    this.numPages         = ko.observable(void 0);
    this.numFilteredRows  = ko.observable(void 0);
    this.pagedRows        = ko.observable(void 0);
    this.firstRecordIndex = ko.observable(void 0);
    this.lastRecordIndex  = ko.observable(void 0);

    this.sortDir          = ko.observable(this.options.sortDir);
    this.sortField        = ko.observable(this.options.sortField);
    this.perPage          = ko.observable(this.options.perPage);
    this.currentPage      = ko.observable(1);
    this.filter           = ko.observable('');
    this.loading          = ko.observable(false);

    if (serverSideOpts && serverSideOpts.enabled) {
      this.options.serverSidePaginationEnabled = true;
      if (!this.options.rateLimitTimeout && this.options.rateLimitTimeout !== 0) {
        this.options.rateLimitTimeout = 500;
      }
      this.registerPaginationHandler(new ServerSidePaginationHandler(serverSideOpts));
    } else {
      this.registerPaginationHandler(new ClientSidePaginationHandler(this.rows));
    }
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
    const refreshListener = ko.computed(() => {
      subscribeToProperties.forEach(property => {
        handler[property] = this[property]();
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
        lastRecordIndex  = this.currentPage() * this.perPage(),
        numFilteredRows  = this.numFilteredRows();

    if (lastRecordIndex > numFilteredRows) {
      lastRecordIndex = numFilteredRows;
    }

    return {
      firstRecordIndex: firstRecordIndex,
      lastRecordIndex: lastRecordIndex
    };
  }

  refreshData() {
    this.loading(true);
    this.handler.getData(this.rows).then(({numPages, numFilteredRows, pagedRows}) => {
      this.numPages(numPages);
      this.numFilteredRows(numFilteredRows);

      const recordIndexes = this.recordIndexes;

      this.pagedRows(pagedRows);
      this.firstRecordIndex(recordIndexes.firstRecordIndex);
      this.lastRecordIndex(recordIndexes.lastRecordIndex);

      this.loading(false);
    })
    .catch(err => {
      throw err;
    });
  }

  addRecord(record) {
    if (this.options.serverSidePaginationEnabled) {
      throw new Error("#addRecord() not applicable with serverSidePagination enabled");
    } else {
      this.rows.push(record);
      this.refreshData();
    }
  }

  removeRecord(record) {
    if (this.options.serverSidePaginationEnabled) {
      throw new Error("#removeRecord() not applicable with serverSidePagination enabled");
    } else {
      const index = this.rows.indexOf(record);
      if (index !== -1) {
        this.rows.splice(index, 1);
        if (this.onLastPage() && this.pagedRows().length === 1) {
          this.moveToPrevPage();
        } else {
          this.refreshData();
        }
      } else {
        throw new Error("Could not remove record; record not found");
      }
    }
  }

  replaceRows(rows) {
    if (this.options.serverSidePaginationEnabled) {
      throw new Error("#replaceRows() not applicable with serverSidePagination enabled");
    } else {
      this.rows = rows.slice(0);
      this.currentPage(1);
      this.filter(void 0);
    }
  }

  // TODO: Should this be here? It's more related to the view than the underlying datatable
  pageClass(page) {
    return pureComputed(() => {
      if (this.currentPage() === page) {
        return 'active';
      }
    });
  }

  // TODO: Should this be here? It's more related to the view than the underlying datatable
  get leftPagerClass() {
    return pureComputed(() => {
      if (this.currentPage() === 1) {
        return 'disabled';
      }
    });
  }

  // TODO: Should this be here? It's more related to the view than the underlying datatable
  get rightPagerClass() {
    return pureComputed(() => {
      if (this.currentPage() === this.numPages()) {
        return 'disabled';
      }
    });
  }

  // TODO: Should this be here? It's more related to the view than the underlying datatable
  get recordsText() {
    return pureComputed(() => {
      const pages            = this.numPages(),
            total            = this.numFilteredRows(),
            from             = this.firstRecordIndex(),
            to               = this.lastRecordIndex(),
            recordWord       = this.options.recordWord,
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
    return pureComputed(() => {
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
    return pureComputed(() => {
      return this.loading();
    });
  }

  // TODO: Should this be here? It's more related to the view than the underlying datatable
  sortClass(column) {
    return pureComputed(() => {
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
