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

const obsComparer = (val1, val2) => {
  const item1 = ko.isObservable(val1) ? val1() : val1;
  return primitiveCompare(item1, val2);
};

class ClientSidePaginationHandler {

  rebuildRowAttributeMap(rows) {
    let _getNewMap = () => {
      let row = rows[0];
      if (row) {
        return new Map(
          [for (key of Object.keys(row)) if (row.hasOwnProperty(key)) [key.toLowerCase(), key]]
        );
      }
      return new Map();
    };
    this.rowAttributeMap = _getNewMap();
  }

  constructor(rows) {
    this.sortDir     = void 0;
    this.sortField   = void 0;
    this.perPage     = void 0;
    this.currentPage = void 0;
    this.filter      = void 0;

    this.rebuildRowAttributeMap(rows);

    const _defaultMatch = (filter, row, attrMap) => {
      return [for ([,val] of attrMap) val].some((val) => {
        let tryVal = row[val];
        if (ko.isObservable(tryVal)) {
          return primitiveCompare(tryVal(), filter);
        } else {
          return primitiveCompare(tryVal, filter);
        }
      });
    };

    this.filterFn = filterVar => {
      let specials = new Map(), filter = [];
      filterVar.split(' ').forEach((word) => {
        if (word.indexOf(':') >= 0) {
          let ret, words = word.split(':');
           switch (words[1].toLowerCase()) {
            case 'yes':
            case 'true':
              specials.set(words[0], true);
              break;
            case 'no':
            case 'false':
              specials.set(words[0], false);
              break;
            case 'blank':
            case 'none':
            case 'null':
            case 'undefined':
              specials.set(words[0], void 0);
              break;
            default:
              specials.set(words[0], words[1].toLowerCase());
              break;
          }
        } else {
          filter.push(word);
        }
      });
      filter = filter.join(' ');
      return (row) => {
        if (filter === '') {
          return true;
        } else {
          let attrMap = this.rowAttributeMap,
              attrSpecialMap = new Map([
                for ([key, val] of specials)
                [attrMap[key.toLowerCase()], val]
              ]),
              conditionals = [
                for ([rowAttr, val] of attrSpecialMap)
                  rowAttr ? obsComparer(row[rowAttr], val) : false
              ];

          if (conditionals.indexOf(false) === -1) {
            if ('function' === typeof row.match) {
              return row.match(filter);
            } else {
              return _defaultMatch(filter, row, attrMap);
            }
          } else {
            return false;
          }
        }
      };
    };
  }

  filterRows(rows) {
    let filteredRows;
    if (this.filter !== '') {
      filteredRows = rows.filter(this.filterFn(this.filter));
    } else {
      filteredRows = rows;
    }

    return Promise.resolve(filteredRows);
  }

  sortRows(rows) {
    let sortedRows = rows.slice(0);
    if (!this.sortField && this.sortField !== 0) {
      return Promise.resolve(sortedRows);
    }
    const comparer = (a, b) => {
      const [aVal, bVal] = [a, b].map(v => {
        let unwrapped = unwrapObservable(v[this.sortField]);
        if ('string' === typeof unwrapped) {
          unwrapped = unwrapped.toLowerCase();
        }
        return unwrapped;
      });

      if ('asc' === this.sortDir) {
        if (aVal < bVal || aVal === '' || aVal === null || aVal === undefined) {
          return -1;
        } else {
          if (aVal > bVal || bVal === '' || bVal === null || bVal === undefined) {
            return 1;
          } else {
            return 0;
          }
        }
      } else {
        if (aVal < bVal || aVal === '' || aVal === null || aVal === undefined) {
          return 1;
        } else {
          if (aVal > bVal || bVal === '' || bVal === null || bVal === undefined) {
            return -1;
          } else {
            return 0;
          }
        }
      }
    };
    sortedRows.sort(comparer);
    return Promise.resolve(sortedRows);
  }

  pageRows(rows) {
    const pageIndex = this.currentPage - 1,
          perPage   = this.perPage,
          pagedRows = rows.slice(pageIndex * perPage, (pageIndex + 1) * perPage);

    return Promise.resolve({pagedRows, totalNumRows: rows.length});
  }

  getData(rows) {
    return this.filterRows(rows)
      .then(filteredRows => this.sortRows(filteredRows))
      .then(sortedRows => this.pageRows(sortedRows))
      .then(({pagedRows, totalNumRows}) => Promise.resolve({
        numPages:        Math.ceil(totalNumRows / this.perPage),
        numFilteredRows: totalNumRows,
        pagedRows:       pagedRows
      }));
  }
}
