import * as LogManager from 'aurelia-logging';
import {camelCase,SVGAnalyzer,bindingMode,connectable,enqueueBindingConnect,sourceContext,Parser,ObserverLocator,EventManager,ListenerExpression,BindingExpression,CallExpression,delegationStrategy,NameExpression,LiteralString} from 'aurelia-binding';
import {BehaviorInstruction,BindingLanguage} from 'aurelia-templating';

export class AttributeMap {
  static inject = [SVGAnalyzer];

  elements = Object.create(null);
  allElements = Object.create(null);

  constructor(svg) {
    this.svg = svg;

    this.registerUniversal('accesskey', 'accessKey');
    this.registerUniversal('contenteditable', 'contentEditable');
    this.registerUniversal('tabindex', 'tabIndex');
    this.registerUniversal('textcontent', 'textContent');
    this.registerUniversal('innerhtml', 'innerHTML');
    this.registerUniversal('scrolltop', 'scrollTop');
    this.registerUniversal('scrollleft', 'scrollLeft');
    this.registerUniversal('readonly', 'readOnly');

    this.register('label', 'for', 'htmlFor');

    this.register('img', 'usemap', 'useMap');

    this.register('input', 'maxlength', 'maxLength');
    this.register('input', 'minlength', 'minLength');
    this.register('input', 'formaction', 'formAction');
    this.register('input', 'formenctype', 'formEncType');
    this.register('input', 'formmethod', 'formMethod');
    this.register('input', 'formnovalidate', 'formNoValidate');
    this.register('input', 'formtarget', 'formTarget');

    this.register('textarea', 'maxlength', 'maxLength');

    this.register('td', 'rowspan', 'rowSpan');
    this.register('td', 'colspan', 'colSpan');
    this.register('th', 'rowspan', 'rowSpan');
    this.register('th', 'colspan', 'colSpan');
  }

  /**
   * Maps a specific HTML element attribute to a javascript property.
   */
  register(elementName, attributeName, propertyName) {
    elementName = elementName.toLowerCase();
    attributeName = attributeName.toLowerCase();
    const element = this.elements[elementName] = (this.elements[elementName] || Object.create(null));
    element[attributeName] = propertyName;
  }

  /**
   * Maps an HTML attribute to a javascript property.
   */
  registerUniversal(attributeName, propertyName) {
    attributeName = attributeName.toLowerCase();
    this.allElements[attributeName] = propertyName;
  }

  /**
   * Returns the javascript property name for a particlar HTML attribute.
   */
  map(elementName, attributeName) {
    if (this.svg.isStandardSvgAttribute(elementName, attributeName)) {
      return attributeName;
    }
    elementName = elementName.toLowerCase();
    attributeName = attributeName.toLowerCase();
    const element = this.elements[elementName];
    if (element !== undefined && attributeName in element) {
      return element[attributeName];
    }
    if (attributeName in this.allElements) {
      return this.allElements[attributeName];
    }
    // do not camel case data-*, aria-*, or attributes with : in the name.
    if (/(?:^data-)|(?:^aria-)|:/.test(attributeName)) {
      return attributeName;
    }
    return camelCase(attributeName);
  }
}

export class InterpolationBindingExpression {
  constructor(observerLocator, targetProperty, parts,
    mode, lookupFunctions, attribute) {
    this.observerLocator = observerLocator;
    this.targetProperty = targetProperty;
    this.parts = parts;
    this.mode = mode;
    this.lookupFunctions = lookupFunctions;
    this.attribute = this.attrToRemove = attribute;
    this.discrete = false;
  }

  createBinding(target) {
    if (this.parts.length === 3) {
      return new ChildInterpolationBinding(
        target,
        this.observerLocator,
        this.parts[1],
        this.mode,
        this.lookupFunctions,
        this.targetProperty,
        this.parts[0],
        this.parts[2]
      );
    }
    return new InterpolationBinding(
      this.observerLocator,
      this.parts,
      target,
      this.targetProperty,
      this.mode,
      this.lookupFunctions
      );
  }
}

