import './setup';
import {
  ViewCompiler,
  BindingLanguage,
  HtmlBehaviorResource,
  BindableProperty
} from 'aurelia-templating';
import {BindingExpression, CallExpression, bindingMode} from 'aurelia-binding';
import {Container} from 'aurelia-dependency-injection';
import {TemplatingBindingLanguage} from '../src/binding-language';

describe('Custom Attribute', () => {
  let viewCompiler;
  let container;

  let setupCommonCustomAttributeTest = function(attrRootName, attrSpecification, attrValue ) {
      const behavior = new HtmlBehaviorResource();
      behavior.attributeName = attrRootName;
      behavior.properties.push(new BindableProperty({ name: 'foo' }));
      behavior.properties.push(new BindableProperty({ name: 'bar', primaryProperty: true }));
      behavior.initialize(container, function() { this.foo = "fooValue"; this.bar = "barValue"; });

      return setupSpecificCustomAttributeTest(behavior, attrRootName, attrSpecification, attrValue);
    }  


  let setupSpecificCustomAttributeTest = function(behavior /* HtmlBehaviorResource */, attrRootName, attrSpecification, attrValue) {

      viewCompiler.resources.registerAttribute(attrRootName, behavior, attrRootName);
      
      const template = document.createElement('template');
      const div = document.createElement('div');
      template.appendChild(div);

      div.setAttribute(attrSpecification, attrValue);

      let configurePropertiesSpy = spyOn(viewCompiler, '_configureProperties').and.callThrough();

      viewCompiler._compileElement(div, viewCompiler.resources, template);

      return (configurePropertiesSpy.calls.count() === 1) ? configurePropertiesSpy.calls.argsFor(0)[0] : null;
    }

  beforeAll(() => {
    container = new Container();
    container.registerSingleton(BindingLanguage, TemplatingBindingLanguage);
    container.registerAlias(BindingLanguage, TemplatingBindingLanguage);

    viewCompiler = container.get(ViewCompiler);
  });

  describe('With Options', () => {
    it('detects when unbound options are given', () => {
      const attrName = 'custom-options-attribute-1';
      const instruction = setupCommonCustomAttributeTest(attrName, attrName, 'foo:fooValue;bar:barValue');
      expect().not.toBeNull();
      expect(instruction.attributes.foo).toBe('fooValue');
      expect(instruction.attributes.bar).toBe('barValue');
    });

    it('detects when bound options are given', () => {
      const attrName = 'custom-options-attribute-2';
      const instruction = setupCommonCustomAttributeTest(attrName, attrName, 'foo.bind:fooProperty;bar:barValue');
      expect().not.toBeNull();
      expect(instruction.attributes.bar).toBe('barValue');
      expect(instruction.attributes.foo instanceof BindingExpression).toBeTruthy();
      expect(instruction.attributes.foo.targetProperty).toBe('foo');
      expect(instruction.attributes.foo.sourceExpression.name).toBe('fooProperty');
    });

    it('detects that unbound default but named option is given', () => {
      const attrName = 'custom-options-attribute-3';
      const instruction = setupCommonCustomAttributeTest(attrName, attrName, 'bar:barValue');
      expect().not.toBeNull();
      expect(instruction.attributes.bar).toBe('barValue');
    });

    it('detects that bound default but named option is given', () => {
      const attrName = 'custom-options-attribute-4';
      const instruction = setupCommonCustomAttributeTest(attrName, attrName, 'bar.bind:barProperty');
      expect().not.toBeNull();
      expect(instruction.attributes.bar instanceof BindingExpression).toBeTruthy();
      expect(instruction.attributes.bar.targetProperty).toBe('bar');
      expect(instruction.attributes.bar.sourceExpression.name).toBe('barProperty');
    });

    it('detects that unbound default option is given', () => {
      const attrName = 'custom-options-attribute-5';
      const instruction = setupCommonCustomAttributeTest(attrName, attrName, 'barValue');
      expect().not.toBeNull();
      expect(instruction.attributes.bar).toBe('barValue');
    });

    it('detects that default option is given to bind', () => {
      const attrName = 'custom-options-attribute-6';
      const instruction = setupCommonCustomAttributeTest(attrName, attrName + '.bind', 'barProperty');
      expect().not.toBeNull();
      expect(instruction.attributes.bar instanceof BindingExpression).toBeTruthy();
      expect(instruction.attributes.bar.targetProperty).toBe('bar');
      expect(instruction.attributes.bar.sourceExpression.name).toBe('barProperty');
    });

    it('detects that default option is given to call', () => {
      const attrName = 'custom-options-attribute-7';
      const instruction = setupCommonCustomAttributeTest(attrName, attrName + '.call', 'barCall()');
      expect().not.toBeNull();
      expect(instruction.attributes.bar instanceof CallExpression).toBeTruthy();
      expect(instruction.attributes.bar.targetProperty).toBe('bar');
      expect(instruction.attributes.bar.sourceExpression.name).toBe('barCall');
    });

    /* use default binding of primary property */
    it('the default binding mode on the default option is used in absence of default binding mode on attribute', () => {
        const attrName = 'options-attribute-twoway-default-1';

        const behavior = new HtmlBehaviorResource();
        behavior.attributeName = attrName;
        behavior.properties.push(new BindableProperty({ name: 'foo', primaryProperty: true, defaultBindingMode: bindingMode.twoWay }));

        behavior.initialize(container, function() { return { foo: "viewModelValueForFoo" } });

        let instruction = setupSpecificCustomAttributeTest(behavior, attrName, attrName + ".bind", "initialValueForFoo");

        expect(instruction).not.toBeNull();
        expect(instruction.attributes['foo'] instanceof BindingExpression).toBeTruthy();
        expect(instruction.attributes['foo'].targetProperty).toBe('foo');
        expect(instruction.attributes['foo'].mode).toBe(bindingMode.twoWay);
    });

    it('the default binding mode on the default option overrides the specified default binding mode on the attribute', () => {
        const attrName = 'options-attribute-twoway-default-2';

        const behavior = new HtmlBehaviorResource();
        behavior.attributeName = attrName;
        behavior.properties.push(new BindableProperty({ name: 'foo', primaryProperty: true, defaultBindingMode: bindingMode.twoWay }));
        behavior.attributeDefaultBindingMode = bindingMode.oneWay;

        behavior.initialize(container, function() { return { foo: "viewModelValueForFoo" } });

        let instruction = setupSpecificCustomAttributeTest(behavior, attrName, attrName + ".bind", "initialValueForFoo");

        expect(instruction).not.toBeNull();
        expect(instruction.attributes['foo'] instanceof BindingExpression).toBeTruthy();
        expect(instruction.attributes['foo'].targetProperty).toBe('foo');
        expect(instruction.attributes['foo'].mode).toBe(bindingMode.twoWay);
    });

    it('the unspecified default binding mode on the default option does not take on the attribute-level default binding mode', () => {
        const attrName = 'options-attribute-twoway-default-3';

        const behavior = new HtmlBehaviorResource();
        behavior.attributeName = attrName;
        behavior.properties.push(new BindableProperty({ name: 'foo', primaryProperty: true }));
        behavior.attributeDefaultBindingMode = bindingMode.twoWay;

        behavior.initialize(container, function() { return { foo: "viewModelValueForFoo" } });

        let instruction = setupSpecificCustomAttributeTest(behavior, attrName, attrName + ".bind", "initialValueForFoo");

        expect(instruction).not.toBeNull();
        expect(instruction.attributes['foo'] instanceof BindingExpression).toBeTruthy();
        expect(instruction.attributes['foo'].targetProperty).toBe('foo');
        expect(instruction.attributes['foo'].mode).toBe(bindingMode.oneWay);
    });

    /* named options */
    it('the unspecified default binding mode on the named default option does not take on the value of the default binding on the attribute', () => {
        const attrName = 'options-attribute-twoway-default-4';

        const behavior = new HtmlBehaviorResource();
        behavior.attributeName = attrName;
        behavior.properties.push(new BindableProperty({ name: 'foo', primaryProperty: true }));
        behavior.attributeDefaultBindingMode = bindingMode.twoWay;

        behavior.initialize(container, function() { return { foo: "viewModelValueForFoo" } });

        let instruction = setupSpecificCustomAttributeTest(behavior, attrName, attrName, "foo.bind:initialValueForFoo");

        expect(instruction).not.toBeNull();
        expect(instruction.attributes['foo'] instanceof BindingExpression).toBeTruthy();
        expect(instruction.attributes['foo'].targetProperty).toBe('foo');
        expect(instruction.attributes['foo'].mode).toBe(bindingMode.oneWay);
    });

    /* end: use default binding of primary property */
    
  });
});
