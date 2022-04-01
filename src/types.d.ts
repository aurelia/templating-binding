import { BindingExpression, bindingMode } from "aurelia-binding";

/**
 * An object describing information analyzed from an attribute in an Aurelia templates
 */
export interface AttributeInfo {
  command?: string;
  expression?: string | BindingExpression;
  attrName?: string;
  attrValue?: string;
  defaultBindingMode?: bindingMode;
}
