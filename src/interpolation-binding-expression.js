import {bindingMode, connectable} from 'aurelia-binding';
import * as LogManager from 'aurelia-logging';

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

export class InterpolationBinding {
  constructor(observerLocator, parts, target, targetProperty, mode, lookupFunctions) {
    if (targetProperty === 'style') {
      LogManager.getLogger('templating-binding')
        .info('Internet Explorer does not support interpolation in "style" attributes.  Use the style attribute\'s alias, "css" instead.');
    } else if (target.parentElement && target.parentElement.nodeName === 'TEXTAREA' && targetProperty === 'textContent') {
      throw new Error('Interpolation binding cannot be used in the content of a textarea element.  Use <textarea value.bind="expression"></textarea> instead.');
    }

    this.observerLocator = observerLocator;
    this.parts = parts;
    this.targetProperty = observerLocator.getObserver(target, targetProperty);
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
      this.targetProperty.setValue(value);
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
  constructor(parent, observerLocator, sourceExpression, mode, lookupFunctions) {
    this.parent = parent;
    this.observerLocator = observerLocator;
    this.sourceExpression = sourceExpression;
    this.mode = mode;
    this.lookupFunctions = lookupFunctions;
  }

  updateTarget(value) {
    value = value === null || value === undefined ? '' : value.toString();
    if (value !== this.value) {
      this.value = value;
      this.parent.interpolate();
    }
  }

  call() {
    if (!this.isBound) {
      return;
    }

    let value = this.sourceExpression.evaluate(this.source, this.lookupFunctions);
    this.updateTarget(value);

    if (this.mode !== bindingMode.oneTime) {
      this._version++;
      this.sourceExpression.connect(this, this.source);
      if (value instanceof Array) {
        this.observeArray(value);
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

    let value = sourceExpression.evaluate(source, this.lookupFunctions);
    this.updateTarget(value);

    if (this.mode === bindingMode.oneWay) {
      sourceExpression.connect(this, source);
      if (value instanceof Array) {
        this.observeArray(value);
      }
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
    this.unobserve(true);
  }
}
