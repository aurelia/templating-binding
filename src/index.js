import {BindingLanguage} from 'aurelia-templating';
import {TemplatingBindingLanguage} from './binding-language';

export function configure(config) {
  config.container.registerSingleton(BindingLanguage, TemplatingBindingLanguage);
  config.container.registerAlias(BindingLanguage, TemplatingBindingLanguage);
}
