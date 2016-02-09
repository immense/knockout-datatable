function primitiveCompare(item1, item2) {
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
}

function obsCompare(val1, val2) {
  return primitiveCompare(unwrapObservable(val1), val2);
}

function buildRowAttributeMap(rows) {
  const obj = {};
  const row = rows[0];
  if (row) {
    for (key in row) {
      if (row.hasOwnProperty(key)) {
        obj[key.toLowerCase()] = key;
      }
    }
  }
  return obj;
}

function defaultMatch(attrMap, row) {
  return filter => attrMap.some(([,key]) => obsCompare(row[key], filter));
}

const private_map = new WeakMap();

export default class ClientSidePaginationHandler {

  buildRowAttributeMap(rows) {
    _private.set('rowAttributeMap', buildRowAttributeMap(rows));
  }

  splitFilter() {
    const filterVar = this.filter;
    const specials = [];
    const non_special_words = [];
    if (filterVar) {
      filterVar.split(' ').forEach(word => {
        if (word.indexOf(':') >= 0) {
          const words = word.split(':');
          switch (words[1].toLowerCase()) {
            case 'yes':
            case 'true':
            specials.push([words[0].toLowerCase(), true]);
            break;
            case 'no':
            case 'false':
            specials.push([words[0].toLowerCase(), false]);
            break;
            case 'blank':
            case 'none':
            case 'null':
            case 'undefined':
            specials.push([words[0].toLowerCase(), void 0]);
            break;
            default:
            specials.push([words[0].toLowerCase(), words[1].toLowerCase()]);
            break;
          }
        } else {
          non_special_words.push(word);
        }
      });
      _private.set('filter__specials', specials);
      _private.set('filter__non_special_words', non_special_words.join(' '));
    } else {
      _private.set('filter__specials', []);
      _private.set('filter__non_special_words', null);
    }
  }

  constructor() {
    const _private = new Map();
    private_map.set(this, _private);

    this.sortDir = null;
    this.sortField = null;
    this.perPage = null;
    this.currentPage = null;
    this.filter = null;
    _private.set('rowAttributeMap', {});
    _private.set('filter__specials', []);
    _private.set('filter__non_special_words', null);

    _private.set('filterRows', rows => {
      // TODO Need a way to make sure these observables are up-to-date before
      // unwrapping them.
      const rowAttrs = _private.get('rowAttributeMap');
      const specials = _private.get('filter__specials').map(([k, v]) => [rowAttrs[k], v])
      const filter_words = _private.get('filter__non_special_words');

      if (!specials.length && filter_words === '') return Promise.resolve(rows);

      function filterFn(row) {
        if (specials.all(([key, val]) => obsCompare(row[key], val))) {
          if (filter_words === '') return true;
          const match = ('function' === typeof row.match) ? row.match : defaultMatch(rowAttrs, row);
          return match(filter_words);
        } else {
          return false;
        }
      }

      return Promise.resolve(rows.filter(filterFn));
    });

    _private.set('sortRows', rows => {
      if (!this.sortField && this.sortField !== 0) {
        return Promise.resolve(rows.slice(0));
      }
      return Promise.resolve(rows.slice(0).sort((a, b) => {
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
      }));
    });

    _private.set('pageRows', rows => {
      const pageIndex = this.currentPage - 1;
      const perPage   = this.perPage;
      const pagedRows = rows.slice(pageIndex * perPage, (pageIndex + 1) * perPage);

      return Promise.resolve({pagedRows, totalNumRows: rows.length});
    });
  }

  getData(rows) {
    this.splitFilter();
    this.buildRowAttributeMap(rows);

    const _private = private_map.get(this);
    return _private.get('filterRows')(rows)
      .then(filteredRows => _private.get('sortRows')(filteredRows))
      .then(sortedRows => _private.get('pageRows')(sortedRows))
      .then(({pagedRows, totalNumRows}) => Promise.resolve({
        numPages:        Math.ceil(totalNumRows / this.perPage),
        numFilteredRows: totalNumRows,
        pagedRows:       pagedRows
      }));
  }
};
