import {BindingLanguage} from 'aurelia-templating';
import {TemplatingBindingLanguage} from './binding-language';

export function configure(config){
  var instance,
      getInstance = function (c){
        return instance || (instance = c.invoke(TemplatingBindingLanguage));
      };

  if(config.container.hasHandler(TemplatingBindingLanguage)){
    instance = config.container.get(TemplatingBindingLanguage);
  }else{
    config.container.registerHandler(TemplatingBindingLanguage, getInstance);
  }

  config.container.registerHandler(BindingLanguage, getInstance);
}
