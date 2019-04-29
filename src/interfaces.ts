import { BindableProperty } from 'aurelia-templating';
import { bindingMode, Expression } from 'aurelia-binding';

/**@internal */
declare module 'aurelia-templating' {
  interface ViewResources {
    lookupFunctions: any;
  }

  interface HtmlBehaviorResource {
    attributeName: string;
    attributes: Record<string, BindableProperty>;
    primaryProperty: BindableProperty;
  }
  
  interface BindableProperty {
    attribute: string;
    defaultBindingMode: bindingMode;
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
}
