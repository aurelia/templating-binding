/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BindingExpression,
  createScopeForTest, DirtyChecker, EventManager, ObserverLocator, Parser, SVGAnalyzer
} from 'aurelia-binding';
import { DOM } from 'aurelia-pal';
import { TaskQueue } from 'aurelia-task-queue';
import { ViewResources } from 'aurelia-templating';
import { AttributeMap } from '../src/attribute-map';
import {
  TemplatingBindingLanguage
} from '../src/binding-language';
import { InterpolationBinding } from '../src/interpolation-binding-expression';
import {
  SyntaxInterpreter
} from '../src/syntax-interpreter';
import { AttributeInfo } from '../src/types';
import './setup';

declare module 'aurelia-binding' {
  export class DirtyChecker { }
}

function createElement(html) {
  let div = DOM.createElement('div');
  div.innerHTML = html;
  return div.firstChild;
}

describe('InterpolationBinding', () => {
  let checkDelay = 40;
  let array1;
  let array2;
  let tests;
  let parser;
  let eventManager;
  let dirtyChecker;
  let observerLocator;
  let syntaxInterpreter;
  let language;
  let resources;

  beforeAll(() => {
    eventManager = new EventManager();
    dirtyChecker = new DirtyChecker();
    dirtyChecker.checkDelay = checkDelay / 2;
    observerLocator = new (ObserverLocator as any)(new TaskQueue(), eventManager, dirtyChecker, []);
    parser = new Parser();
    let attributeMap = new AttributeMap(new SVGAnalyzer());
    syntaxInterpreter = new SyntaxInterpreter(parser, observerLocator, eventManager, attributeMap);
    language = new TemplatingBindingLanguage(parser, observerLocator, syntaxInterpreter, attributeMap);
    resources = new ViewResources();
  });

  function getBinding(model, view: Element, attrName: string) {
    let attrValue: string;
    let info: AttributeInfo;
    let binding: InterpolationBinding;
    attrValue = view.getAttribute(attrName);
    info = language.inspectAttribute(resources, view.tagName, attrName, attrValue);
    binding = (info.expression as BindingExpression).createBinding(view) as InterpolationBinding;
    return binding;
  }

  function reset() {
    array1 = [1,2,3];
    array2 = ['a','b','c'];
    tests = [
      { change: (m, p) => m[p] = '',        result: () => '' },
      { change: (m, p) => m[p] = null,      result: () => '' },
      { change: (m, p) => m[p] = undefined, result: () => '' },
      { change: (m, p) => m[p] = 0,         result: () => '0' },
      { change: (m, p) => m[p] = false,     result: () => 'false' },
      { change: (m, p) => m[p] = true,      result: () => 'true' },
      { change: (m, p) => m[p] = 'baz',     result: () => 'baz' },
      { change: (m, p) => m[p] = {},        result: () => ({}.toString()) },
      { change: (m, p) => m[p] = { foo: 'foo', bar: 'bar' }, result: () => ({ foo: 'foo', bar: 'bar' }.toString()) },
      { change: (m, p) => m[p] = array1,       result: () => array1.toString() },
      { change: (m, p) => array1.push(4),      result: () => array1.toString() },
      { change: (m, p) => array1.pop(),        result: () => array1.toString() },
      { change: (m, p) => array1.splice(1, 1), result: () => array1.toString() },
      { change: (m, p) => array1.splice(2, 0, array2), result: () => array1.toString() },
      { change: (m, p) => m[p] = array2,       result: () => array2.toString() },
      { change: (m, p) => array2.push('d'),    result: () => array2.toString() },
      { change: (m, p) => m[p] = array1,       result: () => array1.toString() },
    ];
  }

  describe('single expression', function() {
    let viewModel
    let view
    let binding: InterpolationBinding;
    let targetAccessor
    let observer1
    let observer2;



    beforeAll(() => {
      reset();
      viewModel = { foo: [1,2] };
      view = createElement('<test foo="${foo}"></test>');
      binding = getBinding(viewModel, view, 'foo');
      targetAccessor = binding.targetAccessor;
      observer1 = observerLocator.getArrayObserver(array1);
      observer2 = observerLocator.getArrayObserver(array2);
    });

    it('binds', () => {
      binding.bind(createScopeForTest(viewModel));
      expect(targetAccessor.getValue(view, 'foo')).toBe(viewModel.foo.toString());
    });

    it('handles changes', done => {
      let next = () => {
        let test = tests.splice(0, 1)[0];
        let result;
        if (test) {
          test.change(viewModel, 'foo');
          result = test.result();
          setTimeout(() => {
            expect(targetAccessor.getValue(view, 'foo')).toBe(result);
            next();
          }, checkDelay);
        } else {
          done();
        }
      };

      next();
    });

    it('unbinds', () => {
      expect(observer1.hasSubscribers()).toBe(true);
      expect(observer2.hasSubscribers()).toBe(false);

      binding.unbind();

      expect(observer1.hasSubscribers()).toBe(false);
      expect(binding.source).toBe(null);
    });
  });

  describe('multiple expressions', () => {
    let viewModel;
    let view;
    let binding;
    let targetAccessor;
    let observer1;
    let observer2;

    beforeAll(() => {
      reset();
      viewModel = { foo: 'foo', bar: 'bar', baz: 'baz' };
      view = createElement('<test foo=" ${foo} hello ${bar} world ${baz} "></test>');
      binding = getBinding(viewModel, view, 'foo');
      targetAccessor = binding.targetAccessor;
      observer1 = observerLocator.getArrayObserver(array1);
      observer2 = observerLocator.getArrayObserver(array2);
    });

    it('binds', () => {
      binding.bind(createScopeForTest(viewModel));
      expect(targetAccessor.getValue(view, 'foo')).toBe(' foo hello bar world baz ');
    });

    it('handles changes', done => {
      let next = () => {
        let test = tests.splice(0, 1)[0];
        let result;
        if (test) {
          test.change(viewModel, 'foo');
          test.change(viewModel, 'bar');
          test.change(viewModel, 'baz');
          result = test.result();
          setTimeout(() => {
            expect(targetAccessor.getValue(view, 'foo')).toBe(' ' + result + ' hello ' + result + ' world ' + result + ' ');
            next();
          }, checkDelay);
        } else {
          done();
        }
      };

      next();
    });

    it('unbinds', () => {
      expect(observer1.hasSubscribers()).toBe(true);
      expect(observer2.hasSubscribers()).toBe(false);

      binding.unbind();

      expect(observer1.hasSubscribers()).toBe(false);
      expect(binding.source).toBe(null);
    });

    it('has an updateOneTimeBindings method', () => {
      binding.updateOneTimeBindings();
    });
  });

  describe('repeated expressions', () => {
    let viewModel;
    let view;
    let binding;
    let targetAccessor;
    let observer1;
    let observer2;

    beforeAll(() => {
      reset();
      viewModel = { foo: 'foo' };
      view = createElement('<test foo=" ${foo} hello ${foo} world ${foo} "></test>');
      binding = getBinding(viewModel, view, 'foo');
      targetAccessor = binding.targetAccessor;
      observer1 = observerLocator.getArrayObserver(array1);
      observer2 = observerLocator.getArrayObserver(array2);
    });

    it('binds', () => {
      binding.bind(createScopeForTest(viewModel));
      expect(targetAccessor.getValue(view, 'foo')).toBe(' foo hello foo world foo ');
    });

    it('handles changes', done => {
      let next = () => {
        let test = tests.splice(0, 1)[0];
        let result;
        if (test) {
          test.change(viewModel, 'foo');
          result = test.result();
          setTimeout(() => {
            expect(targetAccessor.getValue(view, 'foo')).toBe(' ' + result + ' hello ' + result + ' world ' + result + ' ');
            next();
          }, checkDelay);
        } else {
          done();
        }
      };

      next();
    });

    it('unbinds', () => {
      expect(observer1.hasSubscribers()).toBe(true);
      expect(observer2.hasSubscribers()).toBe(false);

      binding.unbind();

      expect(observer1.hasSubscribers()).toBe(false);
      expect(binding.source).toBe(null);
    });
  });
});
