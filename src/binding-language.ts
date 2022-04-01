/*eslint indent:0*/
import {BindingLanguage, BehaviorInstruction} from 'aurelia-templating';
import {Parser, ObserverLocator, NameExpression, bindingMode, camelCase, LiteralString} from 'aurelia-binding';
import {InterpolationBindingExpression} from './interpolation-binding-expression';
import {SyntaxInterpreter} from './syntax-interpreter';
import {AttributeMap} from './attribute-map';
import {LetExpression} from './let-expression';
import {LetInterpolationBindingExpression} from './let-interpolation-expression';
import * as LogManager from 'aurelia-logging';

let info = {};

export class TemplatingBindingLanguage extends BindingLanguage {
  static inject = [Parser, ObserverLocator, SyntaxInterpreter, AttributeMap];

  constructor(parser, observerLocator, syntaxInterpreter, attributeMap) {
    super();
    this.parser = parser;
    this.observerLocator = observerLocator;
    this.syntaxInterpreter = syntaxInterpreter;
    this.emptyStringExpression = this.parser.parse('\'\'');
    syntaxInterpreter.language = this;
    this.attributeMap = attributeMap;
    this.toBindingContextAttr = 'to-binding-context';
  }

  inspectAttribute(resources, elementName, attrName, attrValue) {
    let parts = attrName.split('.');

    info.defaultBindingMode = null;

    if (parts.length === 2) {
      info.attrName = parts[0].trim();
      info.attrValue = attrValue;
      info.command = parts[1].trim();

      if (info.command === 'ref') {
        info.expression = new NameExpression(this.parser.parse(attrValue), info.attrName, resources.lookupFunctions);
        info.command = null;
        info.attrName = 'ref';
      } else {
        info.expression = null;
      }
    } else if (attrName === 'ref') {
      info.attrName = attrName;
      info.attrValue = attrValue;
      info.command = null;
      info.expression = new NameExpression(this.parser.parse(attrValue), 'element', resources.lookupFunctions);
    } else {
      info.attrName = attrName;
      info.attrValue = attrValue;
      info.command = null;
      const interpolationParts = this.parseInterpolation(resources, attrValue);
      if (interpolationParts === null) {
        info.expression = null;
      } else {
        info.expression = new InterpolationBindingExpression(
          this.observerLocator,
          this.attributeMap.map(elementName, attrName),
          interpolationParts,
          bindingMode.oneWay,
          resources.lookupFunctions,
          attrName
        );
      }
    }

    return info;
  }

	createAttributeInstruction(resources, element, theInfo, existingInstruction, context) {
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
        existingInstruction,
        context);
    }

    return instruction;
  }

  /**
   * @param {ViewResources} resources
   * @param {Element} letElement
   */
  createLetExpressions(resources, letElement) {
    let expressions = [];
    let attributes = letElement.attributes;
    /**@type {Attr} */
    let attr;
    /**@type {string[]} */
    let parts;
    let attrName;
    let attrValue;
    let command;
    let toBindingContextAttr = this.toBindingContextAttr;
    let toBindingContext = letElement.hasAttribute(toBindingContextAttr);
    for (let i = 0, ii = attributes.length; ii > i; ++i) {
      attr = attributes[i];
      attrName = attr.name;
      attrValue = attr.nodeValue;
      parts = attrName.split('.');

      if (attrName === toBindingContextAttr) {
        continue;
      }

      if (parts.length === 2) {
        command = parts[1];
        if (command !== 'bind') {
          LogManager.getLogger('templating-binding-language')
            .warn(`Detected invalid let command. Expected "${parts[0]}.bind", given "${attrName}"`);
          continue;
        }
        expressions.push(new LetExpression(
          this.observerLocator,
          camelCase(parts[0]),
          this.parser.parse(attrValue),
          resources.lookupFunctions,
          toBindingContext
        ));
      } else {
        attrName = camelCase(attrName);
        parts = this.parseInterpolation(resources, attrValue);
        if (parts === null) {
          LogManager.getLogger('templating-binding-language')
            .warn(`Detected string literal in let bindings. Did you mean "${ attrName }.bind=${ attrValue }" or "${ attrName }=\${${ attrValue }}" ?`);
        }
        if (parts) {
          expressions.push(new LetInterpolationBindingExpression(
            this.observerLocator,
            attrName,
            parts,
            resources.lookupFunctions,
            toBindingContext
          ));
        } else {
          expressions.push(new LetExpression(
            this.observerLocator,
            attrName,
            new LiteralString(attrValue),
            resources.lookupFunctions,
            toBindingContext
          ));
        }
      }
    }
    return expressions;
  }

  inspectTextContent(resources, value) {
    const parts = this.parseInterpolation(resources, value);
    if (parts === null) {
      return null;
    }
    return new InterpolationBindingExpression(
      this.observerLocator,
      'textContent',
      parts,
      bindingMode.oneWay,
      resources.lookupFunctions,
      'textContent');
  }

  parseInterpolation(resources, value) {
    let i = value.indexOf('${', 0);
    let ii = value.length;
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
        char = value[i];
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
      } while (open > 0 && i < ii);

      if (open === 0) {
        // lazy allocate array
        parts = parts || [];
        if (value[interpolationStart - 1] === '\\' && value[interpolationStart - 2] !== '\\') {
          // escaped interpolation
          parts[partIndex] = value.substring(pos, interpolationStart - 1) + value.substring(interpolationStart, i);
          partIndex++;
          parts[partIndex] = this.emptyStringExpression;
          partIndex++;
        } else {
          // standard interpolation
          parts[partIndex] = value.substring(pos, interpolationStart);
          partIndex++;
          parts[partIndex] = this.parser.parse(value.substring(interpolationStart + 2, i - 1));
          partIndex++;
        }
        pos = i;
        i = value.indexOf('${', i);
      } else {
        break;
      }
    }

    // no interpolation.
    if (partIndex === 0) {
      return null;
    }

    // literal.
    parts[partIndex] = value.substr(pos);
    return parts;
  }
}
