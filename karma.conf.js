/**
 * @param {import('karma').Config} config
 */
module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    frameworks: ['jasmine', 'karma-typescript'],
    files: [
      'src/**/*.ts',
      'test/**/*.ts'
    ],
    plugins: [
      'karma-jasmine',
      'karma-typescript',
      'karma-coverage',
      'karma-chrome-launcher'
    ],
    exclude: [],
    preprocessors: {
      '**/*.ts': ['karma-typescript']
    },
    karmaTypescriptConfig: (() => {
      /**@type {import('karma-typescript').KarmaTypescriptConfig} */
      const options = {
        bundlerOptions: {
          entrypoints: /\.spec\.ts$/
        },
        compilerOptions: {
          emitDecoratorMetadata: true,
          experimentalDecorators: true,
          module: 'commonjs',
          sourceMap: true,
          target: 'ES2015',
          lib: ['es2015', 'dom']
        },
        exclude: ['dist', 'node_modules']
      };
      return options;
    })(),
    client: {
      jasmine: {
        random: false
      }
    },

    reporters: ['progress', 'karma-typescript'],
    port: 9876,
    colors: true,
    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_ERROR,
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    customLaunchers: {
      ChromeDebugging: {
        base: 'Chrome',
        flags: [
          '--remote-debugging-port=9333'
        ],
        debug: true
      }
    },
    singleRun: false
  });
};
