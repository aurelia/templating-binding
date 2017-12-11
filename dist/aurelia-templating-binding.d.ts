import * as LogManager from 'aurelia-logging';
import {
  camelCase,
  SVGAnalyzer,
  bindingMode,
  connectable,
  enqueueBindingConnect,
  Parser,
  ObserverLocator,
  EventManager,
  ListenerExpression,
  BindingExpression,
  CallExpression,
  delegationStrategy,
  NameExpression
} from 'aurelia-binding';
import {
  BehaviorInstruction,
  BindingLanguage,
  ViewResources
} from 'aurelia-templating';
export declare class AttributeMap {
  static inject: any;
  elements: any;
  allElements: any;
  constructor(svg?: any);

  /**
     * Maps a specific HTML element attribute to a javascript property.
     */
  register(elementName?: any, attributeName?: any, propertyName?: any): any;

  /**
     * Maps an HTML attribute to a javascript property.
     */
  registerUniversal(attributeName?: any, propertyName?: any): any;

  /**
     * Returns the javascript property name for a particlar HTML attribute.
     */
  map(elementName?: any, attributeName?: any): any;
}
export declare class InterpolationBindingExpression {
  constructor(observerLocator?: any, targetProperty?: any, parts?: any, mode?: any, lookupFunctions?: any, attribute?: any);
  createBinding(target?: any): any;
}
export declare class InterpolationBinding {
  constructor(observerLocator?: any, parts?: any, target?: any, targetProperty?: any, mode?: any, lookupFunctions?: any);
  interpolate(): any;
  updateOneTimeBindings(): any;
  bind(source?: any): any;
  unbind(): any;
}
export declare class ChildInterpolationBinding {
  constructor(target?: any, observerLocator?: any, sourceExpression?: any, mode?: any, lookupFunctions?: any, targetProperty?: any, left?: any, right?: any);
  updateTarget(value?: any): any;
  call(): any;
  bind(source?: any): any;
  unbind(): any;
  connect(evaluate?: any): any;
}

/*eslint dot-notation:0*/
export declare class SyntaxInterpreter {
  static inject: any;
  constructor(parser?: any, observerLocator?: any, eventManager?: any, attributeMap?: any);
  interpret(resources?: any, element?: any, info?: any, existingInstruction?: any, context?: any): any;
  handleUnknownCommand(resources?: any, element?: any, info?: any, existingInstruction?: any, context?: any): any;
  determineDefaultBindingMode(element?: any, attrName?: any, context?: any): any;
  bind(resources?: any, element?: any, info?: any, existingInstruction?: any, context?: any): any;
  trigger(resources?: any, element?: any, info?: any): any;
  capture(resources?: any, element?: any, info?: any): any;
  delegate(resources?: any, element?: any, info?: any): any;
  call(resources?: any, element?: any, info?: any, existingInstruction?: any): any;
  options(resources?: any, element?: any, info?: any, existingInstruction?: any, context?: any): any;
  'for'(resources?: any, element?: any, info?: any, existingInstruction?: any): any;
  'two-way'(resources?: any, element?: any, info?: any, existingInstruction?: any): any;
  'to-view'(resources?: any, element?: any, info?: any, existingInstruction?: any): any;
  'from-view'(resources?: any, element?: any, info?: any, existingInstruction?: any): any;
  'one-way'(resources?: any, element?: any, info?: any, existingInstruction?: any): any;
  'one-time'(resources?: any, element?: any, info?: any, existingInstruction?: any): any;
}

export declare class LetExpression {
  createBinding(): LetBinding
}

export declare class LetBinding {
  constructor();
  updateSource(): any;
  call(context): any;
  bind(source?: any): any;
  unbind(): any;
  connect(): any;
}

export declare class LetInterpolationBindingExpression {
  createBinding(): LetInterpolationBinding
}

export declare class LetInterpolationBinding {
  constructor();
  updateSource(): any;
  call(context): any;
  bind(source?: any): any;
  unbind(): any;
  connect(): any;
}

export declare class TemplatingBindingLanguage extends BindingLanguage {
  static inject: any;
  constructor(parser?: any, observerLocator?: any, syntaxInterpreter?: any, attributeMap?: any);
  inspectAttribute(resources?: any, elementName?: any, attrName?: any, attrValue?: any): any;
  createLetExpressions(
    resources: ViewResources,
    letElement: HTMLElement,
    existingLetExpressions: (LetExpression | LetInterpolationBindingExpression)[]
  ): (LetExpression | LetInterpolationBindingExpression)[]
  createAttributeInstruction(resources?: any, element?: any, theInfo?: any, existingInstruction?: any, context?: any): any;
  inspectTextContent(resources?: any, value?: any): any;
  parseInterpolation(resources?: any, value?: any): any;
}
export declare function configure(config?: any): any;