function validateTarget(target, propertyName) {
  if (propertyName === 'style') {
    LogManager.getLogger('templating-binding')
      .info('Internet Explorer does not support interpolation in "style" attributes.  Use the style attribute\'s alias, "css" instead.');
  } else if (target.parentElement && target.parentElement.nodeName === 'TEXTAREA' && propertyName === 'textContent') {
    throw new Error('Interpolation binding cannot be used in the content of a textarea element.  Use <textarea value.bind="expression"></textarea> instead.');
  }
}

export class InterpolationBinding {
  constructor(observerLocator, parts, target, targetProperty, mode, lookupFunctions) {
    validateTarget(target, targetProperty);
    this.observerLocator = observerLocator;
    this.parts = parts;
    this.target = target;
    this.targetProperty = targetProperty;
    this.targetAccessor = observerLocator.getAccessor(target, targetProperty);
    this.mode = mode;
    this.lookupFunctions = lookupFunctions;
  }

  interpolate() {
    if (this.isBound) {
      let value = '';
      let parts = this.parts;
      for (let i = 0, ii = parts.length; i < ii; i++) {
        value += (i % 2 === 0 ? parts[i] : this[`childBinding${i}`].value);
      }
      this.targetAccessor.setValue(value, this.target, this.targetProperty);
    }
  }

  updateOneTimeBindings() {
    for (let i = 1, ii = this.parts.length; i < ii; i += 2) {
      let child = this[`childBinding${i}`];
      if (child.mode === bindingMode.oneTime) {
        child.call();
      }
    }
  }

  bind(source) {
    if (this.isBound) {
      if (this.source === source) {
        return;
      }
      this.unbind();
    }
    this.source = source;

    let parts = this.parts;
    for (let i = 1, ii = parts.length; i < ii; i += 2) {
      let binding = new ChildInterpolationBinding(this, this.observerLocator, parts[i], this.mode, this.lookupFunctions);
      binding.bind(source);
      this[`childBinding${i}`] = binding;
    }

    this.isBound = true;
    this.interpolate();
  }

  unbind() {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this.source = null;
    let parts = this.parts;
    for (let i = 1, ii = parts.length; i < ii; i += 2) {
      let name = `childBinding${i}`;
      this[name].unbind();
    }
  }
}

@connectable()
export class ChildInterpolationBinding {
  constructor(target, observerLocator, sourceExpression, mode, lookupFunctions, targetProperty, left, right) {
    if (target instanceof InterpolationBinding) {
      this.parent = target;
    } else {
      validateTarget(target, targetProperty);
      this.target = target;
      this.targetProperty = targetProperty;
      this.targetAccessor = observerLocator.getAccessor(target, targetProperty);
    }
    this.observerLocator = observerLocator;
    this.sourceExpression = sourceExpression;
    this.mode = mode;
    this.lookupFunctions = lookupFunctions;
    this.left = left;
    this.right = right;
  }

  updateTarget(value) {
    value = value === null || value === undefined ? '' : value.toString();
    if (value !== this.value) {
      this.value = value;
      if (this.parent) {
        this.parent.interpolate();
      } else {
        this.targetAccessor.setValue(this.left + value + this.right, this.target, this.targetProperty);
      }
    }
  }

  call() {
    if (!this.isBound) {
      return;
    }

    this.rawValue = this.sourceExpression.evaluate(this.source, this.lookupFunctions);
    this.updateTarget(this.rawValue);

    if (this.mode !== bindingMode.oneTime) {
      this._version++;
      this.sourceExpression.connect(this, this.source);
      if (this.rawValue instanceof Array) {
        this.observeArray(this.rawValue);
      }
      this.unobserve(false);
    }
  }

