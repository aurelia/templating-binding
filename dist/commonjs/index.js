'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _aureliaTemplatingBinding = require('./aurelia-templating-binding');

Object.keys(_aureliaTemplatingBinding).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _aureliaTemplatingBinding[key];
    }
  });
});