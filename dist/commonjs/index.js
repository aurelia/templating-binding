'use strict';

exports.__esModule = true;

var _BindingLanguage = require('aurelia-templating');

var _TemplatingBindingLanguage = require('./binding-language');

var _SyntaxInterpreter = require('./syntax-interpreter');

function configure(aurelia) {
  var instance,
      getInstance = function getInstance(c) {
    return instance || (instance = c.invoke(_TemplatingBindingLanguage.TemplatingBindingLanguage));
  };

  if (aurelia.container.hasHandler(_TemplatingBindingLanguage.TemplatingBindingLanguage)) {
    instance = aurelia.container.get(_TemplatingBindingLanguage.TemplatingBindingLanguage);
  } else {
    aurelia.container.registerHandler(_TemplatingBindingLanguage.TemplatingBindingLanguage, getInstance);
  }

  aurelia.container.registerHandler(_BindingLanguage.BindingLanguage, getInstance);
}

exports.TemplatingBindingLanguage = _TemplatingBindingLanguage.TemplatingBindingLanguage;
exports.SyntaxInterpreter = _SyntaxInterpreter.SyntaxInterpreter;
exports.configure = configure;