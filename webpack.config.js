module.exports = {
    entry: {
      'knockout-datatable': './src/knockout-datatable'
    },
    output: {
      filename: "[name].js",
      path: `${__dirname}/dist`,
      libraryTarget: 'umd'
    },
    module: {
      loaders: [
        {
          test: /\.js?$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel'
        }
      ]
    }
};
