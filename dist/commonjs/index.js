"use strict";

(function (obj) {
  for (var i in obj) {
    exports[i] = obj[i];
  }
})(require("./binding-language"));

(function (obj) {
  for (var i in obj) {
    exports[i] = obj[i];
  }
})(require("./syntax-interpreter"));