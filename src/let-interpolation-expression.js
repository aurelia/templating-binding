import {bindingMode} from 'aurelia-binding';
import {
  InterpolationBinding,
  ChildInterpolationBinding
} from './interpolation-binding-expression';

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
