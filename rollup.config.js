import typescript from 'rollup-plugin-typescript2';

export default [
  {
    input: 'src/aurelia-templating-binding.ts',
    output: [
      {
        file: 'dist/es2015/aurelia-templating-binding.js',
        format: 'esm'
      }
    ],
    plugins: [
      typescript({
        cacheRoot: '.rollupcache',
        tsconfigOverride: {
          compilerOptions: {
            removeComments: true,
          }
        }
      })
    ]
  },
  {
    input: 'src/aurelia-templating-binding.ts',
    output: {
      file: 'dist/es2017/aurelia-templating-binding.js',
      format: 'esm'
    },
    plugins: [
      typescript({
        cacheRoot: '.rollupcache',
        tsconfigOverride: {
          compilerOptions: {
            target: 'es2017',
            removeComments: true,
          }
        }
      })
    ]
  },
  {
    input: 'src/aurelia-templating-binding.ts',
    output: [
      { file: 'dist/amd/aurelia-templating-binding.js', format: 'amd', id: 'aurelia-templating-binding' },
      { file: 'dist/commonjs/aurelia-templating-binding.js', format: 'cjs' },
      { file: 'dist/system/aurelia-templating-binding.js', format: 'system' },
      { file: 'dist/native-modules/aurelia-templating-binding.js', format: 'esm' },
    ],
    plugins: [
      typescript({
        cacheRoot: '.rollupcache',
        tsconfigOverride: {
          compilerOptions: {
            target: 'es5',
            removeComments: true,
          }
        }
      })
    ]
  }
].map(config => {
  config.external = [
    'aurelia-binding',
    'aurelia-dependency-injection',
    'aurelia-pal',
    'aurelia-logging',
    'aurelia-templating'
  ];
  return config;
});