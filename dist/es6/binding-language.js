import {BindingLanguage} from 'aurelia-templating';
import {Parser, ObserverLocator, BindingExpression, NameExpression, ONE_WAY} from 'aurelia-binding';
import {SyntaxInterpreter} from './syntax-interpreter';

var info = {};

export class TemplatingBindingLanguage extends BindingLanguage {
  static inject() { return [Parser, ObserverLocator,SyntaxInterpreter]; }
	constructor(parser, observerLocator, syntaxInterpreter){
    this.parser = parser;
    this.observerLocator = observerLocator;
    this.syntaxInterpreter = syntaxInterpreter;
    this.interpolationRegex = /\${(.*?)}/g;
    syntaxInterpreter.language = this;
    this.attributeMap = syntaxInterpreter.attributeMap = {
      'class':'className',
      'for':'htmlFor'
    };
  }

  inspectAttribute(resources, attrName, attrValue){
    var parts = attrName.split('.');

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
    var expressionText, expression;

    var parts = attrValue.split(this.interpolationRegex);
    if (parts.length <= 1) { //no expression found
      return null;
    }

    parts.forEach(function(part, index) {
      if (index % 2 === 0) {
        //plain text parts
        parts[index] = "'" + part + "'";
      } else {
        //expression parts
        parts[index] = "(" + part + ")";
      }
    });

    expressionText = parts.join('+');

    expression = new BindingExpression(
      this.observerLocator,
      this.attributeMap[attrName] || attrName,
      this.parser.parse(expressionText), 
      ONE_WAY,
      resources.valueConverterLookupFunction
    );

    expression.attribute = attrName;

    return expression;
  }
}