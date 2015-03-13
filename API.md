# API Documentation

The following methods are available on the DataTable instance:
* `perPage(numPerPage)`
  * goes to first page
  * changes the number of results returned by `pagedRows()` to `numPerPage`
* `moveToPrevPage()` - go to the previous page (if not on page 1)
* `moveToNextPage()` - go to next page (if not on last page)
* `moveToPage(pageNum)()` - go to page `pageNum`
* `toggleSort(field)()`
  - switches to ascending sort if already sorted descending by `field`
  - switches to descending sort if already sorted ascending by `field`
  - sorts ascending by `field` if not already sorted by `field`
* `pageClass(pageNum)()` - returns `"active"` if `pageNum` is the current page
* `addRecord(new_record)` - pushes `new_record` onto the datatable's rows
  * **NB:** Not available when using server-side Pagination
* `removeRecord(record)` - removes `record` from the datatable's rows
  * **NB:** Not available when using server-side Pagination
* `replaceRows(new_rows_array)`
  - resets the DataTable's rows to `new_rows_array`
  - sets the current page to `1`
  - **NB:** Not available when using server-side Pagination
* `pagedRows()` - returns rows with all of the filters, paging and sorting applied

## Server-Side Pagination

The following methods are available only when using server-side pagination:

* `refreshData()` - resubmits the request with the current state of the DataTable
  * Useful for getting data which may have changed since the last request was submitted

The following methods are not available (and will throw an error when called) when using server-side pagination:

* `addRecord`
* `removedRecord`
* `replaceRows`

When using server-side pagination, some methods will respond differently:

* `perPage(numPerPage)` - resubmits the request with the new perPage and page
* `moveToPrevPage()` - resubmits the request with the new page
* `moveToNextPage()` - resubmits the request with the new page
* `moveToPage(pageNum)()` - resubmits the request with the new page
* `toggleSort(field)()` - resubmits the request with the new sortBy
