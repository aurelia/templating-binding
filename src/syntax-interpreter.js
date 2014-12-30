import {
	Parser, 
	ObserverLocator, 
	EventManager,
	ListenerExpression,
	BindingExpression,
	NameExpression,
	ONE_WAY,
	TWO_WAY,
	ONE_TIME
} from 'aurelia-binding';

export class SyntaxInterpreter {
  static inject() { return [Parser,ObserverLocator,EventManager]; }
	constructor(parser, observerLocator, eventManager){
    this.parser = parser;
    this.observerLocator = observerLocator;
    this.eventManager = eventManager;

    this['for'] = function(resources, element, attrName, attrValue, existingInstruction){
    	var parts = attrValue.split(' of ');
    
		  if(parts.length !== 2){
		    throw new Error('Incorrect syntax for "for". The form is: "$local of $items".');
		  }

		  var instruction = existingInstruction || {attrName:attrName, attributes:{}};

		  instruction.attributes.local = parts[0];
		  instruction.attributes[attrName] = new BindingExpression(
          this.observerLocator,
          attrName,
          this.parser.parse(parts[1]),
          ONE_WAY,
          resources.valueConverterLookupFunction
        );

		  return instruction;
    };

    this['two-way'] = function(resources, element, attrName, attrValue, existingInstruction){
			var instruction = existingInstruction || {attrName:attrName, attributes:{}};

			instruction.attributes[attrName] = new BindingExpression(
					this.observerLocator,
	        attrName,
	        this.parser.parse(attrValue),
	        TWO_WAY,
	        resources.valueConverterLookupFunction		
				);

			return instruction;
		};

		this['one-way'] = function(resources, element, attrName, attrValue, existingInstruction){
			var instruction = existingInstruction || {attrName:attrName, attributes:{}};

			instruction.attributes[attrName] = new BindingExpression(
					this.observerLocator,
	        attrName === 'class' ? 'className' : attrName,
	        this.parser.parse(attrValue),
	        ONE_WAY,
	        resources.valueConverterLookupFunction		
				);

			return instruction;
		};

		this['one-time'] = function(resources, element, attrName, attrValue, existingInstruction){
			var instruction = existingInstruction || {attrName:attrName, attributes:{}};

			instruction.attributes[attrName] = new BindingExpression(
					this.observerLocator,
	        attrName === 'class' ? 'className' : attrName,
	        this.parser.parse(attrValue),
	        ONE_TIME,
	        resources.valueConverterLookupFunction		
				);

			return instruction;
		};
  }

  interpret(type, resources, element, attrName, attrValue, existingInstruction){
  	if(type in this){
  		return this[type](resources, element, attrName, attrValue, existingInstruction);
  	}
  }

  determineDefaultBindingMode(element, attrName){
  	var tagName = element.tagName.toLowerCase();

  	if(tagName === 'input'){
  		return attrName === 'value' || attrName === 'checked' ? TWO_WAY : ONE_WAY;
  	}else if(tagName == 'textarea' || tagName == 'select'){
  		return attrName == 'value' ? TWO_WAY : ONE_WAY;
  	}

  	return ONE_WAY;
  }

	bind(resources, element, attrName, attrValue, existingInstruction){
		var instruction = existingInstruction || {attrName:attrName, attributes:{}};

		instruction.attributes[attrName] = new BindingExpression(
				this.observerLocator,
        attrName,
        this.parser.parse(attrValue),
        this.determineDefaultBindingMode(element, attrName),
        resources.valueConverterLookupFunction		
			);

		return instruction;
	}

	trigger(resources, element, attrName, attrValue){
		return new ListenerExpression(
      this.eventManager,
      attrName,
      this.parser.parse(attrValue),
      false,
      true
    );
	}

	delegate(resources, element, attrName, attrValue){
		return new ListenerExpression(
      this.eventManager,
      attrName,
      this.parser.parse(attrValue),
      true,
      true
    );
	}

	ref(resources, element, attrName, attrValue){
		return new NameExpression(attrName);
	}

	options(resources, element, attrName, attrValue){
		var instruction = {attrName:attrName, attributes:{}},
				language = this.language,
				name = null, target = '', current, i , ii;

		for(i = 0, ii = attrValue.length; i < ii; ++i){
			current = attrValue[i];

			if(current === ';'){
				language.parseAttribute(resources, element, name, target, instruction);
				target = '';
				name = null;
			} else if(current === ':' && name === null){
				name = target.trim();
				target = '';
			} else {
				target += current;
			}
		}

		if(name !== null){
			language.parseAttribute(resources, element, name, target, instruction);
		}

		return instruction;
	}
}