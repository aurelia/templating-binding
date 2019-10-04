import './setup';
import { createScopeForTest, EventManager, Parser } from 'aurelia-binding';
import { DOM } from 'aurelia-pal';
import { TaskQueue } from 'aurelia-task-queue';
import { ViewResources } from 'aurelia-templating';
import { AttributeMap } from '../src/attribute-map';
import { TemplatingBindingLanguage } from '../src/binding-language';
import { SyntaxInterpreter } from '../src/syntax-interpreter';
import * as AureliaBinding from 'aurelia-binding';
import { InterpolationBinding, ChildInterpolationBinding } from '../src/interpolation-binding-expression';

const { DirtyChecker, ObserverLocator, SVGAnalyzer } = AureliaBinding as any;


function createElement(html) {
  let div = DOM.createElement('div');
  div.innerHTML = html;
  return div.firstChild;
}

describe('InterpolationBinding', () => {

  let checkDelay = 40,
      parser, eventManager, dirtyChecker, observerLocator, syntaxInterpreter, language, resources;

  beforeAll(() => {
    eventManager = new EventManager();
    dirtyChecker = new DirtyChecker();
    dirtyChecker.checkDelay = checkDelay / 2;
    observerLocator = new ObserverLocator(new TaskQueue(), eventManager, dirtyChecker, []);
    parser = new Parser();
    let attributeMap = new AttributeMap(new SVGAnalyzer());
    syntaxInterpreter = new SyntaxInterpreter(parser, observerLocator, eventManager, attributeMap);
    language = new TemplatingBindingLanguage(parser, observerLocator, syntaxInterpreter, attributeMap);
    resources = new ViewResources();
  });

  function getBinding(model, view, attrName) {
    let attrValue, info, binding;
    attrValue = view.getAttribute(attrName);
    info = language.inspectAttribute(resources, view.tagName, attrName, attrValue);
    binding = info.expression.createBinding(view);
    return binding;
  }

  function prepareTestData() {
    const array1: any[] = [1, 2, 3];
    const array2: any[] = ['a', 'b', 'c'];
    const tests = [
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
      { change: (m, p) => m[p] = array1,       result: () => array1.toString() }
    ];

    return [array1, array2, tests];
  }

  describe('single expression', () => {
    const [array1, array2, tests] = prepareTestData();
    let viewModel, view, binding, targetAccessor, observer1, observer2;

    beforeEach(() => {
      prepareTestData();
      viewModel = { foo: [1, 2] };
      view = createElement('<test foo="${foo}"></test>');
      binding = getBinding(viewModel, view, 'foo');
      targetAccessor = binding.targetAccessor;
      observer1 = observerLocator.getArrayObserver(array1);
      observer2 = observerLocator.getArrayObserver(array2);
    });

    // it('binds', () => {
    //   binding.bind(createScopeForTest(viewModel));
    //   expect(targetAccessor.getValue(view, 'foo')).toBe(viewModel.foo.toString());
    // });

    it('handles changes', done => {
      binding.bind(createScopeForTest(viewModel));
      let next = () => {
        let test = tests.splice(0, 1)[0];
        let result;
        if (test) {
          test.change(viewModel, 'foo');
          result = test.result();
          window.setTimeout(() => {
            expect(targetAccessor.getValue(view, 'foo')).toBe(result, `${test}.foo === ${result}`);
            next();
          }, checkDelay);
        } else {
          binding.unbind();
          done();
        }
      };

      next();
    });

    it('unbinds', async () => {
      viewModel.foo = array1;
      binding.bind(createScopeForTest(viewModel));
      expect(binding instanceof ChildInterpolationBinding).toBe(true, 'binding is ChildInterpolationBinding');
      expect(targetAccessor.getValue(view, 'foo')).toBe(viewModel.foo.toString());

      expect(observer1.hasSubscribers()).toBe(true, 'array1.hasSubscribers === true');
      expect(observer2.hasSubscribers()).toBe(false, 'array2.hasSubscribers === false');

      binding.unbind();

      expect(observer1.hasSubscribers()).toBe(false, 'array1.hasSubscribers === false');
      expect(binding.source).toBe(null);
    });
  });

  describe('multiple expressions', () => {
    const [array1, array2, tests] = prepareTestData();
    let viewModel, view, binding, targetAccessor, observer1, observer2;

    beforeAll(() => {
      prepareTestData();
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
          window.setTimeout(() => {
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
    const [array1, array2, tests] = prepareTestData();
    let viewModel, view, binding, targetAccessor, observer1, observer2;

    beforeAll(() => {
      prepareTestData();
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
          window.setTimeout(() => {
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