  bind(source) {
    if (this.isBound) {
      if (this.source === source) {
        return;
      }
      this.unbind();
    }
    this.isBound = true;
    this.source = source;

    let sourceExpression = this.sourceExpression;
    if (sourceExpression.bind) {
      sourceExpression.bind(this, source, this.lookupFunctions);
    }

    this.rawValue = sourceExpression.evaluate(source, this.lookupFunctions);
    this.updateTarget(this.rawValue);

    if (this.mode === bindingMode.oneWay) {
      enqueueBindingConnect(this);
    }
  }

  unbind() {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    let sourceExpression = this.sourceExpression;
    if (sourceExpression.unbind) {
      sourceExpression.unbind(this, this.source);
    }
    this.source = null;
    this.value = null;
    this.rawValue = null;
    this.unobserve(true);
  }

  connect(evaluate) {
    if (!this.isBound) {
      return;
    }
    if (evaluate) {
      this.rawValue = this.sourceExpression.evaluate(this.source, this.lookupFunctions);
      this.updateTarget(this.rawValue);
    }
    this.sourceExpression.connect(this, this.source);
    if (this.rawValue instanceof Array) {
      this.observeArray(this.rawValue);
    }
  }
}

export class LetExpression {
  /**
   * @param {ObserverLocator} observerLocator
   * @param {string} targetProperty
   * @param {Expression} sourceExpression
   * @param {any} lookupFunctions
   * @param {boolean} toBindingContext indicates let binding result should be assigned to binding context
   */
  constructor(observerLocator, targetProperty, sourceExpression, lookupFunctions, toBindingContext) {
    this.observerLocator = observerLocator;
    this.sourceExpression = sourceExpression;
    this.targetProperty = targetProperty;
    this.lookupFunctions = lookupFunctions;
    this.toBindingContext = toBindingContext;
  }

  createBinding() {
    return new LetBinding(
      this.observerLocator,
      this.sourceExpression,
      this.targetProperty,
      this.lookupFunctions,
      this.toBindingContext
    );
  }
}

@connectable()
export class LetBinding {
  /**
   * @param {ObserverLocator} observerLocator
   * @param {Expression} sourceExpression
   * @param {Function | Element} target
   * @param {string} targetProperty
   * @param {*} lookupFunctions
   * @param {boolean} toBindingContext indicates let binding result should be assigned to binding context
   */
  constructor(observerLocator, sourceExpression, targetProperty, lookupFunctions, toBindingContext) {
    this.observerLocator = observerLocator;
    this.sourceExpression = sourceExpression;
    this.targetProperty = targetProperty;
    this.lookupFunctions = lookupFunctions;
    this.source = null;
    this.target = null;
    this.toBindingContext = toBindingContext;
  }

  updateTarget() {
    const value = this.sourceExpression.evaluate(this.source, this.lookupFunctions);
    this.target[this.targetProperty] = value;
  }

  call(context) {
    if (!this.isBound) {
      return;
    }
    if (context === sourceContext) {
      this.updateTarget();
      return;
    }
    throw new Error(`Unexpected call context ${context}`);
  }

  /**
   * @param {Scope} source Binding context
   */
  bind(source) {
    if (this.isBound) {
      if (this.source === source) {
        return;
      }
      this.unbind();
    }

    this.isBound = true;
    this.source = source;
    this.target = this.toBindingContext ? source.bindingContext : source.overrideContext;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(this, source, this.lookupFunctions);
    }

    enqueueBindingConnect(this);
  }

  unbind() {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(this, this.source);
    }
    this.source = null;
    this.target = null;
    this.unobserve(true);
  }

  connect() {
    if (!this.isBound) {
      return;
    }
    this.updateTarget();
    this.sourceExpression.connect(this, this.source);
  }
}

export class LetInterpolationBindingExpression {
  /**
   * @param {ObserverLocator} observerLocator
   * @param {string} targetProperty
   * @param {string[]} parts
   * @param {Lookups} lookupFunctions
   * @param {boolean} toBindingContext indicates let binding result should be assigned to binding context
   */
  constructor(observerLocator, targetProperty, parts, lookupFunctions, toBindingContext) {
    this.observerLocator = observerLocator;
    this.targetProperty = targetProperty;
    this.parts = parts;
    this.lookupFunctions = lookupFunctions;
    this.toBindingContext = toBindingContext;
  }

