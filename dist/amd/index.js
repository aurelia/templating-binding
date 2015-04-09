define(['exports', 'aurelia-templating', './binding-language', './syntax-interpreter'], function (exports, _aureliaTemplating, _bindingLanguage, _syntaxInterpreter) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function install(aurelia) {
    var instance,
        getInstance = function getInstance(c) {
      return instance || (instance = c.invoke(_bindingLanguage.TemplatingBindingLanguage));
    };

    if (aurelia.container.hasHandler(_bindingLanguage.TemplatingBindingLanguage)) {
      instance = aurelia.container.get(_bindingLanguage.TemplatingBindingLanguage);
    } else {
      aurelia.container.registerHandler(_bindingLanguage.TemplatingBindingLanguage, getInstance);
    }

    aurelia.container.registerHandler(_aureliaTemplating.BindingLanguage, getInstance);
  }

  exports.TemplatingBindingLanguage = _bindingLanguage.TemplatingBindingLanguage;
  exports.SyntaxInterpreter = _syntaxInterpreter.SyntaxInterpreter;
  exports.install = install;
});