'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

exports.__esModule = true;

var _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode = require('aurelia-binding');

var SyntaxInterpreter = (function () {
  function SyntaxInterpreter(parser, observerLocator, eventManager) {
    _classCallCheck(this, SyntaxInterpreter);

    this.parser = parser;
    this.observerLocator = observerLocator;
    this.eventManager = eventManager;
  }

  SyntaxInterpreter.inject = function inject() {
    return [_Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.Parser, _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.ObserverLocator, _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.EventManager];
  };

  SyntaxInterpreter.prototype.interpret = function interpret(resources, element, info, existingInstruction) {
    if (info.command in this) {
      return this[info.command](resources, element, info, existingInstruction);
    }

    return this.handleUnknownCommand(resources, element, info, existingInstruction);
  };

  SyntaxInterpreter.prototype.handleUnknownCommand = function handleUnknownCommand(resources, element, info, existingInstruction) {
    var attrName = info.attrName,
        command = info.command;

    var instruction = this.options(resources, element, info, existingInstruction);

    instruction.alteredAttr = true;
    instruction.attrName = 'global-behavior';
    instruction.attributes.aureliaAttrName = attrName;
    instruction.attributes.aureliaCommand = command;

    return instruction;
  };

  SyntaxInterpreter.prototype.determineDefaultBindingMode = function determineDefaultBindingMode(element, attrName) {
    var tagName = element.tagName.toLowerCase();

    if (tagName === 'input') {
      return attrName === 'value' || attrName === 'checked' ? _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.bindingMode.twoWay : _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.bindingMode.oneWay;
    } else if (tagName == 'textarea' || tagName == 'select') {
      return attrName == 'value' ? _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.bindingMode.twoWay : _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.bindingMode.oneWay;
    } else if (attrName === 'textcontent' || attrName === 'innerhtml') {
      return element.contentEditable === 'true' ? _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.bindingMode.twoWay : _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.bindingMode.oneWay;
    }

    return _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.bindingMode.oneWay;
  };

  SyntaxInterpreter.prototype.bind = function bind(resources, element, info, existingInstruction) {
    var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

    instruction.attributes[info.attrName] = new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.BindingExpression(this.observerLocator, this.attributeMap[info.attrName] || info.attrName, this.parser.parse(info.attrValue), info.defaultBindingMode || this.determineDefaultBindingMode(element, info.attrName), resources.valueConverterLookupFunction);

    return instruction;
  };

  SyntaxInterpreter.prototype.trigger = function trigger(resources, element, info) {
    return new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.ListenerExpression(this.eventManager, info.attrName, this.parser.parse(info.attrValue), false, true);
  };

  SyntaxInterpreter.prototype.delegate = function delegate(resources, element, info) {
    return new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.ListenerExpression(this.eventManager, info.attrName, this.parser.parse(info.attrValue), true, true);
  };

  SyntaxInterpreter.prototype.call = function call(resources, element, info, existingInstruction) {
    var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

    instruction.attributes[info.attrName] = new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.CallExpression(this.observerLocator, info.attrName, this.parser.parse(info.attrValue), resources.valueConverterLookupFunction);

    return instruction;
  };

  SyntaxInterpreter.prototype.options = function options(resources, element, info, existingInstruction) {
    var instruction = existingInstruction || { attrName: info.attrName, attributes: {} },
        attrValue = info.attrValue,
        language = this.language,
        name = null,
        target = '',
        current,
        i,
        ii;

    for (i = 0, ii = attrValue.length; i < ii; ++i) {
      current = attrValue[i];

      if (current === ';') {
        info = language.inspectAttribute(resources, name, target.trim());
        language.createAttributeInstruction(resources, element, info, instruction);

        if (!instruction.attributes[info.attrName]) {
          instruction.attributes[info.attrName] = info.attrValue;
        }

        target = '';
        name = null;
      } else if (current === ':' && name === null) {
        name = target.trim();
        target = '';
      } else {
        target += current;
      }
    }

    if (name !== null) {
      info = language.inspectAttribute(resources, name, target.trim());
      language.createAttributeInstruction(resources, element, info, instruction);

      if (!instruction.attributes[info.attrName]) {
        instruction.attributes[info.attrName] = info.attrValue;
      }
    }

    return instruction;
  };

  return SyntaxInterpreter;
})();

exports.SyntaxInterpreter = SyntaxInterpreter;

SyntaxInterpreter.prototype['for'] = function (resources, element, info, existingInstruction) {
  var parts = info.attrValue.split(' of ');

  if (parts.length !== 2) {
    throw new Error('Incorrect syntax for "for". The form is: "$local of $items".');
  }

  var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

  if (parts[0].match(/[[].+[,]\s.+[\]]/)) {
    var firstPart = parts[0];
    parts[0] = firstPart.substr(1, firstPart.indexOf(',') - 1);
    parts.splice(1, 0, firstPart.substring(firstPart.indexOf(', ') + 2, firstPart.length - 1));
    instruction.attributes.key = parts[0];
    instruction.attributes.value = parts[1];
  } else {
    instruction.attributes.local = parts[0];
  }

  instruction.attributes.items = new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.BindingExpression(this.observerLocator, 'items', this.parser.parse(parts[parts.length - 1]), _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.bindingMode.oneWay, resources.valueConverterLookupFunction);

  return instruction;
};

SyntaxInterpreter.prototype['two-way'] = function (resources, element, info, existingInstruction) {
  var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

  instruction.attributes[info.attrName] = new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.BindingExpression(this.observerLocator, this.attributeMap[info.attrName] || info.attrName, this.parser.parse(info.attrValue), _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.bindingMode.twoWay, resources.valueConverterLookupFunction);

  return instruction;
};

SyntaxInterpreter.prototype['one-way'] = function (resources, element, info, existingInstruction) {
  var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

  instruction.attributes[info.attrName] = new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.BindingExpression(this.observerLocator, this.attributeMap[info.attrName] || info.attrName, this.parser.parse(info.attrValue), _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.bindingMode.oneWay, resources.valueConverterLookupFunction);

  return instruction;
};

SyntaxInterpreter.prototype['one-time'] = function (resources, element, info, existingInstruction) {
  var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

  instruction.attributes[info.attrName] = new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.BindingExpression(this.observerLocator, this.attributeMap[info.attrName] || info.attrName, this.parser.parse(info.attrValue), _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.bindingMode.oneTime, resources.valueConverterLookupFunction);

  return instruction;
};

SyntaxInterpreter.prototype['view-model'] = function (resources, element, info) {
  return new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$bindingMode.NameExpression(info.attrValue, 'view-model');
};