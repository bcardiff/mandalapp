const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  context: path.resolve(__dirname, './src'),
  entry: {
    index: './index.js'
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new ExtractTextPlugin("styles.[contenthash].css"),
    new HtmlWebpackPlugin({
      title: 'Almandala',
      template: path.resolve(__dirname, './src/template.ejs')
    }),
    new UglifyJSPlugin(),
  ],
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ["es2016", "react"],
          plugins: [require('babel-plugin-transform-object-rest-spread')]
        }
      }
    },
    {
      test: /\.scss$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [{
          loader: "css-loader"
        }, {
          loader: "sass-loader"
        }]
      })
    }]
  }
};