  createBinding() {
    return new LetInterpolationBinding(
      this.observerLocator,
      this.targetProperty,
      this.parts,
      this.lookupFunctions,
      this.toBindingContext
    );
  }
}

export class LetInterpolationBinding {
  /**
   * @param {ObserverLocator} observerLocator
   * @param {strign} targetProperty
   * @param {string[]} parts
   * @param {Lookups} lookupFunctions
   * @param {boolean} toBindingContext indicates let binding result should be assigned to binding context
   */
  constructor(observerLocator, targetProperty, parts, lookupFunctions, toBindingContext) {
    this.observerLocator = observerLocator;
    this.parts = parts;
    this.targetProperty = targetProperty;
    this.lookupFunctions = lookupFunctions;
    this.toBindingContext = toBindingContext;
    this.target = null;
  }

  /**
   * @param {Scope} source
   */
  bind(source) {
    if (this.isBound) {
      if (this.source === source) {
        return;
      }
      this.unbind();
    }

    this.isBound = true;
    this.source = source;
    this.target = this.toBindingContext ? source.bindingContext : source.overrideContext;

    this.interpolationBinding = this.createInterpolationBinding();
    this.interpolationBinding.bind(source);
  }

  unbind() {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this.source = null;
    this.target = null;
    this.interpolationBinding.unbind();
    this.interpolationBinding = null;
  }

  createInterpolationBinding() {
    if (this.parts.length === 3) {
      return new ChildInterpolationBinding(
        this.target,
        this.observerLocator,
        this.parts[1],
        bindingMode.oneWay,
        this.lookupFunctions,
        this.targetProperty,
        this.parts[0],
        this.parts[2]
      );
    }
    return new InterpolationBinding(
      this.observerLocator,
      this.parts,
      this.target,
      this.targetProperty,
      bindingMode.oneWay,
      this.lookupFunctions
    );
  }
}

/*eslint dot-notation:0*/
export class SyntaxInterpreter {
  static inject = [Parser, ObserverLocator, EventManager, AttributeMap];

  constructor(parser, observerLocator, eventManager, attributeMap) {
    this.parser = parser;
    this.observerLocator = observerLocator;
    this.eventManager = eventManager;
    this.attributeMap = attributeMap;
  }

  interpret(resources, element, info, existingInstruction, context) {
    if (info.command in this) {
      return this[info.command](resources, element, info, existingInstruction, context);
    }

    return this.handleUnknownCommand(resources, element, info, existingInstruction, context);
  }

  handleUnknownCommand(resources, element, info, existingInstruction, context) {
    LogManager.getLogger('templating-binding').warn('Unknown binding command.', info);
    return existingInstruction;
  }

  determineDefaultBindingMode(element, attrName, context) {
    let tagName = element.tagName.toLowerCase();

    if (tagName === 'input' && (attrName === 'value' || attrName === 'files') && element.type !== 'checkbox' && element.type !== 'radio'
      || tagName === 'input' && attrName === 'checked' && (element.type === 'checkbox' || element.type === 'radio')
      || (tagName === 'textarea' || tagName === 'select') && attrName === 'value'
      || (attrName === 'textcontent' || attrName === 'innerhtml') && element.contentEditable === 'true'
      || attrName === 'scrolltop'
      || attrName === 'scrollleft') {
      return bindingMode.twoWay;
    }

    if (context
      && attrName in context.attributes
      && context.attributes[attrName]
      && context.attributes[attrName].defaultBindingMode >= bindingMode.oneTime) {
      return context.attributes[attrName].defaultBindingMode;
    }

    return bindingMode.oneWay;
  }

  bind(resources, element, info, existingInstruction, context) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new BindingExpression(
      this.observerLocator,
      this.attributeMap.map(element.tagName, info.attrName),
      this.parser.parse(info.attrValue),
      info.defaultBindingMode === undefined || info.defaultBindingMode === null
        ? this.determineDefaultBindingMode(element, info.attrName, context)
        : info.defaultBindingMode,
      resources.lookupFunctions
    );

