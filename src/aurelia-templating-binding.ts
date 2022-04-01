import {BindingLanguage} from 'aurelia-templating';
import {TemplatingBindingLanguage} from './binding-language';

export function configure(config) {
  config.container.registerSingleton(BindingLanguage, TemplatingBindingLanguage);
  config.container.registerAlias(BindingLanguage, TemplatingBindingLanguage);
}

export { AttributeMap } from './attribute-map';
export { TemplatingBindingLanguage } from './binding-language';
export { ChildInterpolationBinding, InterpolationBinding, InterpolationBindingExpression } from './interpolation-binding-expression';
export { LetBinding, LetExpression } from './let-expression';
export { LetInterpolationBinding, LetInterpolationBindingExpression } from './let-interpolation-expression';
export { SyntaxInterpreter } from './syntax-interpreter';
export { AttributeInfo } from './types';
