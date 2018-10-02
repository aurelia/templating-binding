import {
  ObserverLocator,
  Parser,
  createOverrideContext,
  createScopeForTest
} from 'aurelia-binding';

import {Container} from 'aurelia-dependency-injection';

import {TemplatingBindingLanguage} from '../src/binding-language';
import {
  LetBinding,
  LetExpression
} from '../src/let-expression';
import {
  LetInterpolationBindingExpression,
  LetInterpolationBinding
} from '../src/let-interpolation-expression';
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
      expect(binding instanceof LetBinding).toBe(true);
    });
  });

  describe('Let binding', () => {
    it('binds to overrideContext', done => {
      let vm = { foo: 'bar', baz: { foo: 'baz' } };
      let scope = createScopeForTest(vm);
      let binding = new LetBinding(observerLocator, parser.parse('baz.foo'), 'bar', LookupFunctions);

      binding.bind(scope);

      expect(binding.target).toBe(scope.overrideContext);

      expect(scope.overrideContext.bar).toBe('baz');

      vm.baz.foo = 'bar';
      expect(scope.overrideContext.bar).toBe('baz');

      setTimeout(() => {
        expect(scope.overrideContext.bar).toBe('bar');

        binding.unbind();
        expect(binding.source).toBe(null);

        done();
      }, checkDelay * 2);
    });

    it('binds to bindingContext', done => {
      let vm = { foo: 'bar', baz: { foo: 'baz' } };
      let scope = createScopeForTest(vm);
      let binding = new LetBinding(observerLocator, parser.parse('baz.foo'), 'bar', LookupFunctions, true);

      binding.bind(scope);

      expect(binding.target).toBe(scope.bindingContext);
      expect(binding.target).toBe(vm);

      expect(scope.bindingContext.bar).toBe('baz');

      vm.baz.foo = 'bar';
      expect(scope.bindingContext.bar).toBe('baz');

      setTimeout(() => {
        expect(scope.bindingContext.bar).toBe('bar');

        binding.unbind();
        expect(binding.source).toBe(null);

        done();
      }, checkDelay * 2);
    });
  });

  describe('[interpolation]', () => {
    it('gets created correctly', () => {
      let letInterExpression = new LetInterpolationBindingExpression(observerLocator, 'foo', ['', 'bar', ''], LookupFunctions);
      let letInterBinding = letInterExpression.createBinding();

      expect(letInterBinding instanceof LetInterpolationBinding).toBe(true);
    });

    describe('ChildInterpolationBinding', () => {

      it('binds to overrideContext', done => {
        let vm = { foo: 'bar', baz: { foo: 'baz' } };
        let scope = createScopeForTest(vm);
  
        let binding = new LetInterpolationBinding(observerLocator, 'bar', ['', parser.parse('baz.foo'), ''], LookupFunctions);
        binding.bind(scope);
  
        expect(binding.target).toBe(scope.overrideContext);
        expect(binding.interpolationBinding instanceof ChildInterpolationBinding).toBe(true);

        expect(scope.overrideContext.bar).toBe('baz');
        vm.baz.foo = 'bar';
        expect(scope.overrideContext.bar).toBe('baz');
  
        setTimeout(() => {
          expect(scope.overrideContext.bar).toBe('bar');
  
          binding.unbind();
          expect(binding.interpolationBinding).toBe(null);
          expect(binding.target).toBe(null);
  
          done();
        }, checkDelay * 2);
      });

      it('binds to bindingContext', done => {
        let vm = { foo: 'bar', baz: { foo: 'baz' } };
        let scope = createScopeForTest(vm);
  
        let binding = new LetInterpolationBinding(observerLocator, 'bar', ['', parser.parse('baz.foo'), ''], LookupFunctions, true);
        binding.bind(scope);
  
        expect(binding.target).toBe(scope.bindingContext);
        expect(binding.target).toBe(vm);

        expect(binding.interpolationBinding instanceof ChildInterpolationBinding).toBe(true);
        expect(scope.bindingContext.bar).toBe('baz');
        vm.baz.foo = 'bar';
        expect(scope.bindingContext.bar).toBe('baz');
  
        setTimeout(() => {
          expect(scope.bindingContext.bar).toBe('bar');
  
          binding.unbind();
          expect(binding.interpolationBinding).toBe(null);
          expect(binding.target).toBe(null);
  
          done();
        }, checkDelay * 2);
      });
    });

    describe('InterpolationBinding', () => {
      it('binds to overrideContext', done => {
        let vm = { foo: 'bar', baz: { foo: 'baz' } };
        let scope = createScopeForTest(vm);
        let binding = new LetInterpolationBinding(observerLocator, 'bar', ['foo is: ', parser.parse('foo'), '. And baz.foo is ', parser.parse('baz.foo'), ''], LookupFunctions);
        binding.bind(scope);

        expect(binding.target).toBe(scope.overrideContext);
        expect(binding.interpolationBinding instanceof InterpolationBinding).toBe(true);

        expect(scope.overrideContext.bar).toBe('foo is: bar. And baz.foo is baz');
        vm.foo = 'foo';
        expect(scope.overrideContext.bar).toBe('foo is: bar. And baz.foo is baz');

        setTimeout(() => {
          expect(scope.overrideContext.bar).toBe('foo is: foo. And baz.foo is baz');

          binding.unbind();
          expect(binding.interpolationBinding).toBe(null);

          done();
        }, checkDelay * 2);
      });

      it('binds to bindingContext', done => {
        let vm = { foo: 'bar', baz: { foo: 'baz' } };
        let scope = createScopeForTest(vm);
        let binding = new LetInterpolationBinding(
          observerLocator,
          'bar',
          ['foo is: ', parser.parse('foo'), '. And baz.foo is ', parser.parse('baz.foo'), ''],
          LookupFunctions,
          true
        );
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
});
