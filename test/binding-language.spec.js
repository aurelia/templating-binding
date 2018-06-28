import './setup';
import {TemplatingBindingLanguage} from '../src/binding-language';
import {Container} from 'aurelia-dependency-injection';
import {NameExpression} from 'aurelia-binding';

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

  beforeAll(() => {
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

    it('creates correct let expressions', () => {

      let el1 = div();
      el1.setAttribute('foo.bind', 'bar');
      expect(language.createLetExpressions(resources, el1)[0] instanceof LetExpression).toBe(true);

      let el2 = div();
      el2.setAttribute('foo', '${bar}');
      expect(language.createLetExpressions(resources, el2)[0] instanceof LetInterpolationBindingExpression).toBe(true);

      let el3 = div();
      el3.setAttribute('foo', 'bar');
      expect(language.createLetExpressions(resources, el3)[0] instanceof LetExpression).toBe(true);
    });

    function div() {
      return document.createElement('div');
    }
  });

});
