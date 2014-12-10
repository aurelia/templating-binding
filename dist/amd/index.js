define(["exports", "./binding-language", "./syntax-interpreter"], function (exports, _bindingLanguage, _syntaxInterpreter) {
  "use strict";

  (function (obj) {
    for (var i in obj) {
      exports[i] = obj[i];
    }
  })(_bindingLanguage);

  (function (obj) {
    for (var i in obj) {
      exports[i] = obj[i];
    }
  })(_syntaxInterpreter);
});