    return instruction;
  }

  trigger(resources, element, info) {
    return new ListenerExpression(
      this.eventManager,
      info.attrName,
      this.parser.parse(info.attrValue),
      delegationStrategy.none,
      true,
      resources.lookupFunctions
    );
  }

  capture(resources, element, info) {
    return new ListenerExpression(
      this.eventManager,
      info.attrName,
      this.parser.parse(info.attrValue),
      delegationStrategy.capturing,
      true,
      resources.lookupFunctions
    );
  }

  delegate(resources, element, info) {
    return new ListenerExpression(
      this.eventManager,
      info.attrName,
      this.parser.parse(info.attrValue),
      delegationStrategy.bubbling,
      true,
      resources.lookupFunctions
    );
  }

  call(resources, element, info, existingInstruction) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new CallExpression(
      this.observerLocator,
      info.attrName,
      this.parser.parse(info.attrValue),
      resources.lookupFunctions
    );

    return instruction;
  }

  options(resources, element, info, existingInstruction, context) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);
    let attrValue = info.attrValue;
    let language = this.language;
    let name = null;
    let target = '';
    let current;
    let i;
    let ii;
    let inString = false;
    let inEscape = false;
    let foundName = false;

    for (i = 0, ii = attrValue.length; i < ii; ++i) {
      current = attrValue[i];

      if (current === ';' && !inString) {
        if (!foundName) {
          name = this._getPrimaryPropertyName(resources, context);
        }
        info = language.inspectAttribute(resources, '?', name, target.trim());
        language.createAttributeInstruction(resources, element, info, instruction, context);

        if (!instruction.attributes[info.attrName]) {
          instruction.attributes[info.attrName] = info.attrValue;
        }

        target = '';
        name = null;
      } else if (current === ':' && name === null) {
        foundName = true;
        name = target.trim();
        target = '';
      } else if (current === '\\') {
        target += current;
        inEscape = true;
        continue;
      } else {
        target += current;

        if (name !== null && inEscape === false && current === '\'') {
          inString = !inString;
        }
      }

      inEscape = false;
    }

    // check for the case where we have a single value with no name
    // and there is a default property that we can use to obtain
    // the name of the property with which the value should be associated.
    if (!foundName) {
      name = this._getPrimaryPropertyName(resources, context);
    }

    if (name !== null) {
      info = language.inspectAttribute(resources, '?', name, target.trim());
      language.createAttributeInstruction(resources, element, info, instruction, context);

      if (!instruction.attributes[info.attrName]) {
        instruction.attributes[info.attrName] = info.attrValue;
      }
    }

    return instruction;
  }

  _getPrimaryPropertyName(resources, context) {
    let type = resources.getAttribute(context.attributeName);
    if (type && type.primaryProperty) {
      return type.primaryProperty.attribute;
    }
    return null;
  }

  'for'(resources, element, info, existingInstruction) {
    let parts;
    let keyValue;
    let instruction;
    let attrValue;
    let isDestructuring;

    attrValue = info.attrValue;
    isDestructuring = attrValue.match(/^ *[[].+[\]]/);
    parts = isDestructuring ? attrValue.split('of ') : attrValue.split(' of ');

    if (parts.length !== 2) {
      throw new Error('Incorrect syntax for "for". The form is: "$local of $items" or "[$key, $value] of $items".');
    }

    instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    if (isDestructuring) {
      keyValue = parts[0].replace(/[[\]]/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
      instruction.attributes.key = keyValue[0];
      instruction.attributes.value = keyValue[1];
    } else {
      instruction.attributes.local = parts[0];
    }

    instruction.attributes.items = new BindingExpression(
      this.observerLocator,
      'items',
      this.parser.parse(parts[1]),
      bindingMode.oneWay,
      resources.lookupFunctions
    );

    return instruction;
  }

  'two-way'(resources, element, info, existingInstruction) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new BindingExpression(
        this.observerLocator,
        this.attributeMap.map(element.tagName, info.attrName),
        this.parser.parse(info.attrValue),
        bindingMode.twoWay,
        resources.lookupFunctions
      );

    return instruction;
  }

  'to-view'(resources, element, info, existingInstruction) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new BindingExpression(
      this.observerLocator,
      this.attributeMap.map(element.tagName, info.attrName),
      this.parser.parse(info.attrValue),
      bindingMode.toView,
      resources.lookupFunctions
    );

    return instruction;
  }

  'from-view'(resources, element, info, existingInstruction) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new BindingExpression(
      this.observerLocator,
      this.attributeMap.map(element.tagName, info.attrName),
      this.parser.parse(info.attrValue),
      bindingMode.fromView,
      resources.lookupFunctions
    );

    return instruction;
  }

  'one-time'(resources, element, info, existingInstruction) {
    let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    instruction.attributes[info.attrName] = new BindingExpression(
      this.observerLocator,
      this.attributeMap.map(element.tagName, info.attrName),
      this.parser.parse(info.attrValue),
      bindingMode.oneTime,
      resources.lookupFunctions
    );

    return instruction;
  }
}

