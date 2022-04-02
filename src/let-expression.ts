import {
  connectable,
  enqueueBindingConnect,
  Expression,
  LookupFunctions,
  ObserverLocator,
  Scope,
  sourceContext
} from 'aurelia-binding';

export class LetExpression {
  /** @internal */
  private observerLocator: ObserverLocator;
  /** @internal */
  private sourceExpression: Expression;
  /** @internal */
  private targetProperty: string;
  /** @internal */
  private lookupFunctions: LookupFunctions;
  /** @internal */
  private toBindingContext: boolean;

  /**
   * @param observerLocator
   * @param targetProperty
   * @param sourceExpression
   * @param lookupFunctions
   * @param toBindingContext indicates let binding result should be assigned to binding context
   */
  constructor(observerLocator: ObserverLocator, targetProperty: string, sourceExpression: Expression, lookupFunctions: LookupFunctions, toBindingContext: boolean) {
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

  /** @internal */
  private observerLocator: ObserverLocator;

  /** @internal */
  sourceExpression: Expression;

  /** @internal */
  private targetProperty: string;

  /** @internal */
  private lookupFunctions: LookupFunctions;

  /** @internal */
  source: Scope;

  /** @internal */
  target: any;

  /** @internal */
  private toBindingContext: boolean;

  /** @internal */
  isBound: boolean;

  /**
   * @param observerLocator
   * @param sourceExpression
   * @param targetProperty
   * @param lookupFunctions
   * @param toBindingContext indicates let binding result should be assigned to binding context
   */
  constructor(observerLocator: ObserverLocator, sourceExpression: Expression, targetProperty: string, lookupFunctions: LookupFunctions, toBindingContext: boolean) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unobserve(arg0: boolean) {
    throw new Error('Method not implemented.');
  }

  connect() {
    if (!this.isBound) {
      return;
    }
    this.updateTarget();
    this.sourceExpression.connect(this, this.source);
  }
}
