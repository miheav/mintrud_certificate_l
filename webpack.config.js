// webpack.config.js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin")
const { extendDefaultPlugins } = require("svgo")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {
  return {
    devServer: {
      historyApiFallback: true,
      static: {
        directory: path.resolve(__dirname, './public'),
      },
      open: true,
      compress: true,
      hot: true,
      port: 8080,
      devMiddleware: {
        publicPath: './public',
        writeToDisk: true,
      },
    },
    entry: {
      main: path.resolve(__dirname, './src/index.js')
    },
    devtool: 'inline-source-map',
    output: {
      path: path.resolve(__dirname, './public/asset'),
      filename: "[name].[contenthash].js",
      clean: true
    },

    module: {
      rules: [
        // JavaScript
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
        {
          test: /\.(scss|css)$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
          exclude: /node_modules/
        },
        {
          test: /\.html$/i,
          loader: "html-loader",
          options: {
            sources: {
              urlFilter: (attribute, value, resourcePath) => {
                // The `attribute` argument contains a name of the HTML attribute.
                // The `value` argument contains a value of the HTML attribute.
                // The `resourcePath` argument contains a path to the loaded HTML file.

                if (/favicon\.ico$/.test(value)) {
                  return false;
                }

                return true;
              },
            },
          },
        },
      ],
    },
    optimization: {
      minimize : argv.mode === 'production' ? true : false,
      minimizer: [
        "...",
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              // Lossless optimization with custom option
              // Feel free to experiment with options for better result for you
              plugins: [
                ["gifsicle", { interlaced: true }],
                ["jpegtran", { progressive: true }],
                ["optipng", { optimizationLevel: 5 }],
                // Svgo configuration here https://github.com/svg/svgo#configuration
                [
                  "svgo",
                  {
                    plugins: extendDefaultPlugins([
                      {
                        name: "removeViewBox",
                        active: false,
                      },
                      {
                        name: "addAttributesToSVGElement",
                        params: {
                          attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
                        },
                      },
                    ]),
                  },
                ],
              ],
            },
          },
        }),
        new CssMinimizerPlugin(),
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, './src/index.html'), // шаблон
        filename: path.resolve(__dirname, './public/index.html'), // название выходного файла
        minify: {
          collapseWhitespace: true
        }
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.ProvidePlugin({
        $: "jquery/dist/jquery.min.js",
        jQuery: "jquery/dist/jquery.min.js",
        "window.jQuery": "jquery/dist/jquery.min.js",
      }),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
      }),
      new CopyPlugin({
        patterns: [
          { from: "./src/favicon.ico", to: "../favicon.ico" }
        ],
      }),
    ],
  }
};
