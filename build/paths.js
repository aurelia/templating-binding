var path = require('path');
var fs = require('fs');

// hide warning //
var emitter = require('events');
emitter.defaultMaxListeners = 20;

var appRoot = 'src/';
var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

var paths = {
  root: appRoot,
  source: appRoot + '**/*.js',
  html: appRoot + '**/*.html',
  style: 'styles/**/*.css',
  output: 'dist/',
  doc:'./doc',
  unitTests: 'test/**/*.js',
  e2eSpecsSrc: 'test/e2e/src/*.js',
  e2eSpecsDist: 'test/e2e/dist/',
  packageName: pkg.name,
  ignore: [],
  useTypeScriptForDTS: false,
  importsToAdd: [],
  sort: false
};

paths.files = [
  'attribute-map.js',
  'interpolation-binding-expression.js',
  'let-expression.js',
  'let-interpolation-expression.js',
  'syntax-interpreter.js',
  'binding-language.js',
  'index.js'
].map(function(file){
  return paths.root + file;
});

module.exports = paths;
