System.register(["aurelia-templating", "aurelia-binding", "./syntax-interpreter"], function (_export) {
  "use strict";

  var BindingLanguage, Parser, ObserverLocator, BindingExpression, ONE_WAY, SyntaxInterpreter, _inherits, TemplatingBindingLanguage;
  return {
    setters: [function (_aureliaTemplating) {
      BindingLanguage = _aureliaTemplating.BindingLanguage;
    }, function (_aureliaBinding) {
      Parser = _aureliaBinding.Parser;
      ObserverLocator = _aureliaBinding.ObserverLocator;
      BindingExpression = _aureliaBinding.BindingExpression;
      ONE_WAY = _aureliaBinding.ONE_WAY;
    }, function (_syntaxInterpreter) {
      SyntaxInterpreter = _syntaxInterpreter.SyntaxInterpreter;
    }],
    execute: function () {
      _inherits = function (child, parent) {
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

      TemplatingBindingLanguage = (function () {
        var _BindingLanguage = BindingLanguage;
        var TemplatingBindingLanguage = function TemplatingBindingLanguage(parser, observerLocator, syntaxInterpreter) {
          this.parser = parser;
          this.observerLocator = observerLocator;
          this.syntaxInterpreter = syntaxInterpreter;
          this.interpolationRegex = /\${(.*?)}/g;
          syntaxInterpreter.language = this;
        };

        _inherits(TemplatingBindingLanguage, _BindingLanguage);

        TemplatingBindingLanguage.inject = function () {
          return [Parser, ObserverLocator, SyntaxInterpreter];
        };

        TemplatingBindingLanguage.prototype.parseAttribute = function (resources, element, attrName, attrValue, existingInstruction) {
          var parts = attrName.split("."), instruction;

          if (parts.length == 2) {
            instruction = this.syntaxInterpreter.interpret(parts[1].trim(), resources, element, parts[0].trim(), attrValue, existingInstruction);

            if (!existingInstruction) {
              instruction.originalAttrName = attrName;
            }
          } else {
            var expression = this.parseContent(resources, attrName, attrValue);
            if (expression) {
              instruction = existingInstruction || { attrName: attrName, attributes: {} };
              instruction.attributes[attrName] = expression;
            }
          }

          return instruction;
        };

        TemplatingBindingLanguage.prototype.parseText = function (resources, value) {
          return this.parseContent(resources, "textContent", value);
        };

        TemplatingBindingLanguage.prototype.parseContent = function (resources, attrName, attrValue) {
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
        };

        return TemplatingBindingLanguage;
      })();
      _export("TemplatingBindingLanguage", TemplatingBindingLanguage);
    }
  };
});