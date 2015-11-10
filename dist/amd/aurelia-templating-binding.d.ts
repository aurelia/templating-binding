declare module 'aurelia-templating-binding' {
  import * as LogManager from 'aurelia-logging';
  import { bindingMode, connectable, Parser, ObserverLocator, EventManager, ListenerExpression, BindingExpression, CallExpression, NameExpression }  from 'aurelia-binding';
  import { BehaviorInstruction, BindingLanguage }  from 'aurelia-templating';
  export class InterpolationBindingExpression {
    constructor(observerLocator: any, targetProperty: any, parts: any, mode: any, lookupFunctions: any, attribute: any);
    createBinding(target: any): any;
  }
  export class InterpolationBinding {
    constructor(observerLocator: any, parts: any, target: any, targetProperty: any, mode: any, lookupFunctions: any);
    interpolate(): any;
    bind(source: any): any;
    unbind(): any;
  }
  export class ChildInterpolationBinding {
    constructor(parent: any, observerLocator: any, sourceExpression: any, mode: any, lookupFunctions: any);
    updateTarget(value: any): any;
    call(): any;
    bind(source: any): any;
    unbind(): any;
  }
  
  /*eslint dot-notation:0*/
  export class SyntaxInterpreter {
    static inject(): any;
    constructor(parser: any, observerLocator: any, eventManager: any);
    interpret(resources: any, element: any, info: any, existingInstruction: any): any;
    handleUnknownCommand(resources: any, element: any, info: any, existingInstruction: any): any;
    determineDefaultBindingMode(element: any, attrName: any): any;
    bind(resources: any, element: any, info: any, existingInstruction: any): any;
    trigger(resources: any, element: any, info: any): any;
    delegate(resources: any, element: any, info: any): any;
    call(resources: any, element: any, info: any, existingInstruction: any): any;
    options(resources: any, element: any, info: any, existingInstruction: any): any;
    'for'(resources: any, element: any, info: any, existingInstruction: any): any;
    'two-way'(resources: any, element: any, info: any, existingInstruction: any): any;
    'one-way'(resources: any, element: any, info: any, existingInstruction: any): any;
    'one-time'(resources: any, element: any, info: any, existingInstruction: any): any;
  }
  export class TemplatingBindingLanguage extends BindingLanguage {
    static inject(): any;
    constructor(parser: any, observerLocator: any, syntaxInterpreter: any);
    inspectAttribute(resources: any, attrName: any, attrValue: any): any;
    createAttributeInstruction(resources: any, element: any, theInfo: any, existingInstruction: any): any;
    parseText(resources: any, value: any): any;
    parseContent(resources: any, attrName: any, attrValue: any): any;
  }
  export function configure(config: any): any;
}