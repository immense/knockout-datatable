class ClientSidePaginationHandler extends PaginationHandler {

  rebuildRowAttributeMap(rows) {
    let _getNewMap = () => {
      let row = rows[0];
      if (row) {
        return new Map(
          [
            for (key of row)
            if (row.hasOwnProperty(key))
            [key.toLowerCase(), key]
          ]
        )
      }
      return new Map();
    };
    this.rowAttributeMap = _getNewMap();
  }

  constructor(rows) {
    super();
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

    this.filterFn = this.options.filterFn || (filterVar) => {
      let specials = new Map();
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
      let filter = filter.join(' ');
      return (row) => {
        if (filter === '') {
          return true;
        } else {
          let attrMap = this.rowAttributeMap(),
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

  getData(rows) {
    let numFilteredRows = undefined;

    const _unwrapAndLowerCase = sortField => v => {
      let unwrapped = unwrapObservable(v[sortField]);
      if ('string' === typeof unwrapped) {
        unwrapped = unwrapped.toLowerCase();
      }
      return unwrapped;
    }, _filterRows = rows => new Promise(resolve => {
      if (this.filter !== '') {
        resolve(rows.filter(this.filterFn(this.filter)));
      } else {
        resolve(rows);
      }
    }), _sortRows = rows => new Promise(resolve => {
      const sortField = this.sortField, sortDir = this.sortDir;
      let rows = rows.slice(0);
      if (!sortField && sortField !== 0) {
        resolve(rows);
        return;
      }
      const unwrapper = _unwrapAndLowerCase(sortField);
      const comparer = (a, b) => {
        const [aVal, bVal] = [a, b].map(unwrapper);

        if ('asc' === sortDir) {
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
      rows.sort(comparer);
      resolve(rows);
    }), _sliceRows = rows => new Promise(resolve => {
      const pageIndex = this.currentPage - 1, perPage = this.perPage;
      resolve(rows.slice(pageIndex * perPage, (pageIndex + 1) * perPage));
    }), _setNumFilteredRows = filteredRows => new Promise(resolve => {
      numFilteredRows = filteredRows.length;
      resolve(filteredRows);
    }), _packageResults = pagedRows => new Promise(resolve => {
      resolve({
        numPages: Math.ceil(numFilteredRows / this.perPage),
        numFilteredRows: numFilteredRows,
        pagedRows: pagedRows
      });
    });

    return _filterRows(rows)
      .then(_setNumFilteredRows)
      .then(_sortRows)
      .then(_sliceRows)
      .then(_packageResults);
  }
}
