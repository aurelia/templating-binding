'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME = require('aurelia-binding');

var SyntaxInterpreter = (function () {
  function SyntaxInterpreter(parser, observerLocator, eventManager) {
    _classCallCheck(this, SyntaxInterpreter);

    this.parser = parser;
    this.observerLocator = observerLocator;
    this.eventManager = eventManager;
  }

  _createClass(SyntaxInterpreter, [{
    key: 'interpret',
    value: function interpret(resources, element, info, existingInstruction) {
      if (info.command in this) {
        return this[info.command](resources, element, info, existingInstruction);
      }

      return this.handleUnknownCommand(resources, element, info, existingInstruction);
    }
  }, {
    key: 'handleUnknownCommand',
    value: function handleUnknownCommand(resources, element, info, existingInstruction) {
      var attrName = info.attrName,
          command = info.command;

      var instruction = this.options(resources, element, info, existingInstruction);

      instruction.alteredAttr = true;
      instruction.attrName = 'global-behavior';
      instruction.attributes.aureliaAttrName = attrName;
      instruction.attributes.aureliaCommand = command;

      return instruction;
    }
  }, {
    key: 'determineDefaultBindingMode',
    value: function determineDefaultBindingMode(element, attrName) {
      var tagName = element.tagName.toLowerCase();

      if (tagName === 'input') {
        return attrName === 'value' || attrName === 'checked' ? _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.TWO_WAY : _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.ONE_WAY;
      } else if (tagName == 'textarea' || tagName == 'select') {
        return attrName == 'value' ? _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.TWO_WAY : _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.ONE_WAY;
      } else if (attrName === 'textcontent' || attrName === 'innerhtml') {
        return element.contentEditable === 'true' ? _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.TWO_WAY : _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.ONE_WAY;
      }

      return _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.ONE_WAY;
    }
  }, {
    key: 'bind',
    value: function bind(resources, element, info, existingInstruction) {
      var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

      instruction.attributes[info.attrName] = new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.BindingExpression(this.observerLocator, this.attributeMap[info.attrName] || info.attrName, this.parser.parse(info.attrValue), info.defaultBindingMode || this.determineDefaultBindingMode(element, info.attrName), resources.valueConverterLookupFunction);

      return instruction;
    }
  }, {
    key: 'trigger',
    value: function trigger(resources, element, info) {
      return new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.ListenerExpression(this.eventManager, info.attrName, this.parser.parse(info.attrValue), false, true);
    }
  }, {
    key: 'delegate',
    value: function delegate(resources, element, info) {
      return new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.ListenerExpression(this.eventManager, info.attrName, this.parser.parse(info.attrValue), true, true);
    }
  }, {
    key: 'call',
    value: function call(resources, element, info, existingInstruction) {
      var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

      instruction.attributes[info.attrName] = new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.CallExpression(this.observerLocator, info.attrName, this.parser.parse(info.attrValue), resources.valueConverterLookupFunction);

      return instruction;
    }
  }, {
    key: 'options',
    value: function options(resources, element, info, existingInstruction) {
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
    }
  }], [{
    key: 'inject',
    value: function inject() {
      return [_Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.Parser, _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.ObserverLocator, _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.EventManager];
    }
  }]);

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

  instruction.attributes.items = new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.BindingExpression(this.observerLocator, 'items', this.parser.parse(parts[parts.length - 1]), _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.ONE_WAY, resources.valueConverterLookupFunction);

  return instruction;
};

SyntaxInterpreter.prototype['two-way'] = function (resources, element, info, existingInstruction) {
  var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

  instruction.attributes[info.attrName] = new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.BindingExpression(this.observerLocator, info.attrName, this.parser.parse(info.attrValue), _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.TWO_WAY, resources.valueConverterLookupFunction);

  return instruction;
};

SyntaxInterpreter.prototype['one-way'] = function (resources, element, info, existingInstruction) {
  var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

  instruction.attributes[info.attrName] = new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.BindingExpression(this.observerLocator, this.attributeMap[info.attrName] || info.attrName, this.parser.parse(info.attrValue), _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.ONE_WAY, resources.valueConverterLookupFunction);

  return instruction;
};

SyntaxInterpreter.prototype['one-time'] = function (resources, element, info, existingInstruction) {
  var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

  instruction.attributes[info.attrName] = new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.BindingExpression(this.observerLocator, this.attributeMap[info.attrName] || info.attrName, this.parser.parse(info.attrValue), _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.ONE_TIME, resources.valueConverterLookupFunction);

  return instruction;
};

SyntaxInterpreter.prototype['view-model'] = function (resources, element, info) {
  return new _Parser$ObserverLocator$EventManager$ListenerExpression$BindingExpression$NameExpression$CallExpression$ONE_WAY$TWO_WAY$ONE_TIME.NameExpression(info.attrValue, 'view-model');
};