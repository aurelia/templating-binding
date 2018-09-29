import './setup';
import {TemplatingBindingLanguage} from '../src/binding-language';
import {Container} from 'aurelia-dependency-injection';
import {NameExpression} from 'aurelia-binding';
import {Logger} from 'aurelia-logging';

import {
  LetExpression,
  Let
} from '../src/let-expression';

import {
  LetInterpolationBindingExpression,
  LetInterpolationBinding
} from '../src/let-interpolation-expression';

describe('BindingLanguage', () => {
  /**@type {TemplatingBindingLanguage} */
  let language;

  beforeEach(() => {
    language = new Container().get(TemplatingBindingLanguage);
  });

  it('handles ref', () => {
    let resources = { lookupFunctions: {} };
    let expression = language.inspectAttribute(resources, 'div', 'ref', 'foo').expression;
    expect(expression instanceof NameExpression).toBe(true);
    expect(expression.lookupFunctions).toBe(resources.lookupFunctions);

    expression = language.inspectAttribute(resources, 'div', 'view-model.ref', 'foo').expression;
    expect(expression instanceof NameExpression).toBe(true);
    expect(expression.lookupFunctions).toBe(resources.lookupFunctions);

    expression = language.inspectAttribute(resources, 'div', 'view.ref', 'foo').expression;
    expect(expression instanceof NameExpression).toBe(true);
    expect(expression.lookupFunctions).toBe(resources.lookupFunctions);

    expression = language.inspectAttribute(resources, 'div', 'controller.ref', 'foo').expression;
    expect(expression instanceof NameExpression).toBe(true);
    expect(expression.lookupFunctions).toBe(resources.lookupFunctions);
  });

  describe('createLetExpressions', () => {
    let resources;

    beforeEach(() => {
      resources = { lookupFunctions: {} };
    });

    it('works with .bind command', () => {
      let el = div();
      el.setAttribute('foo.bind', 'bar');
      const expressions = language.createLetExpressions(resources, el);
      expect(expressions[0] instanceof LetExpression).toBe(true);
    });

    it('warns when binding command is not bind', () => {
      const loggerSpy = spyOn(Logger.prototype, 'warn').and.callThrough();
      let callCount = 0;
      ['one-way', 'two-way', 'one-time', 'from-view'].forEach(cmd => {
        let el = div();
        el.setAttribute(`foo.${cmd}`, 'bar');
        language.createLetExpressions(resources, el);
        expect(loggerSpy.calls.count()).toBe(++callCount, `It should have had been called ${callCount} times`);
      });
    });

    it('works with interpolation', () => {
      let el = div();
      el.setAttribute('foo', '${bar}');
      const expressions = language.createLetExpressions(resources, el);
      expect(expressions.length).toBe(1, 'It should have had 1 instruction');
      expect(expressions[0] instanceof LetInterpolationBindingExpression).toBe(true);
    });

    it('creates correct let expressions', () => {
      let el = div();
      el.setAttribute('foo', 'bar');
      expect(language.createLetExpressions(resources, el)[0] instanceof LetExpression).toBe(true);
    });

    it('understands to-binding-context', () => {
      let el = div();
      el.setAttribute('foo.bind', 'bar');
      el.setAttribute(language.toBindingContextAttr, '');

      const expressions = language.createLetExpressions(resources, el);
      expect(expressions.length).toBe(1, 'It should have not created expression from to-binding-context');
      expect(expressions[0].toBindingContext).toBe(true);
    });

    function div() {
      return document.createElement('div');
    }
  });

});