SyntaxInterpreter.prototype['one-way'] = SyntaxInterpreter.prototype['to-view'];

/*eslint indent:0*/
let info = {};

export class TemplatingBindingLanguage extends BindingLanguage {
  static inject = [Parser, ObserverLocator, SyntaxInterpreter, AttributeMap];

  constructor(parser, observerLocator, syntaxInterpreter, attributeMap) {
    super();
    this.parser = parser;
    this.observerLocator = observerLocator;
    this.syntaxInterpreter = syntaxInterpreter;
    this.emptyStringExpression = this.parser.parse('\'\'');
    syntaxInterpreter.language = this;
    this.attributeMap = attributeMap;
    this.toBindingContextAttr = 'to-binding-context';
  }

  inspectAttribute(resources, elementName, attrName, attrValue) {
    let parts = attrName.split('.');

    info.defaultBindingMode = null;

    if (parts.length === 2) {
      info.attrName = parts[0].trim();
      info.attrValue = attrValue;
      info.command = parts[1].trim();

      if (info.command === 'ref') {
        info.expression = new NameExpression(this.parser.parse(attrValue), info.attrName, resources.lookupFunctions);
        info.command = null;
        info.attrName = 'ref';
      } else {
        info.expression = null;
      }
    } else if (attrName === 'ref') {
      info.attrName = attrName;
      info.attrValue = attrValue;
      info.command = null;
      info.expression = new NameExpression(this.parser.parse(attrValue), 'element', resources.lookupFunctions);
    } else {
      info.attrName = attrName;
      info.attrValue = attrValue;
      info.command = null;
      const interpolationParts = this.parseInterpolation(resources, attrValue);
      if (interpolationParts === null) {
        info.expression = null;
      } else {
        info.expression = new InterpolationBindingExpression(
          this.observerLocator,
          this.attributeMap.map(elementName, attrName),
          interpolationParts,
          bindingMode.oneWay,
          resources.lookupFunctions,
          attrName
        );
      }
    }

    return info;
  }

	createAttributeInstruction(resources, element, theInfo, existingInstruction, context) {
    let instruction;

    if (theInfo.expression) {
      if (theInfo.attrName === 'ref') {
        return theInfo.expression;
      }

      instruction = existingInstruction || BehaviorInstruction.attribute(theInfo.attrName);
      instruction.attributes[theInfo.attrName] = theInfo.expression;
    } else if (theInfo.command) {
      instruction = this.syntaxInterpreter.interpret(
        resources,
        element,
        theInfo,
        existingInstruction,
        context);
    }

    return instruction;
  }

