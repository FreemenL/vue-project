const path = require('path');
const chalk = require('chalk');
const paths = require("./paths");
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SentryCliPlugin = require('@sentry/webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const WebpackBuildLogPlugin = require("webpack-build-log-plugin");
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HtmlIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');
//优化
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

const devMode = process.env.NODE_ENV !== 'production';

//for ant overrides
// const lessToJs = require('less-vars-to-js');
const systemConfig = require(path.resolve(process.cwd(), 'config/index'));
// const themeVariables = lessToJs(fs.readFileSync(path.join(paths.appSrc, './ant-theme-vars.less'), 'utf8'));
const { systemConstant: { htmlTemplate, title }, systemPath } = systemConfig;

const webpackBaseConfig = {
  entry: {
    app: [paths.appIndex]
  },
  output: {
    filename: 'static/js/[name].js',
    path: paths.appBuild,
    publicPath: '/',
  },
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.(js|html|vue)$/,
      include: [paths.appSrc], // 精确指定要处理的目录
      use: [
        {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter'),
            fix: true,
            failOnError: true
          }
        }
      ]
    },{
      test: /\.(vue)$/,
      use: ["vue-loader"],
      include: [paths.appSrc], // 精确指定要处理的目录
    }, {
      test: /\.(js|jsx)$/,
      use: ['happypack/loader?id=happyBabel'],
      include: [...paths.appConfig,path.resolve(paths.appNodeModules,'element-ui/packages'),path.resolve(paths.appNodeModules,'element-ui/src')], // 精确指定要处理的目录
      exclude: [paths.appNodeModules]
    }, {
      test: /\.(le|c)ss$/,
      include: [paths.appSrc], // 精确指定要处理的目录
      use: [
        {
          loader: devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
        },
        {
          loader: 'css-loader',
          options: {
            modules: true,
            importLoaders: 1,
            sourceMap: devMode,
            localIdentName:'[local]_[hash:base64:8]'
          }
        },
        'postcss-loader',
        {
          loader: "less-loader",
          options: {
            sourceMap: devMode
          }
        },
      ],
    }, {
      test: /\.(le|c)ss$/,
      include: paths.appExcludeCssModule,
      use: [{
        loader: devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
      }, 'happypack/loader?id=happyStyle']
    }, {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      use:[{
        loader: 'url-loader',
        options: {
          limit: 10000,
          name:'static/imgs/[name].[ext]?[hash]'
        }
      }]
    },
    {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      use:[{
        loader: 'url-loader',
        options: {
          limit: 10000,
          name:'static/vedio/[name].[ext]?[hash]'
        }
      }]
    },
    {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      use:[{
        loader: 'url-loader',
        options: {
          limit: 10000,
          name:'static/file/[name].[ext]?[hash]'
        }
      }]
    }, {
      test: /\.(csv|tsv)$/,
      use:[
        {
          loader: 'csv-loader',
      }]
    }, {
      test: /\.xml$/,
      use:[
        {
          loader: "xml-loader",
      }]
    }
    ]
  },
  resolveLoader: {
    modules: ['node_modules', paths.appLoader]
  },
  resolve: {
    extensions: ['.vue','.js','.json','.less'],
    //指定包的引入目录 如果你想要添加一个目录到模块搜索目录，此目录优先于 node_modules/
    modules: [paths.appSrc, paths.appNodeModules],
    // mainFields: ['browser', 'module', 'main'],
    alias: {
      ...paths.appPathAlias,
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  performance: {
    hints: process.env.NODE_ENV === 'production' ? "warning" : false, //性能->文件大小提示  开发环境下关闭该提示
    maxEntrypointSize: 400000, // 整数类型（以字节为单位）
    assetFilter: function (assetFilename) {
      // 提供资源文件名的断言函数
      return assetFilename.endsWith('.less') || assetFilename.endsWith('.tsx');
    }
  },
  plugins: [
    new VueLoaderPlugin(),
    new CaseSensitivePathsPlugin(),
    new CopyWebpackPlugin([
      {
        from: paths.appStatic,
        to: "static",
        ignore: [".*"],
      }
    ]),
    new HtmlWebpackPlugin({
      title,
      template: htmlTemplate,
      hash: true
    }),
    // new webpack.ProvidePlugin({}),
    new ProgressBarPlugin({
      format: chalk.yellow('build for ' + process.env.NODE_ENV) + '[:bar]' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
      width: 300,
      complete: ">",
      incomplete: "-",
    }),
    new DllReferencePlugin({
      // 描述 react 动态链接库的文件内容
      manifest: path.resolve(paths.appStatic, `${systemPath.appdllLibrary}_${process.env.NODE_ENV.substring(0, 3)}.manifest.json`)
    }),
    new HtmlIncludeAssetsPlugin({
      assets: [{ path: "static", glob: `${systemPath.appdllLibrary}_${process.env.NODE_ENV.substring(0, 3)}.dll.js`, globPath: "static/" }],
      append: false, // false 在其他资源的之前添加 true 在其他资源之后添加
      hash: true
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? 'static/css/[name].css' : 'static/css/[name].[hash].css',
      chunkFilename: devMode ? 'static/css/[id].css' : 'static/css/[id].[name].[chunkhash].css',
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/),
    new HappyPack({
      //用id来标识 happypack处理那里类文件
      id: 'happyBabel',
      //如何处理  用法和loader 的配置一样
      loaders: [
        {
          loader: 'babel-loader?cacheDirectory=true',
        },
        "grammar-loader",
        {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter'),
            fix: true,
            failOnError: true
          }
        }],
      //共享进程池
      threadPool: happyThreadPool,
      //允许 HappyPack 输出日志
      verbose: false,
    }),
    new HappyPack({
      //用id来标识 happypack处理那里类文件
      id: 'happyStyle',
      //如何处理  用法和loader 的配置一样
      loaders: [
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
          }
        }, {
          loader: "less-loader",
          options: {
            sourceMap: devMode,
            // modifyVars: themeVariables,
            javascriptEnabled: true
          }
        }
      ],
      //共享进程池
      threadPool: happyThreadPool,
      //允许 HappyPack 输出日志
      verbose: false,
    }),
    new HappyPack({
      //用id来标识 happypack处理那里类文件
      id: 'happyLint',
      //如何处理  用法和loader 的配置一样
      loaders: [
        {
          loader: 'eslint-loader',
          options: {
            emitWarning: true,
            emitError: true,
            formatter: require('eslint-friendly-formatter')
          }
        }
      ],
      //共享进程池
      threadPool: happyThreadPool,
      //允许 HappyPack 输出日志
      verbose: false,
    }),
    new WebpackBuildLogPlugin({
      path: path.join(process.cwd(),'log'),
      filename: 'compile-log.md',
      // Note: Compile logs will only be output in the production environment.
      //And you need to set process.env.NODE_ENV in different environments.
      deleteFile: process.env.NODE_ENV=="production"
    })
  ]
}

const effect = {
  onCompiltionCache() {
    // devMode && webpackBaseConfig.plugins.push(
    //   new HardSourceWebpackPlugin({
    //     cacheDirectory: 'node_modules/.cache/hard-source/[confighash]',
    //     cachePrune: {
    //       maxAge: 2 * 24 * 60 * 60 * 1000,
    //       sizeThreshold: 50 * 1024 * 1024
    //     },
    //     environmentHash: {
    //       root: process.cwd(),
    //       files: ['.eslintrc.js', ".babelrc", 'postcss.config.js']
    //     }
    //   })
    // )
  },
  onLint() {
    // webpackBaseConfig.module.rules.push({
    //   test: /\.(ts|tsx)$/,
    //   use: ['happypack/loader?id=happyLint'],
    //   include: [paths.appSrc, ...paths.appTsLoader], // 精确指定要处理的目录
    //   exclude: [paths.appNodeModules]
    // })
  }
}

Object.keys(systemConfig).forEach((item, index) => {
  if (typeof systemConfig[item] == "boolean" && systemConfig[item]) {
    effect[item] && effect[item]();
  }
})

module.exports = webpackBaseConfig;








