import { BindableProperty } from 'aurelia-templating';
import { bindingMode, Expression, Binding, Scope } from 'aurelia-binding';

/**@internal */
declare module 'aurelia-templating' {
  interface ViewResources {
    lookupFunctions: any;
  }

  interface HtmlBehaviorResource {
    attributeName: string;
    attributeDefaultBindingMode: bindingMode | string;
    attributes: Record<string, BindableProperty>;
    properties: BindableProperty[];
    primaryProperty: BindableProperty;
  }

  interface BindableProperty {
    attribute: string;
    defaultBindingMode: bindingMode;
  }

  interface ViewCompiler {
    resources: ViewResources;
    // for tests
    _configureProperties(...args: any[]): any;
    _compileElement(...args: any[]): any;
  }
}

export interface IAttributeInfo {
  defaultBindingMode?: bindingMode;
  attrName: string;
  attrValue: string;
  command: string;
  expression: Expression;
}

/**@internal */
declare module 'aurelia-binding' {
  interface ObserverLocator {
    getAccessor(obj: any, propertyName: string): any;
  }

  interface Expression {
    bind(binding: Binding, scope: Scope, lookupFunctions?: any): void;
    unbind(binding: Binding, scope: Scope, lookupFunctions?: any): void;
  }
}
