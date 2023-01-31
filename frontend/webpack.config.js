const Path = require('path');
const { ConfigFile } = require('@spraxdev/node-commons');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const cfg = new ConfigFile(Path.join(__dirname, 'config', 'config.json'), { backendUrl: '' });
cfg.saveIfChanged();

/** @type {import('webpack').Configuration & {devServer: import('webpack-dev-server').Configuration}} */
module.exports = {
  entry: {
    index: './src/index.ts'
  },
  devtool: 'source-map',

  plugins: [
    new HtmlWebpackPlugin({
      title: '',
      template: 'src/index.html',

    }),
    new MiniCssExtractPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'resources/*', to: '[name][ext]' },
        { from: 'resources/favicon/*', to: 'favicon/[name][ext]' },
        { from: 'resources/favicon/favicon.ico', to: '[name][ext]' }
      ]
    })
  ],

  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },

  output: {
    filename: '[name].bundle.js',
    path: Path.resolve(__dirname, 'dist'),
    clean: true,
    pathinfo: false
  },

  devServer: {
    static: Path.resolve(__dirname, 'dist'),
    port: 8080,

    hot: true,
    liveReload: true,
    watchFiles: ['src/**/*.html']
  },

  module: {
    rules: [
      { test: /\.png$/, type: 'asset/resource' },
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },

      {
        test: /\.(scss)$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: 'css-loader' },
          {
            loader: 'postcss-loader',
            options: { postcssOptions: { plugins: () => [require('autoprefixer')] } }
          },
          { loader: 'sass-loader' }
        ]
      }
    ]
  }
};
