/*eslint indent:0*/
import {BindingLanguage, BehaviorInstruction, ViewResources, HtmlBehaviorResource, LetExpression} from 'aurelia-templating';
import {Parser, ObserverLocator, NameExpression, bindingMode, camelCase, LiteralString, Expression} from 'aurelia-binding';
import * as AureliaBinding from 'aurelia-binding';
import {InterpolationBindingExpression} from './interpolation-binding-expression';
import {SyntaxInterpreter} from './syntax-interpreter';
import {AttributeMap} from './attribute-map';
import {LetExpression as LetExpressionImpl} from './let-expression';
import {LetInterpolationBindingExpression} from './let-interpolation-expression';
import * as LogManager from 'aurelia-logging';
import { IAttributeInfo } from './interfaces';

/**
 * a reusable object for all attributes inspection
 */
let info = {} as IAttributeInfo;

/**
 * An implementation of binding language that supports human-readable syntax
 */
export class TemplatingBindingLanguage extends BindingLanguage {
  /**@internal*/
  static inject = [Parser, ObserverLocator, SyntaxInterpreter, AttributeMap];
  /**@internal*/
  parser: Parser;
  /**@internal*/
  observerLocator: ObserverLocator;
  /**@internal*/
  syntaxInterpreter: SyntaxInterpreter;
  /**@internal*/
  emptyStringExpression: Expression;
  /**@internal*/
  attributeMap: AttributeMap;
  /**@internal*/
  toBindingContextAttr: string;

  constructor(parser: Parser, observerLocator: ObserverLocator, syntaxInterpreter: SyntaxInterpreter, attributeMap: AttributeMap) {
    super();
    this.parser = parser;
    this.observerLocator = observerLocator;
    this.syntaxInterpreter = syntaxInterpreter;
    this.emptyStringExpression = parser.parse('\'\'');
    syntaxInterpreter.language = this;
    this.attributeMap = attributeMap;
    this.toBindingContextAttr = 'to-binding-context';
  }

  inspectAttribute(resources: ViewResources, elementName: string, attrName: string, attrValue: string) {
    let NameExpression = (AureliaBinding as any).NameExpression;
    let parts = attrName.split('.');
    let parser = this.parser;

    info.defaultBindingMode = null;

    if (parts.length === 2) {
      info.attrName = parts[0].trim();
      info.attrValue = attrValue;
      info.command = parts[1].trim();

      if (info.command === 'ref') {
        info.expression = new NameExpression(parser.parse(attrValue), info.attrName, resources.lookupFunctions);
        info.command = null;
        info.attrName = 'ref';
      } else {
        info.expression = null;
      }
    } else if (attrName === 'ref') {
      info.attrName = attrName;
      info.attrValue = attrValue;
      info.command = null;
      info.expression = new NameExpression(parser.parse(attrValue), 'element', resources.lookupFunctions);
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
          bindingMode.toView,
          resources.lookupFunctions,
          attrName
        );
      }
    }

    return info;
  }

  createAttributeInstruction(
    resources: ViewResources,
    element: Element,
    theInfo: IAttributeInfo,
    existingInstruction: BehaviorInstruction,
    context?: HtmlBehaviorResource): /** Expression | BehaviorInstruction */ any {
    // having strong typing with out changing public API
    let $theInfo = theInfo as IAttributeInfo;
    let instruction: BehaviorInstruction;

    if ($theInfo.expression) {
      if ($theInfo.attrName === 'ref') {
        return $theInfo.expression;
      }

      instruction = existingInstruction || BehaviorInstruction.attribute($theInfo.attrName);
      instruction.attributes[$theInfo.attrName] = $theInfo.expression;
    } else if ($theInfo.command) {
      instruction = this.syntaxInterpreter.interpret(
        resources,
        element,
        $theInfo,
        existingInstruction,
        context);
    }

    return instruction;
  }

  createLetExpressions(resources: ViewResources, letElement: Element): LetExpression[] {
    let expressions: (LetExpression | LetInterpolationBindingExpression)[] = [];
    let attributes = letElement.attributes;
    let attr: Attr;
    let parts: Array<string | Expression>;
    let attrName: string;
    let attrValue: string;
    let command: string;
    let observerLocator = this.observerLocator;
    let lookupFunctions = resources.lookupFunctions;
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
        command = parts[1] as string;
        if (command !== 'bind') {
          LogManager.getLogger('templating-binding-language')
            .warn(`Detected invalid let command. Expected "${parts[0]}.bind", given "${attrName}"`);
          continue;
        }
        expressions.push(new LetExpressionImpl(
          this.observerLocator,
          camelCase(parts[0] as string),
          this.parser.parse(attrValue),
          lookupFunctions,
          toBindingContext
        ));
      } else {
        attrName = camelCase(attrName);
        parts = this.parseInterpolation(resources, attrValue);
        if (parts === null) {
          LogManager.getLogger('templating-binding-language')
            // tslint:disable-next-line:max-line-length
            .warn(`Detected string literal in let bindings. Did you mean "${ attrName }.bind=${ attrValue }" or "${ attrName }=\${${ attrValue }}" ?`);
        }
        if (parts) {
          expressions.push(new LetInterpolationBindingExpression(
            observerLocator,
            attrName,
            parts,
            lookupFunctions,
            toBindingContext
          ));
        } else {
          expressions.push(new LetExpressionImpl(
            observerLocator,
            attrName,
            new LiteralString(attrValue),
            lookupFunctions,
            toBindingContext
          ));
        }
      }
    }
    return expressions as LetExpression[];
  }

  inspectTextContent(resources: ViewResources, value: string) {
    const parts = this.parseInterpolation(resources, value);
    if (parts === null) {
      return null;
    }
    return new InterpolationBindingExpression(
      this.observerLocator,
      'textContent',
      parts,
      bindingMode.toView,
      resources.lookupFunctions,
      'textContent');
  }

  parseInterpolation(resources: ViewResources, value: string): Array<string | Expression> {
    let i: number = value.indexOf('${', 0);
    let ii: number = value.length;
    let char: string;
    let pos = 0;
    let open = 0;
    let quote = null;
    let interpolationStart: number;
    let parts: any[];
    let partIndex = 0;

    while (i >= 0 && i < ii - 2) {
      open = 1;
      interpolationStart = i;
      i += 2;

      do {
        char = value[i];
        i++;

        if (char === '\'' || char === '"') {
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
