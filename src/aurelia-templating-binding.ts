import { BindingLanguage } from 'aurelia-templating';
import { TemplatingBindingLanguage } from './binding-language';

export function configure(config: any) {
  const container = config.container;
  container.registerSingleton(BindingLanguage, TemplatingBindingLanguage);
  container.registerAlias(BindingLanguage, TemplatingBindingLanguage);
}

export { AttributeMap } from './attribute-map';
export { TemplatingBindingLanguage } from './binding-language';
export { SyntaxInterpreter } from './syntax-interpreter';
export { InterpolationBindingExpression, InterpolationBinding, ChildInterpolationBinding } from './interpolation-binding-expression';
export { LetExpression, LetBinding } from './let-expression';
export { LetInterpolationBindingExpression, LetInterpolationBinding } from './let-interpolation-expression';
export { IAttributeInfo } from './interfaces';
