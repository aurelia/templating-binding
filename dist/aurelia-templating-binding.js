import * as LogManager from 'aurelia-logging';
import {Parser,ObserverLocator,EventManager,ListenerExpression,BindingExpression,CallExpression,bindingMode,NameExpression,connectable} from 'aurelia-binding';
import {BehaviorInstruction,BindingLanguage} from 'aurelia-templating';

/*eslint dot-notation:0*/
export class SyntaxInterpreter {
  static inject() { return [Parser, ObserverLocator, EventManager]; }
  constructor(parser, observerLocator, eventManager) {
    this.parser = parser;
    this.observerLocator = observerLocator;
    this.eventManager = eventManager;
  }

  interpret(resources, element, info, existingInstruction) {
    if (info.command in this) {
      return this[info.command](resources, element, info, existingInstruction);
    }

    return this.handleUnknownCommand(resources, element, info, existingInstruction);
  }

  handleUnknownCommand(resources, element, info, existingInstruction) {
    let attrName = info.attrName;
    let command = info.command;
    let instruction = this.options(resources, element, info, existingInstruction);

    instruction.alteredAttr = true;
    instruction.attrName = 'global-behavior';
    instruction.attributes.aureliaAttrName = attrName;
    instruction.attributes.aureliaCommand = command;

    return instruction;
  }

  determineDefaultBindingMode(element, attrName) {
    let tagName = element.tagName.toLowerCase();

    if (tagName === 'input') {
      return attrName === 'value' || attrName === 'checked' || attrName === 'files' ? bindingMode.twoWay : bindingMode.oneWay;
    } else if (tagName === 'textarea' || tagName === 'select') {
      return attrName === 'value' ? bindingMode.twoWay : bindingMode.oneWay;
    } else if (attrName === 'textcontent' || attrName === 'innerhtml') {
      return element.contentEditable === 'true' ? bindingMode.twoWay : bindingMode.oneWay;
    } else if (attrName === 'scrolltop' || attrName === 'scrollleft') {
      return bindingMode.twoWay;
    }

    return bindingMode.oneWay;
  }

  bind(resources, element, info, existingInstruction) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new BindingExpression(
      this.observerLocator,
      this.attributeMap[info.attrName] || info.attrName,
      this.parser.parse(info.attrValue),
      info.defaultBindingMode || this.determineDefaultBindingMode(element, info.attrName),
      resources.valueConverterLookupFunction
    );

    return instruction;
  }

  trigger(resources, element, info) {
    return new ListenerExpression(
      this.eventManager,
      info.attrName,
      this.parser.parse(info.attrValue),
      false,
      true
    );
  }

  delegate(resources, element, info) {
    return new ListenerExpression(
      this.eventManager,
      info.attrName,
      this.parser.parse(info.attrValue),
      true,
      true
    );
  }

  call(resources, element, info, existingInstruction) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new CallExpression(
      this.observerLocator,
      info.attrName,
      this.parser.parse(info.attrValue),
      resources.valueConverterLookupFunction
    );

    return instruction;
  }

  options(resources, element, info, existingInstruction) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);
    let attrValue = info.attrValue;
    let language = this.language;
    let name = null;
    let target = '';
    let current;
    let i;
    let ii;

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
      resources.valueConverterLookupFunction
    );

    return instruction;
  }

  'two-way'(resources, element, info, existingInstruction) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new BindingExpression(
        this.observerLocator,
        this.attributeMap[info.attrName] || info.attrName,
        this.parser.parse(info.attrValue),
        bindingMode.twoWay,
        resources.valueConverterLookupFunction
      );

    return instruction;
  }

  'one-way'(resources, element, info, existingInstruction) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new BindingExpression(
      this.observerLocator,
      this.attributeMap[info.attrName] || info.attrName,
      this.parser.parse(info.attrValue),
      bindingMode.oneWay,
      resources.valueConverterLookupFunction
    );

    return instruction;
  }

  'one-time'(resources, element, info, existingInstruction) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new BindingExpression(
      this.observerLocator,
      this.attributeMap[info.attrName] || info.attrName,
      this.parser.parse(info.attrValue),
      bindingMode.oneTime,
      resources.valueConverterLookupFunction
    );

    return instruction;
  }
}

let info = {};
let logger = LogManager.getLogger('templating-binding');

export class TemplatingBindingLanguage extends BindingLanguage {
  static inject() { return [Parser, ObserverLocator, SyntaxInterpreter]; }
  constructor(parser, observerLocator, syntaxInterpreter) {
    super();
    this.parser = parser;
    this.observerLocator = observerLocator;
    this.syntaxInterpreter = syntaxInterpreter;
    this.emptyStringExpression = this.parser.parse('\'\'');
    syntaxInterpreter.language = this;
    this.attributeMap = syntaxInterpreter.attributeMap = {
      'contenteditable': 'contentEditable',
      'for': 'htmlFor',
      'tabindex': 'tabIndex',
      'textcontent': 'textContent',
      'innerhtml': 'innerHTML',
      // HTMLInputElement https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement
      'maxlength': 'maxLength',
      'minlength': 'minLength',
      'formaction': 'formAction',
      'formenctype': 'formEncType',
      'formmethod': 'formMethod',
      'formnovalidate': 'formNoValidate',
      'formtarget': 'formTarget',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'scrolltop': 'scrollTop',
      'scrollleft': 'scrollLeft',
      'readonly': 'readOnly'
    };
  }

