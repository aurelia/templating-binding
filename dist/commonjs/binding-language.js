"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _inherits = function (child, parent) {
  if (typeof parent !== "function" && parent !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof parent);
  }
  child.prototype = Object.create(parent && parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (parent) child.__proto__ = parent;
};

var BindingLanguage = require("aurelia-templating").BindingLanguage;
var Parser = require("aurelia-binding").Parser;
var ObserverLocator = require("aurelia-binding").ObserverLocator;
var BindingExpression = require("aurelia-binding").BindingExpression;
var NameExpression = require("aurelia-binding").NameExpression;
var ONE_WAY = require("aurelia-binding").ONE_WAY;
var SyntaxInterpreter = require("./syntax-interpreter").SyntaxInterpreter;


var info = {};

var TemplatingBindingLanguage = (function (BindingLanguage) {
  var TemplatingBindingLanguage = function TemplatingBindingLanguage(parser, observerLocator, syntaxInterpreter) {
    this.parser = parser;
    this.observerLocator = observerLocator;
    this.syntaxInterpreter = syntaxInterpreter;
    this.interpolationRegex = /\${(.*?)}/g;
    syntaxInterpreter.language = this;
  };

  _inherits(TemplatingBindingLanguage, BindingLanguage);

  _prototypeProperties(TemplatingBindingLanguage, {
    inject: {
      value: function () {
        return [Parser, ObserverLocator, SyntaxInterpreter];
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  }, {
    inspectAttribute: {
      value: function (resources, attrName, attrValue) {
        var parts = attrName.split(".");

        if (parts.length == 2) {
          info.attrName = parts[0].trim();
          info.attrValue = attrValue;
          info.command = parts[1].trim();
          info.expression = null;
        } else if (attrName == "ref") {
          info.attrName = attrName;
          info.attrValue = attrValue;
          info.command = null;
          info.expression = new NameExpression(attrValue, "element");
        } else {
          info.attrName = attrName;
          info.attrValue = attrValue;
          info.command = null;
          info.expression = this.parseContent(resources, attrName, attrValue);
        }

        return info;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    createAttributeInstruction: {
      value: function (resources, element, info, existingInstruction) {
        var instruction;

        if (info.expression) {
          if (info.attrName === "ref") {
            return info.expression;
          }

          instruction = existingInstruction || { attrName: info.attrName, attributes: {} };
          instruction.attributes[info.attrName] = info.expression;
        } else if (info.command) {
          instruction = this.syntaxInterpreter.interpret(resources, element, info, existingInstruction);
        }

        return instruction;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parseText: {
      value: function (resources, value) {
        return this.parseContent(resources, "textContent", value);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parseContent: {
      value: function (resources, attrName, attrValue) {
        var expressionText, expression;

        var parts = attrValue.split(this.interpolationRegex);
        if (parts.length <= 1) {
          return null;
        }

        parts.forEach(function (part, index) {
          if (index % 2 === 0) {
            parts[index] = "'" + part + "'";
          } else {
            parts[index] = "(" + part + ")";
          }
        });

        expressionText = parts.join("+");

        expression = new BindingExpression(this.observerLocator, attrName === "class" ? "className" : attrName, this.parser.parse(expressionText), ONE_WAY, resources.valueConverterLookupFunction);

        expression.attribute = attrName;

        return expression;
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return TemplatingBindingLanguage;
})(BindingLanguage);

exports.TemplatingBindingLanguage = TemplatingBindingLanguage;