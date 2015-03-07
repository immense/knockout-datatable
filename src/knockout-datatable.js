const pureComputed = ko.pureComputed || ko.computed;

const unwrapObservable = ko.utils.unwrapObservable;

const primitiveCompare = (item1, item2) => {
  if (item2 === null || item2 === undefined) {
    return item1 === null || item1 === undefined;
  } else if (item1 !== null && item1 !== undefined) {
    if ('boolean' === typeof item1) {
      return item1 === item2;
    } else {
      return item1.toString().toLowerCase().indexOf(item2.toString().toLowerCase()) >= 0 || item1 === item2;
    }
  } else {
    return false;
  }
};

const obsComparer = (v1, v2) => {
  if (primitiveCompare((ko.isObservable(row[rowAttr])) {
    return row[rowAttr]();
  } else {
    return row[rowAttr]), val);
  }
};

window.DataTable = class DataTable {

  constructor(rows, options) {
    let serverSideOpts;
    if (!options) {
      if (!(rows instanceof Array)) {
        options = rows;
        rows = [];
      } else {
        options = {};
      }
    }

    this.rows = rows.slice(0);

    this.options = {
      recordWord: options.recordWord || 'record',
      recordWordPlural: options.recordWordPlural,
      sortDir: options.sortDir || 'asc',
      sortField: options.sortField || void 0,
      perPage: options.perPage || 15,
      filterFn: options.filterFn || void 0,
      unsortedClass: options.unsortedClass || '',
      descSortClass: options.descSortClass || '',
      ascSortClass: options.ascSortClass || ''
    };

    this.sortDir = ko.observable(this.options.sortDir);
    this.sortField = ko.observable(this.options.sortField);
    this.perPage = ko.observable(this.options.perPage);
    this.currentPage = ko.observable(1);
    this.filter = ko.observable('');
    this.loading = ko.observable(false);

    _registerPaginationHandler = (handler) => {
      this.handler = handler;
      const subscribeToProperties = [
        'sortDir',
        'sortField',
        'perPage',
        'currentPage',
        'filter'
      ];
      ko.computed(() => {
        subscribeToProperties.forEach(prop => {
          handler[property] = this[property]();
        });
        this.refreshData();
      });
    }

    if ((serverSideOpts = options.serverSidePagination) && serverSideOpts.enabled) {
      if (!(serverSideOpts.path && serverSideOpts.loader)) {
        throw new Error("`path` or `loader` missing from `serverSidePagination` object");
      }
      _registerPaginationHandler(new ServerSidePaginationHandler(serverSideOpts.path, serverSideOpts.loader))
    } else {
      _registerPaginationHandler(new ClientSidePaginationHandler(rows));
    }
  }

  this.leftPagerClass = pureComputed(() => {
    if (this.currentPage() === 1) {
      return 'disabled';
    }
  });

  this.rightPagerClass = pureComputed(() => {
    if (this.currentPage() === this.pages()) {
      return 'disabled';
    }
  });

  this.recordsText = pureComputed(() => {
    let pages = this.pages(),
        total = this.total(),
        from = this.from(),
        to = this.to(),
        recordWord = this.options.recordWord,
        recordWordPlural = this.options.recordWordPlural || recordWord + 's';
    if (pages > 1) {
      return `${from} to ${to} of ${total} ${recordWordPlural}`;
    } else {
      return `${total} ${(total > 1 || total === 0 ? recordWordPlural : recordWord)}`;
    }
  });

  this.showNoData = pureComputed(() => {
    return (this.pagedRows().length === 0) && !this.loading();
  });

  this.showLoading = pureComputed(() => {
    return this.loading();
  });

  this.sortClass = (column) => {
    return pureComputed(() => {
      if (this.sortField() === column) {
        if ('asc' === this.sortDir()) {
          return this.options.ascSortClass
        } else {
          return this.options.descSortClass
        }
      } else {
        return this.options.unsortedClass;
      }
    });
  };

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
    if (!onFirstPage()) {
      this.currentPage(this.currentPage() - 1);
    } else {
      this.refreshData();
    }
  }

  moveToNextPage() {
    if (!onLastPage()) {
      this.currentPage(this.currentPage() + 1);
    } else {
      this.refreshData();
    }
  }

  goToPage(page) {
    return () => {
      this.currentPage(page);
    };
  }

  refreshData() {
    const _getRecordIndexes = (numFilteredRows) => {
      let firstRecordIndex = ((this.currentPage() - 1) * this.perPage()) + 1;
      let lastRecordIndex = this.currentPage() * this.perPage();
      if (lastRecordIndex > numFilteredRows) {
        lastRecordIndex = numFilteredRows;
      }
      return {
        firstRecordIndex: firstRecordIndex,
        lastRecordIndex: lastRecordIndex
      };
    };
    let {numPages, numFilteredRows, pagedRows} = handler.getData(this.rows),
        recordIndexes = _getRecordIndexes(numFilteredRows);

    this.numPages(numPages);
    this.numFilteredRows(numFilteredRows);
    this.pagedRows(pagedRows);
    this.firstRecordIndex(recordIndexes.firstRecordIndex);
    this.lastRecordIndex(recordIndexes.lastRecordIndex)
  }

  addRecord(record) {
    this.rows.push(record);
    refreshData();
  };

  removeRecord(record) {
    const index = this.rows.indexOf(record);
    if (index !== -1) {
      this.rows.splice(index, 1);
      if (this.onLastPage() && this.pagedRows().length === 1) {
        this.moveToPrevPage();
      } else {
        this.refreshData();
      }
    } else {
      throw new Error("Could not remove record; record not found")
    }
  };

  this.replaceRows = (rows) => {
    this.rows = rows.slice(0);
    this.currentPage(1);
    this.filter(void 0);
  };

  // TODO: Should this be here? It's more related to the view than the underlying datatable
  pageClass(page) {
    return pureComputed(() => {
      if (this.currentPage() === page) {
        return 'active';
      }
    });
  }
}
