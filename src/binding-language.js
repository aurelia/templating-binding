import {BindingLanguage, BehaviorInstruction} from 'aurelia-templating';
import {Parser, ObserverLocator, NameExpression, bindingMode} from 'aurelia-binding';
import {SyntaxInterpreter} from './syntax-interpreter';
import * as LogManager from 'aurelia-logging';

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

  getObserver(obj, propertyName) {
    return this.observerLocator.getObserver(obj, propertyName);
  }

  bind(source) {
    this.source = source;

    if (this.mode === bindingMode.oneWay) {
      this.unbind();
      this.connect();
    } else {
      this.setValue();
    }
  }

  setValue() {
    let value = this.interpolate();
    this.targetProperty.setValue(value);
  }

  partChanged(newValue, oldValue, connecting) {
    let map;
    let data;

    if (!connecting) {
      this.setValue();
    }

    if (oldValue instanceof Array) {
      map = this.arrayPartMap;
      data = map ? map.get(oldValue) : null;
      if (data) {
        data.refs--;
        if (data.refs === 0) {
          data.observer.unsubscribe(this.boundSetValue);
          map.delete(oldValue);
        }
      }
    }

    if (newValue instanceof Array) {
      map = this.arrayPartMap || (this.arrayPartMap = new Map());
      data = map.get(newValue);
      if (!data) {
        data = {
          refs: 0,
          observer: this.observerLocator.getArrayObserver(newValue)
        };
        map.set(newValue, data);
        this.boundSetValue = this.boundSetValue || (this.boundSetValue = this.setValue.bind(this));
        data.observer.subscribe(this.boundSetValue);
      }
      data.refs++;
    }
  }

  connect() {
    let value = '';
    let parts = this.parts;
    let source = this.source;
    let observers = this.observers = [];
    let partChanged = this.boundPartChanged || (this.boundPartChanged = this.partChanged.bind(this));
    let valueConverterLookupFunction = this.valueConverterLookupFunction;

    for (let i = 0, ii = parts.length; i < ii; ++i) {
      if (i % 2 === 0) {
        value += parts[i];
      } else {
        let result = parts[i].connect(this, source);
        let temp = result.value;
        value += (typeof temp !== 'undefined' && temp !== null ? temp.toString() : '');
        if (result.observer) {
          observers.push(result.observer);
          result.observer.subscribe(partChanged);
        }
        if (result.value instanceof Array) {
          partChanged(result.value, undefined, true);
        }
      }
    }
    this.targetProperty.setValue(value);
  }

  interpolate() {
    let value = '';
    let parts = this.parts;
    let source = this.source;
    let valueConverterLookupFunction = this.valueConverterLookupFunction;

    for (let i = 0, ii = parts.length; i < ii; ++i) {
      if (i % 2 === 0) {
        value += parts[i];
      } else {
        let temp = parts[i].evaluate(source, valueConverterLookupFunction);
        value += (typeof temp !== 'undefined' && temp !== null ? temp.toString() : '');
      }
    }

    return value;
  }

  unbind() {
    let observers = this.observers;
    let map = this.arrayPartMap;

    if (observers) {
      for (let i = 0, ii = observers.length; i < ii; ++i) {
        observers[i].unsubscribe(this.boundPartChanged);
      }
    }

    this.observers = null;

    if (map) {
      for (let data of map.values()) {
        data.observer.unsubscribe(this.boundSetValue);
      }

      map.clear();
    }

    this.arrayPartMap = null;
  }
}
