import {
  connectable,
  enqueueBindingConnect,
  sourceContext
} from 'aurelia-binding';

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
