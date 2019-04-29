import { BindingLanguage } from 'aurelia-templating';
import { TemplatingBindingLanguage } from './binding-language';

export function configure(config: any) {
  const container = config.container;
  container.registerSingleton(BindingLanguage, TemplatingBindingLanguage);
  container.registerAlias(BindingLanguage, TemplatingBindingLanguage);
}
