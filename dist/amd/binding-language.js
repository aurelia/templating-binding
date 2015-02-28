define(["exports", "aurelia-templating", "aurelia-binding", "./syntax-interpreter"], function (exports, _aureliaTemplating, _aureliaBinding, _syntaxInterpreter) {
  "use strict";

  var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var BindingLanguage = _aureliaTemplating.BindingLanguage;
  var Parser = _aureliaBinding.Parser;
  var ObserverLocator = _aureliaBinding.ObserverLocator;
  var BindingExpression = _aureliaBinding.BindingExpression;
  var NameExpression = _aureliaBinding.NameExpression;
  var ONE_WAY = _aureliaBinding.ONE_WAY;
  var SyntaxInterpreter = _syntaxInterpreter.SyntaxInterpreter;

  var info = {};

  var TemplatingBindingLanguage = exports.TemplatingBindingLanguage = (function (BindingLanguage) {
    function TemplatingBindingLanguage(parser, observerLocator, syntaxInterpreter) {
      _classCallCheck(this, TemplatingBindingLanguage);

      this.parser = parser;
      this.observerLocator = observerLocator;
      this.syntaxInterpreter = syntaxInterpreter;
      this.emptyStringExpression = this.parser.parse("''");
      syntaxInterpreter.language = this;
      this.attributeMap = syntaxInterpreter.attributeMap = {
        "class": "className",
        "for": "htmlFor",
        tabindex: "tabIndex",
        // HTMLInputElement https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement
        maxlength: "maxLength",
        minlength: "minLength",
        formaction: "formAction",
        formenctype: "formEncType",
        formmethod: "formMethod",
        formnovalidate: "formNoValidate",
        formtarget: "formTarget" };
    }

    _inherits(TemplatingBindingLanguage, BindingLanguage);

    _prototypeProperties(TemplatingBindingLanguage, {
      inject: {
        value: function inject() {
          return [Parser, ObserverLocator, SyntaxInterpreter];
        },
        writable: true,
        configurable: true
      }
    }, {
      inspectAttribute: {
        value: function inspectAttribute(resources, attrName, attrValue) {
          var parts = attrName.split(".");

          info.defaultBindingMode = null;

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
        configurable: true
      },
      createAttributeInstruction: {
        value: function createAttributeInstruction(resources, element, info, existingInstruction) {
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
        configurable: true
      },
      parseText: {
        value: function parseText(resources, value) {
          return this.parseContent(resources, "textContent", value);
        },
        writable: true,
        configurable: true
      },
      parseContent: {
        value: function parseContent(resources, attrName, attrValue) {
          var i = attrValue.indexOf("${", 0),
              ii = attrValue.length,
              char,
              pos = 0,
              open = 0,
              quote = null,
              interpolationStart,
              parts,
              partIndex = 0;
          while (i >= 0 && i < ii - 2) {
            open = 1;
            interpolationStart = i;
            i += 2;

            do {
              char = attrValue[i];
              i++;
              switch (char) {
                case "'":
                case "\"":
                  if (quote === null) {
                    quote = char;
                  } else if (quote === char) {
                    quote = null;
                  }
                  continue;
                case "\\":
                  i++;
                  continue;
              }

              if (quote !== null) {
                continue;
              }

              if (char === "{") {
                open++;
              } else if (char === "}") {
                open--;
              }
            } while (open > 0 && i < ii);

            if (open === 0) {
              // lazy allocate array
              parts = parts || [];
              if (attrValue[interpolationStart - 1] === "\\" && attrValue[interpolationStart - 2] !== "\\") {
                // escaped interpolation
                parts[partIndex] = attrValue.substring(pos, interpolationStart - 1) + attrValue.substring(interpolationStart, i);
                partIndex++;
                parts[partIndex] = this.emptyStringExpression;
                partIndex++;
              } else {
                // standard interpolation
                parts[partIndex] = attrValue.substring(pos, interpolationStart);
                partIndex++;
                parts[partIndex] = this.parser.parse(attrValue.substring(interpolationStart + 2, i - 1));
                partIndex++;
              }
              pos = i;
              i = attrValue.indexOf("${", i);
            } else {
              break;
            }
          }

          // no interpolation.
          if (partIndex === 0) {
            return null;
          }

          // literal.
          parts[partIndex] = attrValue.substr(pos);

          return new InterpolationBindingExpression(this.observerLocator, this.attributeMap[attrName] || attrName, parts, ONE_WAY, resources.valueConverterLookupFunction, attrName);
        },
        writable: true,
        configurable: true
      }
    });

    return TemplatingBindingLanguage;
  })(BindingLanguage);

  var InterpolationBindingExpression = exports.InterpolationBindingExpression = (function () {
    function InterpolationBindingExpression(observerLocator, targetProperty, parts, mode, valueConverterLookupFunction, attribute) {
      _classCallCheck(this, InterpolationBindingExpression);

      this.observerLocator = observerLocator;
      this.targetProperty = targetProperty;
      this.parts = parts;
      this.mode = mode;
      this.valueConverterLookupFunction = valueConverterLookupFunction;
      this.attribute = attribute;
      this.discrete = false;
    }

    _prototypeProperties(InterpolationBindingExpression, null, {
      createBinding: {
        value: function createBinding(target) {
          return new InterpolationBinding(this.observerLocator, this.parts, target, this.targetProperty, this.mode, this.valueConverterLookupFunction);
        },
        writable: true,
        configurable: true
      }
    });

    return InterpolationBindingExpression;
  })();

  var InterpolationBinding = (function () {
    function InterpolationBinding(observerLocator, parts, target, targetProperty, mode, valueConverterLookupFunction) {
      _classCallCheck(this, InterpolationBinding);

      if (target.parentElement && target.parentElement.nodeName === "TEXTAREA" && targetProperty === "textContent") {
        throw new Error("Interpolation binding cannot be used in the content of a textarea element.  Use \"<textarea value.bind=\"expression\"></textarea>\"\" instead");
      }
      this.observerLocator = observerLocator;
      this.parts = parts;
      this.targetProperty = observerLocator.getObserver(target, targetProperty);
      this.mode = mode;
      this.valueConverterLookupFunction = valueConverterLookupFunction;
      this.toDispose = [];
    }

    _prototypeProperties(InterpolationBinding, null, {
      getObserver: {
        value: function getObserver(obj, propertyName) {
          return this.observerLocator.getObserver(obj, propertyName);
        },
        writable: true,
        configurable: true
      },
      bind: {
        value: function bind(source) {
          this.source = source;

          if (this.mode == ONE_WAY) {
            this.unbind();
            this.connect();
            this.setValue();
          } else {
            this.setValue();
          }
        },
        writable: true,
        configurable: true
      },
      setValue: {
        value: function setValue() {
          var value = this.interpolate();
          this.targetProperty.setValue(value);
        },
        writable: true,
        configurable: true
      },
      connect: {
        value: function connect() {
          var _this = this;

          var info,
              parts = this.parts,
              source = this.source,
              toDispose = this.toDispose = [],
              i,
              ii;

          for (i = 0, ii = parts.length; i < ii; ++i) {
            if (i % 2 === 0) {} else {
              info = parts[i].connect(this, source);
              if (info.observer) {
                toDispose.push(info.observer.subscribe(function (newValue) {
                  _this.setValue();
                }));
              }
            }
          }
        },
        writable: true,
        configurable: true
      },
      interpolate: {
        value: function interpolate() {
          var value = "",
              parts = this.parts,
              source = this.source,
              valueConverterLookupFunction = this.valueConverterLookupFunction,
              i,
              ii,
              temp;

          for (i = 0, ii = parts.length; i < ii; ++i) {
            if (i % 2 === 0) {
              value += parts[i];
            } else {
              temp = parts[i].evaluate(source, valueConverterLookupFunction);
              value += typeof temp !== "undefined" && temp !== null ? temp.toString() : "";
            }
          }

          return value;
        },
        writable: true,
        configurable: true
      },
      unbind: {
        value: function unbind() {
          var i,
              ii,
              toDispose = this.toDispose;

          if (toDispose) {
            for (i = 0, ii = toDispose.length; i < ii; ++i) {
              toDispose[i]();
            }
          }

          this.toDispose = null;
        },
        writable: true,
        configurable: true
      }
    });

    return InterpolationBinding;
  })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
});

//do nothing