import webpack from 'webpack';
import defaultConfig from './webpack.config.babel';

const {
  optimize: {OccurenceOrderPlugin, UglifyJsPlugin},
  DefinePlugin,
} = webpack;

export default {
  ...defaultConfig,
  plugins: [
    new OccurenceOrderPlugin(),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new UglifyJsPlugin({
      compressor: {
        screw_ie8: true, // eslint-disable-line camelcase
        warnings: false,
      },
    }),
  ],
};
