// tslint:disable:max-line-length
import {bindingMode, ObserverLocator, Scope, Expression} from 'aurelia-binding';
import {
  InterpolationBinding,
  ChildInterpolationBinding
} from './interpolation-binding-expression';

export class LetInterpolationBindingExpression {

  /**@internal*/
  observerLocator: ObserverLocator;
  /**@internal*/
  targetProperty: string;
  /**@internal*/
  parts: Array<string | Expression>;
  /**@internal*/
  lookupFunctions: any;
  /**@internal*/
  toBindingContext: boolean;

  /**
   * @param observerLocator
   * @param targetProperty
   * @param parts
   * @param lookupFunctions
   * @param toBindingContext indicates let binding result should be assigned to binding context
   */
  constructor(observerLocator: ObserverLocator, targetProperty: string, parts: Array<string | Expression>, lookupFunctions: any, toBindingContext: boolean) {
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

  /**@internal*/
  target: any;
  /**@internal*/
  isBound: any;
  /**@internal*/
  source: any;
  /**@internal*/
  interpolationBinding: ChildInterpolationBinding | InterpolationBinding;
  /**@internal*/
  observerLocator: ObserverLocator;
  /**@internal*/
  parts: (string | Expression)[];
  /**@internal*/
  targetProperty: string;
  /**@internal*/
  lookupFunctions: any;
  /**@internal*/
  toBindingContext: boolean;

  /**
   * @param observerLocator
   * @param targetProperty
   * @param parts
   * @param lookupFunctions
   * @param toBindingContext indicates let binding result should be assigned to binding context
   */
  constructor(observerLocator: ObserverLocator, targetProperty: string, parts: (string | Expression)[], lookupFunctions: any, toBindingContext: boolean) {
    this.observerLocator = observerLocator;
    this.parts = parts;
    this.targetProperty = targetProperty;
    this.lookupFunctions = lookupFunctions;
    this.toBindingContext = toBindingContext;
    this.target = null;
  }

  bind(source: Scope): void {
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
    let target = this.target;
    let observerLocator = this.observerLocator;
    let lookupFunctions = this.lookupFunctions;
    let targetProperty = this.targetProperty;
    let parts = this.parts;

    if (parts.length === 3) {
      return new ChildInterpolationBinding(
        target,
        observerLocator,
        parts[1] as Expression,
        bindingMode.toView,
        lookupFunctions,
        targetProperty,
        parts[0] as string,
        parts[2] as string
      );
    }
    return new InterpolationBinding(
      observerLocator,
      parts,
      target,
      targetProperty,
      bindingMode.toView,
      lookupFunctions
    );
  }
}
