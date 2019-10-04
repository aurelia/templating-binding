import {
  connectable,
  enqueueBindingConnect,
  sourceContext,
  Expression,
  ObserverLocator,
  Scope
} from 'aurelia-binding';

export class LetExpression {

  /**@internal*/
  observerLocator: ObserverLocator;
  /**@internal*/
  sourceExpression: Expression;
  /**@internal*/
  targetProperty: string;
  /**@internal*/
  lookupFunctions: any;
  /**@internal*/
  toBindingContext: boolean;

  /**
   * @param observerLocator
   * @param targetProperty
   * @param sourceExpression
   * @param lookupFunctions
   * @param toBindingContext indicates let binding result should be assigned to binding context
   */
  constructor(
    observerLocator: ObserverLocator,
    targetProperty: string,
    sourceExpression: Expression,
    lookupFunctions: any,
    toBindingContext: boolean
  ) {
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

export class LetBinding {

  /**@internal*/
  observerLocator: ObserverLocator;
  /**@internal*/
  sourceExpression: Expression;
  /**@internal*/
  targetProperty: string;
  /**@internal*/
  lookupFunctions: any;
  /**@internal*/
  source: Scope;
  /**@internal*/
  target: any;
  /**@internal*/
  toBindingContext: boolean;
  /**@internal*/
  isBound: boolean;

  /**
   * @param observerLocator
   * @param sourceExpression
   * @param target
   * @param targetProperty
   * @param lookupFunctions
   * @param toBindingContext indicates let binding result should be assigned to binding context
   */
  constructor(
    observerLocator: ObserverLocator,
    sourceExpression: Expression,
    targetProperty: string,
    lookupFunctions: any,
    toBindingContext: boolean
  ) {
    this.observerLocator = observerLocator;
    this.sourceExpression = sourceExpression;
    this.targetProperty = targetProperty;
    this.lookupFunctions = lookupFunctions;
    this.source = null;
    this.target = null;
    this.toBindingContext = toBindingContext;
  }

  updateTarget(): void {
    const value = this.sourceExpression.evaluate(this.source, this.lookupFunctions);
    this.target[this.targetProperty] = value;
  }

  call(context: any): void {
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
   * @param source Binding context
   */
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

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(this, source, this.lookupFunctions);
    }

    enqueueBindingConnect(this);
  }

  unbind(): void {
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

  unobserve(arg0: boolean): void {
    throw new Error('Method not implemented.');
  }

  connect(): void {
    if (!this.isBound) {
      return;
    }
    this.updateTarget();
    this.sourceExpression.connect(this, this.source);
  }
}

// avoid generating excessive code
(connectable() as any)(LetBinding);
