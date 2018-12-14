const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const config = {
  entry: __dirname + '/static/js/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'main.js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css']
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        test: /\.js(\?.*)?$/i,
        cache: true,
        parallel: true
      })
    ]
  },   
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })      
      },        
    ]
  },
  plugins: [
    new ExtractTextPlugin('styles.css')
  ]
};
module.exports = config
