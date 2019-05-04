const path = require('path');
const { AureliaPlugin } = require('aurelia-webpack-plugin');

module.exports = function(config) {
  const browsers = config.browsers;
  config.set({

    basePath: '',
    frameworks: ["jasmine"],
    client: {
      jasmine: {
        random: false
      }
    },
    files: ["test/**/*.spec.ts"],
    preprocessors: {
      "test/**/*.spec.ts": ["webpack", 'sourcemap']
    },
    webpack: {
      mode: "development",
      entry: 'test/setup.ts',
      resolve: {
        extensions: [".ts", ".js"],
        modules: ["node_modules"],
        alias: {
          src: path.resolve(__dirname, 'src'),
          test: path.resolve(__dirname, 'test'),
          'aurelia-binding': path.resolve(__dirname, 'node_modules/aurelia-binding'),
          'aurelia-templating-binding': path.resolve(__dirname, 'src/aurelia-templating-binding.ts')
        }
      },
      devtool: browsers.includes('ChromeDebugging') ? 'eval-source-map' : 'inline-source-map',
      module: {
        rules: [
          {
            test: /\.ts$/,
            loader: "ts-loader",
            exclude: /node_modules/
          },
          {
            test: /\.html$/i,
            loader: 'html-loader'
          }
        ]
      },
      plugins: [
        new AureliaPlugin({
          aureliaApp: undefined,
          // dist: 'es2015',
          features: { 
            ie: false,
            // true for attribute map tests
            svg: true,
            unparser: false
          }
        })
      ]
    },
    mime: {
      "text/x-typescript": ["ts"]
    },
    reporters: ["mocha"],
    webpackServer: { noInfo: config.noInfo },
    browsers: Array.isArray(browsers) && browsers.length > 0 ? browsers : ['ChromeHeadless'],
    customLaunchers: {
      ChromeDebugging: {
        base: 'Chrome',
        flags: [
          '--remote-debugging-port=9333'
        ],
        debug: true
      }
    },
    mochaReporter: {
      ignoreSkipped: true
    },
    singleRun: false,
    webpackMiddleware: {
      logLevel: 'silent'
    },
  });
};