  inspectAttribute(resources, attrName, attrValue) {
    let parts = attrName.split('.');

    info.defaultBindingMode = null;

    if (parts.length === 2) {
      info.attrName = parts[0].trim();
      info.attrValue = attrValue;
      info.command = parts[1].trim();

      if (info.command === 'ref') {
        info.expression = new NameExpression(attrValue, info.attrName);
        info.command = null;
        info.attrName = 'ref';
      } else {
        info.expression = null;
      }
    } else if (attrName === 'ref') {
      info.attrName = attrName;
      info.attrValue = attrValue;
      info.command = null;
      info.expression = new NameExpression(attrValue, 'element');
    } else {
      info.attrName = attrName;
      info.attrValue = attrValue;
      info.command = null;
      info.expression = this.parseContent(resources, attrName, attrValue);
    }

    return info;
  }

	createAttributeInstruction(resources, element, theInfo, existingInstruction) {
  let instruction;

  if (theInfo.expression) {
    if (theInfo.attrName === 'ref') {
      return theInfo.expression;
    }

    instruction = existingInstruction || BehaviorInstruction.attribute(theInfo.attrName);
    instruction.attributes[theInfo.attrName] = theInfo.expression;
  } else if (theInfo.command) {
    instruction = this.syntaxInterpreter.interpret(
    resources,
    element,
    theInfo,
    existingInstruction
    );
  }

  return instruction;
}

  parseText(resources, value) {
    return this.parseContent(resources, 'textContent', value);
  }

  parseContent(resources, attrName, attrValue) {
    let i = attrValue.indexOf('${', 0);
    let ii = attrValue.length;
    let char;
    let pos = 0;
    let open = 0;
    let quote = null;
    let interpolationStart;
    let parts;
    let partIndex = 0;

    while (i >= 0 && i < ii - 2) {
      open = 1;
      interpolationStart = i;
      i += 2;

      do {
        char = attrValue[i];
        i++;

        if (char === "'" || char === '"') {
          if (quote === null) {
            quote = char;
          } else if (quote === char) {
            quote = null;
          }
          continue;
        }

        if (char === '\\') {
          i++;
          continue;
        }

        if (quote !== null) {
          continue;
        }

        if (char === '{') {
          open++;
        } else if (char === '}') {
          open--;
        }
      } while (open > 0 && i < ii)

      if (open === 0) {
        // lazy allocate array
        parts = parts || [];
        if (attrValue[interpolationStart - 1] === '\\' && attrValue[interpolationStart - 2] !== '\\') {
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
        i = attrValue.indexOf('${', i);
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

    return new InterpolationBindingExpression(
      this.observerLocator,
      this.attributeMap[attrName] || attrName,
      parts,
      bindingMode.oneWay,
      resources.valueConverterLookupFunction,
      attrName
    );
  }
}

export class InterpolationBindingExpression {
  constructor(observerLocator, targetProperty, parts,
    mode, valueConverterLookupFunction, attribute) {
    this.observerLocator = observerLocator;
    this.targetProperty = targetProperty;
    this.parts = parts;
    this.mode = mode;
    this.valueConverterLookupFunction = valueConverterLookupFunction;
    this.attribute = this.attrToRemove = attribute;
    this.discrete = false;
  }

  createBinding(target) {
    return new InterpolationBinding(
      this.observerLocator,
      this.parts,
      target,
      this.targetProperty,
      this.mode,
      this.valueConverterLookupFunction
      );
  }
}

@connectable()
class InterpolationBinding {
  constructor(observerLocator, parts, target, targetProperty, mode, valueConverterLookupFunction) {
    if (targetProperty === 'style') {
      logger.info('Internet Explorer does not support interpolation in "style" attributes.  Use the style attribute\'s alias, "css" instead.');
    } else if (target.parentElement && target.parentElement.nodeName === 'TEXTAREA' && targetProperty === 'textContent') {
      throw new Error('Interpolation binding cannot be used in the content of a textarea element.  Use <textarea value.bind="expression"></textarea> instead.');
    }

    this.observerLocator = observerLocator;
    this.parts = parts;
    this.targetProperty = observerLocator.getObserver(target, targetProperty);
    this.mode = mode;
    this.valueConverterLookupFunction = valueConverterLookupFunction;
  }

  bind(source) {
    if (this.source !== undefined) {
      this.unbind();
    }
    this.source = source;
    this.interpolate(this.mode === bindingMode.oneWay, true);
  }

  call() {
    this._version++;
    this.interpolate(this.mode === bindingMode.oneWay, false);
  }

  interpolate(connect, initial) {
    let value = '';
    let parts = this.parts;
    let source = this.source;
    let valueConverterLookupFunction = this.valueConverterLookupFunction;

    for (let i = 0, ii = parts.length; i < ii; ++i) {
      if (i % 2 === 0) {
        value += parts[i];
      } else {
        let part = parts[i].evaluate(source, valueConverterLookupFunction);
        value += part === undefined || part === null ? '' : part.toString();
        if (connect) {
          parts[i].connect(this, source);
          if (part instanceof Array) {
            this.observeArray(part);
          }
        }
      }
    }
    this.targetProperty.setValue(value);
    if (!initial) {
      this.unobserve(false);
    }
  }

  unbind() {
    this.source = undefined;
    this.unobserve(true);
  }
}

export function configure(config) {
  let instance;
  let getInstance = function(c) {
    return instance || (instance = c.invoke(TemplatingBindingLanguage));
  };

  if (config.container.hasHandler(TemplatingBindingLanguage)) {
    instance = config.container.get(TemplatingBindingLanguage);
  } else {
    config.container.registerHandler(TemplatingBindingLanguage, getInstance);
  }

  config.container.registerHandler(BindingLanguage, getInstance);
}
