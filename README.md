# Knockout DataTable

Knockout DataTable is a flexible and reusable Knockout.js view model for data tables.

## Demo

Check out the [demo](http://rawgit.com/immense/knockout-datatable/master/demo.html) to get a quick idea of how it works and how to use it.

## Installation

To install it in your bower-enabled project, run `bower install knockout-datatable`.

Or drop the `knockout-datatable{.min}.js` file in your vendor assets javascript folder and require it in your application.

## Usage

Refer to the [demo](http://rawgit.com/immense/knockout-datatable/master/demo.html) for detailed usage instructions.

### API

The following methods are available on the DataTable instance:
* `prevPage()` - go to the previous page (if not on page 1)
* `nextPage()` - go to next page (if not on last page)
* `toggleSort(field)`
  - switches to ascending sort if sorted descending by `field`
  - switches to descending sort if sorted ascending by `field`
  - sorts ascending by `field` if not already sorted by `field`
* `gotoPage(pageNum)` - sets the current page to `pageNum`
* `pageClass(pageNum)` - returns `"active"` if `pageNum` is the current page
* `addRecord(new_record)` - pushes `new_record` onto the datatable's rows
* `removeRecord(record)` - removes `record` from the datatable's rows
* `replaceRows(new_rows_array)`
  - resets the datatable's rows to `new_rows_array`
  - sets the current page to `1`


## Building

To build the Knockout DataTable coffeescript source, do the following in a node.js enabled environment:

```
npm install -g grunt-cli
npm install
grunt
```

## Contributing

1. Fork it
1. Create your feature branch (`git checkout -b my-new-feature`)
1. Commit your changes (`git commit -am 'Add some feature'`)
1. Push to the branch (`git push origin my-new-feature`)
1. Create new Pull Request

## Contributors

See [Contributors](wiki/Contributors)

## License

Knockout DataTable is released under the MIT License. Please see the LICENSE file for details.
