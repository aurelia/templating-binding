/*eslint dot-notation:0*/
import {
  Parser,
  ObserverLocator,
  EventManager,
  ListenerExpression,
  BindingExpression,
  CallExpression,
  bindingMode,
  delegationStrategy
} from 'aurelia-binding';

import {BehaviorInstruction} from 'aurelia-templating';
import * as LogManager from 'aurelia-logging';
import {AttributeMap} from './attribute-map';

export class SyntaxInterpreter {
  static inject = [Parser, ObserverLocator, EventManager, AttributeMap];

  constructor(parser, observerLocator, eventManager, attributeMap) {
    this.parser = parser;
    this.observerLocator = observerLocator;
    this.eventManager = eventManager;
    this.attributeMap = attributeMap;
  }

  interpret(resources, element, info, existingInstruction, context) {
    if (info.command in this) {
      return this[info.command](resources, element, info, existingInstruction, context);
    }

    return this.handleUnknownCommand(resources, element, info, existingInstruction, context);
  }

  handleUnknownCommand(resources, element, info, existingInstruction, context) {
    LogManager.getLogger('templating-binding').warn('Unknown binding command.', info);
    return existingInstruction;
  }

  determineDefaultBindingMode(element, attrName, context) {
    let tagName = element.tagName.toLowerCase();

    if (tagName === 'input' && (attrName === 'value' || attrName === 'files') && element.type !== 'checkbox' && element.type !== 'radio'
      || tagName === 'input' && attrName === 'checked' && (element.type === 'checkbox' || element.type === 'radio')
      || (tagName === 'textarea' || tagName === 'select') && attrName === 'value'
      || (attrName === 'textcontent' || attrName === 'innerhtml') && element.contentEditable === 'true'
      || attrName === 'scrolltop'
      || attrName === 'scrollleft') {
      return bindingMode.twoWay;
    }

    if (context
      && attrName in context.attributes
      && context.attributes[attrName]
      && context.attributes[attrName].defaultBindingMode >= bindingMode.oneTime) {
      return context.attributes[attrName].defaultBindingMode;
    }

    return bindingMode.oneWay;
  }

  bind(resources, element, info, existingInstruction, context) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new BindingExpression(
      this.observerLocator,
      this.attributeMap.map(element.tagName, info.attrName),
      this.parser.parse(info.attrValue),
      info.defaultBindingMode === undefined || info.defaultBindingMode === null
        ? this.determineDefaultBindingMode(element, info.attrName, context)
        : info.defaultBindingMode,
      resources.lookupFunctions
    );

    return instruction;
  }

  trigger(resources, element, info) {
    return new ListenerExpression(
      this.eventManager,
      info.attrName,
      this.parser.parse(info.attrValue),
      delegationStrategy.none,
      true,
      resources.lookupFunctions
    );
  }

  capture(resources, element, info) {
    return new ListenerExpression(
      this.eventManager,
      info.attrName,
      this.parser.parse(info.attrValue),
      delegationStrategy.capturing,
      true,
      resources.lookupFunctions
    );
  }

  delegate(resources, element, info) {
    return new ListenerExpression(
      this.eventManager,
      info.attrName,
      this.parser.parse(info.attrValue),
      delegationStrategy.bubbling,
      true,
      resources.lookupFunctions
    );
  }

  call(resources, element, info, existingInstruction) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new CallExpression(
      this.observerLocator,
      info.attrName,
      this.parser.parse(info.attrValue),
      resources.lookupFunctions
    );

    return instruction;
  }

  options(resources, element, info, existingInstruction, context) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);
    let attrValue = info.attrValue;
    let language = this.language;
    let name = null;
    let target = '';
    let current;
    let i;
    let ii;
    let inString = false;
    let inEscape = false;
    let foundName = false;

    for (i = 0, ii = attrValue.length; i < ii; ++i) {
      current = attrValue[i];

      if (current === ';' && !inString) {
        if (!foundName) {
          name = this._getPrimaryPropertyName(resources, context);
        }
        info = language.inspectAttribute(resources, '?', name, target.trim());
        language.createAttributeInstruction(resources, element, info, instruction, context);

        if (!instruction.attributes[info.attrName]) {
          instruction.attributes[info.attrName] = info.attrValue;
        }

        target = '';
        name = null;
      } else if (current === ':' && name === null) {
        foundName = true;
        name = target.trim();
        target = '';
      } else if (current === '\\') {
        target += current;
        inEscape = true;
        continue;
      } else {
        target += current;

        if (name !== null && inEscape === false && current === '\'') {
          inString = !inString;
        }
      }

      inEscape = false;
    }

    // check for the case where we have a single value with no name
    // and there is a default property that we can use to obtain
    // the name of the property with which the value should be associated.
    if (!foundName) {
      name = this._getPrimaryPropertyName(resources, context);
    }

    if (name !== null) {
      info = language.inspectAttribute(resources, '?', name, target.trim());
      language.createAttributeInstruction(resources, element, info, instruction, context);

      if (!instruction.attributes[info.attrName]) {
        instruction.attributes[info.attrName] = info.attrValue;
      }
    }

    return instruction;
  }

  _getPrimaryPropertyName(resources, context) {
    let type = resources.getAttribute(context.attributeName);
    if (type && type.primaryProperty) {
      return type.primaryProperty.attribute;
    }
    return null;
  }

  'for'(resources, element, info, existingInstruction) {
    let parts;
    let keyValue;
    let instruction;
    let attrValue;
    let isDestructuring;

    attrValue = info.attrValue;
    isDestructuring = attrValue.match(/^ *[[].+[\]]/);
    parts = isDestructuring ? attrValue.split('of ') : attrValue.split(' of ');

    if (parts.length !== 2) {
      throw new Error('Incorrect syntax for "for". The form is: "$local of $items" or "[$key, $value] of $items".');
    }

    instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    if (isDestructuring) {
      keyValue = parts[0].replace(/[[\]]/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
      instruction.attributes.key = keyValue[0];
      instruction.attributes.value = keyValue[1];
    } else {
      instruction.attributes.local = parts[0];
    }

    instruction.attributes.items = new BindingExpression(
      this.observerLocator,
      'items',
      this.parser.parse(parts[1]),
      bindingMode.oneWay,
      resources.lookupFunctions
    );

    return instruction;
  }

  'two-way'(resources, element, info, existingInstruction) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new BindingExpression(
        this.observerLocator,
        this.attributeMap.map(element.tagName, info.attrName),
        this.parser.parse(info.attrValue),
        bindingMode.twoWay,
        resources.lookupFunctions
      );

    return instruction;
  }

  'to-view'(resources, element, info, existingInstruction) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new BindingExpression(
      this.observerLocator,
      this.attributeMap.map(element.tagName, info.attrName),
      this.parser.parse(info.attrValue),
      bindingMode.toView,
      resources.lookupFunctions
    );

    return instruction;
  }

  'from-view'(resources, element, info, existingInstruction) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new BindingExpression(
      this.observerLocator,
      this.attributeMap.map(element.tagName, info.attrName),
      this.parser.parse(info.attrValue),
      bindingMode.fromView,
      resources.lookupFunctions
    );

    return instruction;
  }

  'one-time'(resources, element, info, existingInstruction) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new BindingExpression(
      this.observerLocator,
      this.attributeMap.map(element.tagName, info.attrName),
      this.parser.parse(info.attrValue),
      bindingMode.oneTime,
      resources.lookupFunctions
    );

    return instruction;
  }
}

SyntaxInterpreter.prototype['one-way'] = SyntaxInterpreter.prototype['to-view'];
