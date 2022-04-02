import { Binding, bindingMode, connectable, enqueueBindingConnect, Expression, LookupFunctions, ObserverLocator, Scope } from 'aurelia-binding';
import * as LogManager from 'aurelia-logging';

export class InterpolationBindingExpression {

  /** @internal */
  private observerLocator: ObserverLocator;

  /** @internal */
  private targetProperty: string;

  /** @internal */
  parts: (string | Expression)[];

  /** @internal */
  mode: bindingMode;

  /** @internal */
  private lookupFunctions: LookupFunctions;

  /** @internal */
  private attribute: string;

  /** @internal */
  attrToRemove: string;

  /** @internal */
  discrete: boolean;

  constructor(
    observerLocator: ObserverLocator,
    targetProperty: string,
    parts: (string | Expression)[],
    mode: bindingMode,
    lookupFunctions: LookupFunctions,
    attribute: string
  ) {
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
        this.parts[1] as Expression,
        this.mode,
        this.lookupFunctions,
        this.targetProperty,
        this.parts[0] as string,
        this.parts[2] as string
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
  /** @internal */
  private observerLocator: ObserverLocator;
  /** @internal */
  private parts: (string | Expression)[];
  /** @internal */
  private target: any;
  /** @internal */
  private targetProperty: string;
  /** @internal */
  targetAccessor: InternalPropertyAccessor;
  /** @internal */
  mode: bindingMode;
  /** @internal */
  private lookupFunctions: LookupFunctions;
  /** @internal */
  isBound: boolean;
  /** @internal */
  source: Scope;

  constructor(observerLocator: ObserverLocator, parts: (string | Expression)[], target: any, targetProperty: string, mode: bindingMode, lookupFunctions: LookupFunctions) {
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
      let binding = new ChildInterpolationBinding(this, this.observerLocator, parts[i] as Expression, this.mode, this.lookupFunctions);
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

/** @internal */
export interface ChildInterpolationBinding extends Binding {
  observeArray(arr: any[]): void;
  unobserve(all?: boolean): void;
}

@connectable()
export class ChildInterpolationBinding {
  /** @internal */
  private parent: InterpolationBinding;
  /** @internal */
  private target: any;
  /** @internal */
  private targetProperty: string;
  /** @internal */
  private targetAccessor: InternalPropertyAccessor;
  /** @internal */
  private observerLocator: ObserverLocator;
  /** @internal */
  sourceExpression: Expression;
  /** @internal */
  mode: bindingMode;
  /** @internal */
  private lookupFunctions: LookupFunctions;
  /** @internal */
  private left: string;
  /** @internal */
  private right: string;
  /** @internal */
  private value: any;
  /** @internal */
  isBound: boolean;
  /** @internal */
  private rawValue: any;
  /**
   * From @connectable decorator
   * @internal
   */
  private _version: any;
  /** @internal */
  source: Scope;

  constructor(
    target: InterpolationBinding,
    observerLocator: ObserverLocator,
    sourceExpression: Expression,
    mode: bindingMode,
    lookupFunctions: LookupFunctions,
    targetProperty?: string,
    left?: string,
    right?: string
  ) {
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

interface InternalPropertyAccessor {
  setValue(value: any, obj: object, prop: string): void;
}

/** @internal */
declare module 'aurelia-binding' {
  export function connectable(...args: unknown[]): (...args: unknown[]) => any;

  interface ObserverLocator {
    getAccessor(obj: object, prop: string): InternalPropertyAccessor;
  }

  interface Expression {
    bind?(binding: Binding, source: Scope, lookup?: LookupFunctions): void;
    unbind?(binding: Binding, source: Scope, lookup?: LookupFunctions): void;
  }
}
