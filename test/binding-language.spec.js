import './setup';
import {TemplatingBindingLanguage} from '../src/binding-language';
import {Container} from 'aurelia-dependency-injection';
import {NameExpression} from 'aurelia-binding';

describe('BindingLanguage', () => {
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
});
