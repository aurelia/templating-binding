import {
  ObserverLocator,
  Parser,
  createOverrideContext,
  createScopeForTest
} from 'aurelia-binding';

import {Container} from 'aurelia-dependency-injection';

import {TemplatingBindingLanguage} from '../src/binding-language';
import {
  Let,
  LetExpression
} from '../src/let-expression';
import {
  LetInterpolationBindingExpression,
  LetInterpolationBinding
} from '../src/let-interpolation-binding-expression';
import {
  InterpolationBinding,
  ChildInterpolationBinding
} from '../src/interpolation-binding-expression';

describe('Let', () => {
  /**@type {ObserverLocator} */
  let observerLocator;
  /**@type {Parser} */
  let parser;
  /**@type {TemplatingBindingLanguage} */
  let language;
  let LookupFunctions = {};
  let checkDelay = 40;

  beforeEach(() => {
    let ct = new Container();
    language = ct.get(TemplatingBindingLanguage);
    observerLocator = ct.get(ObserverLocator);
    parser = ct.get(Parser);
  });

  describe('LetExpression', () => {
    it('creates binding', () => {
      let letExpression = new LetExpression(observerLocator, 'foo', parser.parse('bar'), LookupFunctions);
      let binding = letExpression.createBinding();
      expect(binding instanceof Let).toBe(true);
    });
  });

  describe('Let binding', () => {
    it('binds correctly', done => {
      let vm = { foo: 'bar', baz: { foo: 'baz' } };
      let scope = createScopeForTest(vm);
      let binding = new Let(observerLocator, parser.parse('baz.foo'), 'bar', LookupFunctions);

      binding.bind(scope);

      expect(binding.target).toBe(vm);
      expect(binding.source.bindingContext).toBe(vm);

      expect(vm.bar).toBe('baz');

      vm.baz.foo = 'bar';
      expect(vm.bar).toBe('baz');

      setTimeout(() => {
        expect(vm.bar).toBe('bar');

        binding.unbind();
        expect(binding.source).toBe(null);

        done();
      }, checkDelay * 2);
    });
  });

  describe('LetInterpolationBinding', () => {
    it('gets created correctly', () => {
      let letInterExpression = new LetInterpolationBindingExpression(observerLocator, 'foo', ['', 'bar', ''], LookupFunctions);
      let letInterBinding = letInterExpression.createBinding();

      expect(letInterBinding instanceof LetInterpolationBinding).toBe(true);
    });

    it('binds ChildInterpolationBinding correctly', done => {
      let vm = { foo: 'bar', baz: { foo: 'baz' } };
      let scope = createScopeForTest(vm);

      let binding = new LetInterpolationBinding(observerLocator, 'bar', ['', parser.parse('baz.foo'), ''], LookupFunctions);
      binding.bind(scope);

      expect(binding.target).toBe(vm);
      expect(binding.interpolationBinding instanceof ChildInterpolationBinding).toBe(true);
      expect(vm.bar).toBe('baz');
      vm.baz.foo = 'bar';
      expect(vm.bar).toBe('baz');

      setTimeout(() => {
        expect(vm.bar).toBe('bar');

        binding.unbind();
        expect(binding.interpolationBinding).toBe(null);
        expect(binding.target).toBe(null);

        done();
      }, checkDelay * 2);
    });

    it('binds InterpolationBinding correctly', done => {
      let vm = { foo: 'bar', baz: { foo: 'baz' } };
      let scope = createScopeForTest(vm);
      let binding = new LetInterpolationBinding(observerLocator, 'bar', ['foo is: ', parser.parse('foo'), '. And baz.foo is ', parser.parse('baz.foo'), ''], LookupFunctions);
      binding.bind(scope);

      expect(binding.target).toBe(vm);
      expect(binding.interpolationBinding instanceof InterpolationBinding).toBe(true);
      expect(vm.bar).toBe('foo is: bar. And baz.foo is baz');
      vm.foo = 'foo';
      expect(vm.bar).toBe('foo is: bar. And baz.foo is baz');

      setTimeout(() => {
        expect(vm.bar).toBe('foo is: foo. And baz.foo is baz');

        binding.unbind();
        expect(binding.interpolationBinding).toBe(null);

        done();
      }, checkDelay * 2);
    });
  });
});
