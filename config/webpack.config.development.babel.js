import webpack from 'webpack';
import defaultConfig from './webpack.config.babel';

const {optimize: {OccurenceOrderPlugin}, DefinePlugin} = webpack;

export default {
  ...defaultConfig,
  plugins: [
    new OccurenceOrderPlugin(),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
};
