import {BindingLanguage} from 'aurelia-templating';
import {TemplatingBindingLanguage} from './binding-language';

export function configure(aurelia){
  var instance,
      getInstance = function (c){
        return instance || (instance = c.invoke(TemplatingBindingLanguage));
      };

  if(aurelia.container.hasHandler(TemplatingBindingLanguage)){
    instance = aurelia.container.get(TemplatingBindingLanguage);
  }else{
    aurelia.container.registerHandler(TemplatingBindingLanguage, getInstance);
  }

  aurelia.container.registerHandler(BindingLanguage, getInstance);
}
