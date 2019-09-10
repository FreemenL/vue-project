/**
 * 生产环境配置
 */
const path = require("path");
const chalk = require('chalk');//终端样式
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
const devMode = process.env.NODE_ENV !== 'production';
const common = require('./webpack.base.js');
const SentryCliPlugin = require('@sentry/webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const paths = require('./paths');

module.exports = merge(common, {
  devtool: 'source-map',
  mode: "production",
  output: {
    filename: 'static/js/[name].[contenthash].js',
    chunkFilename: 'static/js/[id].[name].[chunkhash].js',
    path: paths.appBuild,
    publicPath: './'
  },
  optimization: {
    sideEffects: true,
    usedExports: true,
    nodeEnv: 'production',
    namedModules: true,
    //在编译时出现错误时，使用跳过发射阶段。
    noEmitOnErrors: true,
    //运行时的每个入口点添加一个额外的块
    runtimeChunk: {
      name: 'manifest'
    },
    minimize: true,
    minimizer: [
      // new UglifyJSPlugin({
      //   exclude: /.dll.js$/,
      //   uglifyOptions: {
      //     warnings: false,
      //     output: {
      //       beautify: false,
      //     }
      //   },
      //   //提取注释
      //   extractComments: true,
      //   sourceMap: false,
      //   cache: true,
      //   //开启多线程。默认并发运行数：os.cpus().length - 1
      //   parallel: true
      // }),
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true,
          autoprefixer: { disable: true },
          discardComments: {
            removeAll: true // 移除注释
          }
        }
      })
    ],
    splitChunks: {//代码拆分
      name: true,
      chunks: 'all',
      minSize: 30000,
      minChunks: 1,
      //最大的异步请求数
      maxAsyncRequests: 5,
      //最大的初始请求数
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      cacheGroups: {
        default:false,
        "ant-icon": {
          test: /[\\/]node_modules[\\/](@ant-design|_@ant-design)/,
          chunks: 'initial',
          minChunks: 1,
          name: 'ant-icon',
          priority:100,
          enforce: true,
        },
        moment: {
          test: /[\\/]node_modules[\\/](moment|_moment)/,
          chunks: 'initial',
          minChunks: 1,
          name: 'moment',
          priority:99,
          enforce: true,
        },
        'element-ui': {
          test: /[\\/]node_modules[\\/](element-ui|_element-ui)/,
          chunks: 'initial',
          minChunks: 1,
          name: 'element-ui',
          priority:98,
          enforce: true,
        },
        echarts: {
          test: /[\\/]node_modules[\\/](echarts|_echarts)/,
          chunks: 'initial',
          minChunks: 1,
          name: 'echarts',
          priority:97,
          enforce: true,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'initial',
          minChunks: 1,
          name: 'vendors',
          priority:94,
          enforce: true,
        },
         // 处理异步chunk
        'async-vendors': {
          test: /[\\/]node_modules[\\/]/,
          minChunks: 2,
          chunks: 'async',
          priority:94,
          name: 'async-vendors',
          enforce: true,
        },
        style: {
          chunks: 'all',
          name: 'style',
          minChunks: 1,
          priority:90,
          reuseExistingChunk: true,
          enforce: true,
          test: /.(css|scss|less)$/
        }
      }
    }
  },
  plugins: [
    new SentryCliPlugin ({
      release: "0.0.1",//版本号
      include: path.join(__dirname,'../dist/static/js/'), //需要上传到sentry服务器的资源目录,会自动匹配js 以及map文件
      ignore: ['node_modules', 'webpack.config.js'], //忽略文件目录,当然我们在inlcude中制定了文件路径,这个忽略目录可以不加
      configFile :'.sentryclirc',
      urlPrefix : "~/static/js"    //  线上对应的url资源的相对路径 比如我的域名是 http://XXX  .com/,静态资源都在 static文件夹里面,
    }),
    new CompressionWebpackPlugin({ //gzip 压缩
      filename: '[path].gz[query]',
      test: new RegExp(
        '\\.(js|css)$'    //压缩 js 与 css
      ),
      threshold: 10240,
      minRatio: 0.8
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'//node提供的常量api
      }
    }),
    //  缩减代码量  使代码在浏览器中具有更快的执行时间
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
});
