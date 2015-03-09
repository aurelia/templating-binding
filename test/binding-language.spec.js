import {
  TemplatingBindingLanguage,
  InterpolationBindingExpression
} from '../src/binding-language';
import * as LogManager from 'aurelia-logging';

var logger = LogManager.getLogger('templating-binding');

describe('interpolation binding', () => {
  describe('interpolate', () => {
    var observerLocator, targetProperty, accessScope, parts, myViewModel;

    class ObserverLocator{
        getObserver(target, targetPropert){};
    }

    class AccessScope{
      constructor(name){
        this.name = name;
      };

      evaluate(){}
    }

    class FooProperty{
      setValue(value){
        this.value = value;
      }
    }

    class MyViewModel{
      constructor(){
        this.fooCount;
      }
    }

    function createTarget(){
      var h = document.createElement('div');
      var t = document.createTextNode('');
      h.appendChild(t);
      return t;
    }

    beforeEach(() => {
      observerLocator = new ObserverLocator();
      targetProperty = new FooProperty();
      myViewModel = new MyViewModel
      accessScope = new AccessScope('fooCount');
      parts = ['', accessScope];

      spyOn(observerLocator, 'getObserver').and.returnValue(targetProperty);
    });

    it('interpolates undefined to empty string', ()=> {

      myViewModel.fooCount = undefined;

      spyOn(accessScope, 'evaluate').and.returnValue(myViewModel.fooCount);

      var interpolationBindingExpression = new InterpolationBindingExpression(observerLocator, targetProperty, parts);
      var interpolationBinding = interpolationBindingExpression.createBinding(createTarget());
      interpolationBinding.bind(myViewModel);

      expect(targetProperty.value).toBe('');
    });

    it('interpolates null to empty string', ()=> {

      myViewModel.fooCount = null;

      spyOn(accessScope, 'evaluate').and.returnValue(myViewModel.fooCount);

      var interpolationBindingExpression = new InterpolationBindingExpression(observerLocator, targetProperty, parts);
      var interpolationBinding = interpolationBindingExpression.createBinding(createTarget());
      interpolationBinding.bind(myViewModel);

      expect(targetProperty.value).toBe('');
    });

    it('interpolates number 0 to string', ()=> {

      myViewModel.fooCount = 0;

      spyOn(accessScope, 'evaluate').and.returnValue(myViewModel.fooCount);

      var interpolationBindingExpression = new InterpolationBindingExpression(observerLocator, targetProperty, parts);
      var interpolationBinding = interpolationBindingExpression.createBinding(createTarget());
      interpolationBinding.bind(myViewModel);

      expect(targetProperty.value).toBe('0');
    });

    it('can interpolate string to string', ()=> {

      myViewModel.fooCount = "Martin";

      spyOn(accessScope, 'evaluate').and.returnValue(myViewModel.fooCount);

      var interpolationBindingExpression = new InterpolationBindingExpression(observerLocator, targetProperty, parts);
      var interpolationBinding = interpolationBindingExpression.createBinding(createTarget());
      interpolationBinding.bind(myViewModel);

      expect(targetProperty.value).toBe('Martin');
    });
  });
});

describe('TemplatingBindingLanguage', () => {
  describe('parseContent', () => {
    var language, resources;
    beforeAll(() => {
      var parser = { parse: expression => '!' + expression },
          observerLocator = { getObserver: () => null },
          syntaxInterpreter = {};
      language = new TemplatingBindingLanguage(parser, observerLocator, syntaxInterpreter);
      resources = { valueConverterLookupFunction: () => null };
    });

    it('parses interpolation expressions', () => {
      var i, ii, aggregate, test, tests = [
        { attrValue: '${name}', parts: ['', '!name', ''] },
        { attrValue: '${\'foo\\\'\'}', parts: ['', '!\'foo\\\'\'', ''] },
        { attrValue: '${name}', parts: ['', '!name', ''] },
        { attrValue: '${\'name\'}', parts: ['', '!\'name\'', ''] },
        { attrValue: '${\'name\\\'\'}', parts: ['', '!\'name\\\'\'', ''] },
        { attrValue: '${"name"}', parts: ['', '!"name"', ''] },
        { attrValue: '${"name\\\""}', parts: ['', '!"name\\\""', ''] },
        { attrValue: '\\${name}', parts: ['${name}', '!\'\'', ''] },
        { attrValue: '\\\\${"name"}', parts: ['\\\\', '!"name"', ''] },
        { attrValue: 'foo${name}baz', parts: ['foo', '!name', 'baz'] },
        { attrValue: ' ${name} ', parts: [' ', '!name', ' '] },
        { attrValue: '\'${name}\'', parts: ['\'', '!name', '\''] },
        { attrValue: '"${name}"', parts: ['"', '!name', '"'] },
        { attrValue: 'foo bar baz', parts: null },
        { attrValue: '${foo.bar.baz}', parts: ['', '!foo.bar.baz', ''] },
        { attrValue: '${ name }', parts: ['', '! name ', ''] },
        { attrValue: '${name | foo}', parts: ['', '!name | foo', ''] },
        { attrValue: '${name | foo:bar}', parts: ['', '!name | foo:bar', ''] },
        { attrValue: '${name|test:{}}', parts: ['', '!name|test:{}', ''] },
        { attrValue: '${name|test:\'{}\'}', parts: ['', '!name|test:\'{}\'', ''] },
        { attrValue: '${name | test: { foo: 4, bar, 9 } }', parts: ['', '!name | test: { foo: 4, bar, 9 } ', ''] },
        { attrValue: 'foo ${name | test: { foo: 4, bar, 9 } } bar', parts: ['foo ', '!name | test: { foo: 4, bar, 9 } ', ' bar'] },
        { attrValue: '${firstName}${lastName}', parts: ['', '!firstName', '', '!lastName', ''] },
        { attrValue: ' ${firstName} ${lastName} ', parts: [' ', '!firstName', ' ', '!lastName', ' '] },
        { attrValue: '\\ ${foo}\\', parts: ['\\ ', '!foo', '\\'] },
      ];

      aggregate = { attrValue: '', parts: [''] };

      for (i = 0, ii = tests.length; i < ii; i++) {
        test = tests[i];
        if (test.parts) {
          expect(language.parseContent(resources, 'textContent', test.attrValue).parts).toEqual(test.parts);
          aggregate.attrValue += test.attrValue;
          aggregate.parts[aggregate.parts.length - 1] += test.parts[0];
          aggregate.parts = aggregate.parts.concat(test.parts.slice(1));
        } else {
          expect(language.parseContent(resources, 'textContent', test.attrValue)).toBe(null);
          aggregate.attrValue += test.attrValue;
          aggregate.parts[aggregate.parts.length - 1] += test.attrValue;
        }
        expect(language.parseContent(resources, 'textContent', aggregate.attrValue).parts).toEqual(aggregate.parts);
      }
    });

    it('warns on interpolation in style attribute', () => {
      var expression = language.parseContent(resources, 'style', "${name}"),
          binding;
      spyOn(logger, 'info').and.callThrough();
      binding = expression.createBinding();
      expect(logger.info).toHaveBeenCalled();
    });
  });
});