  /**
   * @param {ViewResources} resources
   * @param {Element} letElement
   */
  createLetExpressions(resources, letElement) {
    let expressions = [];
    let attributes = letElement.attributes;
    /**@type {Attr} */
    let attr;
    /**@type {string[]} */
    let parts;
    let attrName;
    let attrValue;
    let command;
    let toBindingContextAttr = this.toBindingContextAttr;
    let toBindingContext = letElement.hasAttribute(toBindingContextAttr);
    for (let i = 0, ii = attributes.length; ii > i; ++i) {
      attr = attributes[i];
      attrName = attr.name;
      attrValue = attr.nodeValue;
      parts = attrName.split('.');

      if (attrName === toBindingContextAttr) {
        continue;
      }

      if (parts.length === 2) {
        command = parts[1];
        if (command !== 'bind') {
          LogManager.getLogger('templating-binding-language')
            .warn(`Detected invalid let command. Expected "${parts[0]}.bind", given "${attrName}"`);
          continue;
        }
        expressions.push(new LetExpression(
          this.observerLocator,
          camelCase(parts[0]),
          this.parser.parse(attrValue),
          resources.lookupFunctions,
          toBindingContext
        ));
      } else {
        attrName = camelCase(attrName);
        parts = this.parseInterpolation(resources, attrValue);
        if (parts === null) {
          LogManager.getLogger('templating-binding-language')
            .warn(`Detected string literal in let bindings. Did you mean "${ attrName }.bind=${ attrValue }" or "${ attrName }=\${${ attrValue }}" ?`);
        }
        if (parts) {
          expressions.push(new LetInterpolationBindingExpression(
            this.observerLocator,
            attrName,
            parts,
            resources.lookupFunctions,
            toBindingContext
          ));
        } else {
          expressions.push(new LetExpression(
            this.observerLocator,
            attrName,
            new LiteralString(attrValue),
            resources.lookupFunctions,
            toBindingContext
          ));
        }
      }
    }
    return expressions;
  }

  inspectTextContent(resources, value) {
    const parts = this.parseInterpolation(resources, value);
    if (parts === null) {
      return null;
    }
    return new InterpolationBindingExpression(
      this.observerLocator,
      'textContent',
      parts,
      bindingMode.oneWay,
      resources.lookupFunctions,
      'textContent');
  }

  parseInterpolation(resources, value) {
    let i = value.indexOf('${', 0);
    let ii = value.length;
    let char;
    let pos = 0;
    let open = 0;
    let quote = null;
    let interpolationStart;
    let parts;
    let partIndex = 0;

    while (i >= 0 && i < ii - 2) {
      open = 1;
      interpolationStart = i;
      i += 2;

      do {
        char = value[i];
        i++;

        if (char === "'" || char === '"') {
          if (quote === null) {
            quote = char;
          } else if (quote === char) {
            quote = null;
          }
          continue;
        }

        if (char === '\\') {
          i++;
          continue;
        }

        if (quote !== null) {
          continue;
        }

        if (char === '{') {
          open++;
        } else if (char === '}') {
          open--;
        }
      } while (open > 0 && i < ii);

      if (open === 0) {
        // lazy allocate array
        parts = parts || [];
        if (value[interpolationStart - 1] === '\\' && value[interpolationStart - 2] !== '\\') {
          // escaped interpolation
          parts[partIndex] = value.substring(pos, interpolationStart - 1) + value.substring(interpolationStart, i);
          partIndex++;
          parts[partIndex] = this.emptyStringExpression;
          partIndex++;
        } else {
          // standard interpolation
          parts[partIndex] = value.substring(pos, interpolationStart);
          partIndex++;
          parts[partIndex] = this.parser.parse(value.substring(interpolationStart + 2, i - 1));
          partIndex++;
        }
        pos = i;
        i = value.indexOf('${', i);
      } else {
        break;
      }
    }

    // no interpolation.
    if (partIndex === 0) {
      return null;
    }

    // literal.
    parts[partIndex] = value.substr(pos);
    return parts;
  }
}

export function configure(config) {
  config.container.registerSingleton(BindingLanguage, TemplatingBindingLanguage);
  config.container.registerAlias(BindingLanguage, TemplatingBindingLanguage);
}
