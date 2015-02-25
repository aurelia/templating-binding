import {BindingLanguage} from 'aurelia-templating';
import {Parser, ObserverLocator, BindingExpression, NameExpression, ONE_WAY} from 'aurelia-binding';
import {SyntaxInterpreter} from './syntax-interpreter';
import {parse} from './interpolation-parser';

var info = {};

export class TemplatingBindingLanguage extends BindingLanguage {
  static inject() { return [Parser, ObserverLocator,SyntaxInterpreter]; }
	constructor(parser, observerLocator, syntaxInterpreter){
    this.parser = parser;
    this.observerLocator = observerLocator;
    this.syntaxInterpreter = syntaxInterpreter;
    syntaxInterpreter.language = this;
    this.attributeMap = syntaxInterpreter.attributeMap = {
      'class':'className',
      'for':'htmlFor',
      'tabindex':'tabIndex',
      // HTMLInputElement https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement
      'maxlength':'maxLength',
      'minlength':'minLength',
      'formaction':'formAction',
      'formenctype':'formEncType',
      'formmethod':'formMethod',
      'formnovalidate':'formNoValidate',
      'formtarget':'formTarget',
    };
  }

  inspectAttribute(resources, attrName, attrValue){
    var parts = attrName.split('.');

    info.defaultBindingMode = null;

    if(parts.length == 2){
      info.attrName = parts[0].trim();
      info.attrValue = attrValue;
      info.command = parts[1].trim();
      info.expression = null;
    }else if(attrName == 'ref'){
      info.attrName = attrName;
      info.attrValue = attrValue;
      info.command = null;
      info.expression = new NameExpression(attrValue, 'element');
    }else{
      info.attrName = attrName;
      info.attrValue = attrValue;
      info.command = null;
      info.expression = this.parseContent(resources, attrName, attrValue);
    }

    return info;
  }

	createAttributeInstruction(resources, element, info, existingInstruction){
    var instruction;

    if(info.expression){
      if(info.attrName === 'ref'){
        return info.expression;
      }

      instruction = existingInstruction || {attrName:info.attrName, attributes:{}};
      instruction.attributes[info.attrName] = info.expression;
    } else if(info.command){
      instruction = this.syntaxInterpreter.interpret(
        resources,
        element,
        info,
        existingInstruction
      );
    }

		return instruction;
	}

	parseText(resources, value){
    return this.parseContent(resources, 'textContent', value);
  }

  parseContent(resources, attrName, attrValue){
    var parts = [], exprs = false;
    parse(attrValue, (type, start, end, extra) => {
      var value = attrValue.substring(start, end) + (extra || '');
      var expr = type === 'expr' ? this.parser.parse(value) : null;
      if (type === 'expr')
        exprs = true;

      parts.push({type, value, expr});
    });

    if (!exprs) { //no expression found
      return null;
    }

    return new InterpolationBindingExpression(
      this.observerLocator,
      this.attributeMap[attrName] || attrName,
      parts,
      ONE_WAY,
      resources.valueConverterLookupFunction,
      attrName
    );
  }
}

export class InterpolationBindingExpression {
  constructor(observerLocator, targetProperty, parts,
    mode, valueConverterLookupFunction, attribute){
    this.observerLocator = observerLocator;
    this.targetProperty = targetProperty;
    this.parts = parts;
    this.mode = mode;
    this.valueConverterLookupFunction = valueConverterLookupFunction;
    this.attribute = attribute;
    this.discrete = false;
  }

  createBinding(target){
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
  constructor(observerLocator, parts, target, targetProperty, mode, valueConverterLookupFunction){
    if (target.parentElement && target.parentElement.nodeName === 'TEXTAREA' && targetProperty === 'textContent') {
      throw new Error('Interpolation binding cannot be used in the content of a textarea element.  Use "<textarea value.bind="expression"></textarea>"" instead');
    }

    this.observerLocator = observerLocator;
    this.parts = parts;
    this.targetProperty = observerLocator.getObserver(target, targetProperty);
    this.mode = mode;
    this.valueConverterLookupFunction = valueConverterLookupFunction;
    this.toDispose = [];
  }

  getObserver(obj, propertyName){
    return this.observerLocator.getObserver(obj, propertyName);
  }

  bind(source){
    this.source = source;

    if(this.mode == ONE_WAY){
      this.unbind();
      this.connect();
      this.setValue();
    }else{
      this.setValue();
    }
  }

  setValue(){
    var value = this.interpolate();
    this.targetProperty.setValue(value);
  }

  connect(){
    var info,
        parts = this.parts,
        source = this.source,
        toDispose = this.toDispose = [],
        i, ii;

    for (i = 0, ii = parts.length; i < ii; ++i) {
      if (parts[i].expr) {
        info = parts[i].expr.connect(this, source);
        if (info.observer) {
          toDispose.push(info.observer.subscribe(() => {
            this.setValue();
          }));
        }
      }
    }
  }

  interpolate(){
    var value = '',
        parts = this.parts,
        source = this.source,
        valueConverterLookupFunction = this.valueConverterLookupFunction,
        i, ii, temp, index = 0, expr;

    for (i = 0, ii = parts.length; i < ii; ++i) {
      if (parts[i].type === 'text') {
        value += parts[i].value;
      } else {
        expr = parts[i].expr;
        temp = expr.evaluate(source, valueConverterLookupFunction);
        value += (typeof temp !== 'undefined' && temp !== null ? temp.toString() : '');
      }
    }

    return value;
  }

  unbind(){
    var i, ii, toDispose = this.toDispose;

    if(toDispose){
      for(i = 0, ii = toDispose.length; i < ii; ++i){
        toDispose[i]();
      }
    }

    this.toDispose = null;
  }
}
