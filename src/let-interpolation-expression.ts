import {bindingMode, Expression, LookupFunctions, ObserverLocator, Scope} from 'aurelia-binding';
import {
  InterpolationBinding,
  ChildInterpolationBinding
} from './interpolation-binding-expression';

export class LetInterpolationBindingExpression {
  /** @internal */
  private observerLocator: ObserverLocator;
  /** @internal */
  private targetProperty: string;
  /** @internal */
  private parts: string[];
  /** @internal */
  private lookupFunctions: LookupFunctions;
  /** @internal */
  private toBindingContext: boolean;

  /**
   * @param {ObserverLocator} observerLocator
   * @param {string} targetProperty
   * @param {string[]} parts
   * @param {LookupFunctions} lookupFunctions
   * @param {boolean} toBindingContext indicates let binding result should be assigned to binding context
   */
  constructor(observerLocator: ObserverLocator, targetProperty: string, parts: string[], lookupFunctions: LookupFunctions, toBindingContext: boolean) {
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

  /** @internal */
  private observerLocator: ObserverLocator;

  /** @internal */
  private parts: (string | Expression)[];

  /** @internal */
  private targetProperty: string;

  /** @internal */
  private lookupFunctions: LookupFunctions;

  /** @internal */
  private toBindingContext: boolean;

  /** @internal */
  target: any;

  /** @internal */
  isBound: boolean;

  /** @internal */
  source: Scope;

  /** @internal */
  interpolationBinding: ChildInterpolationBinding | InterpolationBinding;

  /**
   * @param observerLocator
   * @param targetProperty
   * @param parts
   * @param lookupFunctions
   * @param toBindingContext indicates let binding result should be assigned to binding context
   */
  constructor(observerLocator: ObserverLocator, targetProperty: string, parts: (string | Expression)[], lookupFunctions: LookupFunctions, toBindingContext: boolean) {
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
        this.parts[1] as unknown as Expression,
        bindingMode.toView,
        this.lookupFunctions,
        this.targetProperty,
        this.parts[0] as string,
        this.parts[2] as string
      );
    }
    return new InterpolationBinding(
      this.observerLocator,
      this.parts,
      this.target,
      this.targetProperty,
      bindingMode.toView,
      this.lookupFunctions
    );
  }
}
