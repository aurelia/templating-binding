import {
  connectable,
  enqueueBindingConnect,
  createOverrideContext,
  sourceContext
} from 'aurelia-binding';

export class LetExpression {
  /**
   * @param {ObserverLocator} observerLocator
   * @param {string} targetProperty
   * @param {Expression} sourceExpression
   * @param {{}} lookupFunctions
   */
  constructor(observerLocator, targetProperty, sourceExpression, lookupFunctions) {
    this.observerLocator = observerLocator;
    this.sourceExpression = sourceExpression;
    this.targetProperty = targetProperty;
    this.lookupFunctions = lookupFunctions;
    this.discrete = false;
  }

  createBinding() {
    return new Let(
      this.observerLocator,
      this.sourceExpression,
      this.targetProperty,
      this.lookupFunctions
    );
  }
}

@connectable()
export class Let {
  /**
   * 
   * @param {ObserverLocator} observerLocator 
   * @param {Expression} sourceExpression 
   * @param {Function | Element} target 
   * @param {string} targetProperty
   * @param {*} lookupFunctions 
   */
  constructor(observerLocator, sourceExpression, targetProperty, lookupFunctions) {
    this.observerLocator = observerLocator;
    this.sourceExpression = sourceExpression;
    this.targetProperty = targetProperty;
    this.lookupFunctions = lookupFunctions;
    this.source = null;
    this.target = null;
  }

  updateSource() {
    const value = this.sourceExpression.evaluate(this.source, this.lookupFunctions);
    this.target[this.targetProperty] = value;
  }

  call(context) {
    if (!this.isBound) {
      return;
    }
    if (context === sourceContext) {
      this.updateSource();
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
    this.target = source.bindingContext;

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
    this.updateSource();
    this.sourceExpression.connect(this, this.source);
  }
}
