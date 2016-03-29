/* eslint no-var: 0 */

module.exports = {
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
      },
    ],
  },

  output: {
    library: 'ContainerQueries',
    libraryTarget: 'umd',
  },

  resolve: {
    extensions: ['', '.js'],
  },
};
