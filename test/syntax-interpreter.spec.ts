import './setup';
import {AttributeMap} from '../src/attribute-map';
import {SyntaxInterpreter} from '../src/syntax-interpreter';
import {
  Parser,
  ObserverLocator,
  EventManager,
  ListenerExpression,
  BindingExpression,
  NameExpression,
  CallExpression,
  bindingMode
} from 'aurelia-binding';
import {DOM} from 'aurelia-pal';
import {
  ViewResources
} from 'aurelia-templating';

export function createElement(html) {
  let div = DOM.createElement('div');
  div.innerHTML = html;
  return div.firstChild;
}

describe('SyntaxInterpreter', () => {
  describe('determineDefaultBindingMode', () => {
    let interpreter;

    beforeAll(() => {
      interpreter = new SyntaxInterpreter(new Parser(), new ObserverLocator(), new EventManager());
    });

    it('handles checkbox input', () => {
      let el = createElement('<input type="checkbox">');
      expect(interpreter.determineDefaultBindingMode(el, 'value')).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'checked')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);
    });

    it('handles radio input', () => {
      let el = createElement('<input type="radio">');
      expect(interpreter.determineDefaultBindingMode(el, 'value')).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'checked')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);
    });

    it('handles file input', () => {
      let el = createElement('<input type="file">');
      expect(interpreter.determineDefaultBindingMode(el, 'files')).toBe(bindingMode.twoWay);
    });

    it('handles unspecified input', () => {
      let el = createElement('<input>');
      expect(interpreter.determineDefaultBindingMode(el, 'value')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'checked')).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);

      el = createElement('<input type="file">');
      expect(interpreter.determineDefaultBindingMode(el, 'files')).toBe(bindingMode.twoWay);
    });

    it('handles textarea', () => {
      let el = createElement('<textarea></textarea>');
      expect(interpreter.determineDefaultBindingMode(el, 'value')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);
    });

    it('handles textarea', () => {
      let el = createElement('<select></select>');
      expect(interpreter.determineDefaultBindingMode(el, 'value')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);
    });

    it('handles contenteditable="true"', () => {
      let el = createElement('<div contenteditable="true"></div>');
      expect(interpreter.determineDefaultBindingMode(el, 'textcontent')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'innerhtml')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);
    });

    it('handles contenteditable="false"', () => {
      let el = createElement('<div contenteditable="false"></div>');
      expect(interpreter.determineDefaultBindingMode(el, 'textcontent')).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'innerhtml')).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);
    });

    it('handles inherited contenteditable', () => {
      let el = createElement('<div></div>');
      expect(interpreter.determineDefaultBindingMode(el, 'textcontent')).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'innerhtml')).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);
    });

    it('handles scrolltop/scrollleft', () => {
      let el = createElement('<div></div>');
      expect(interpreter.determineDefaultBindingMode(el, 'scrolltop')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'scrollleft')).toBe(bindingMode.twoWay);
    });

    it('uses specified defaultBindingMode', () => {
      let el = createElement('<div></div>');
      let context = {
        attributes: {
          foo: { defaultBindingMode: bindingMode.oneTime },
          bar: { defaultBindingMode: bindingMode.oneWay },
          baz: { defaultBindingMode: bindingMode.twoWay },
          null: null,
          undefined: undefined
        }
      };
      expect(interpreter.determineDefaultBindingMode(el, 'foo', context)).toBe(bindingMode.oneTime);
      expect(interpreter.determineDefaultBindingMode(el, 'bar', context)).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'baz', context)).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'null', context)).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'undefined', context)).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'missing', context)).toBe(bindingMode.oneWay);
    });
    
    it('uses specified defaultBindingMode in `bind` method', () => {
      interpreter.attributeMap = new AttributeMap();
      interpreter.attributeMap.svg = {
        isStandardSvgAttribute: () => false
      }
      let element = document.createElement('input');
      let attrName = 'value';
      let info = {
        attrName: attrName,
        attrValue: 'bar',
        defaultBindingMode: bindingMode.oneTime
      }
      let instruction = interpreter.bind(new ViewResources(), element, info);
      expect(instruction.attributes[attrName].mode).toBe(bindingMode.oneTime);
    });
  });

  describe('for', () => {
    let interpreter, info;

    beforeAll(() => {
      interpreter = new SyntaxInterpreter(new Parser(), new ObserverLocator(), new EventManager());
      info = {
        attrName: 'repeat',
        command: 'for',
        defaultBindingMode: 1
      };
    });

    it('throws on incorrect syntax', () => {
      info.attrValue = 'foo in items';
      expect(function(){interpreter.for({}, null, info, null)}).toThrow();
    });

    it('parses Array syntax', () => {
      info.attrValue = 'foo of items';
      let instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.local).toBe('foo');
    });

    it('parses Array syntax with access-keyed', () => {
      info.attrValue = 'foo of $parent.items[key]';
      let instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.local).toBe('foo');
    });

    it('parses destructuring syntax', () => {
      info.attrValue = '[foo, bar] of items';
      let instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.key).toBe('foo');
      expect(instruction.attributes.value).toBe('bar');
    });

    it('parses destructuring syntax without space after comma separator', () => {
      info.attrValue = '[foo,bar] of items';
      let instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.key).toBe('foo');
      expect(instruction.attributes.value).toBe('bar');
    });

    it('parses destructuring syntax with space inside brackets', () => {
      info.attrValue = '[ foo, bar ] of items';
      let instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.key).toBe('foo');
      expect(instruction.attributes.value).toBe('bar');
    });

    it('parses destructuring syntax with space before bracket', () => {
      info.attrValue = ' [foo, bar] of items';
      let instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.key).toBe('foo');
      expect(instruction.attributes.value).toBe('bar');
    });

    it('parses destructuring syntax without comma separator', () => {
      info.attrValue = '[foo bar] of items';
      let instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.key).toBe('foo');
      expect(instruction.attributes.value).toBe('bar');
    });

    it('parses destructuring syntax without space before of', () => {
      info.attrValue = '[foo, bar]of items';
      let instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.key).toBe('foo');
      expect(instruction.attributes.value).toBe('bar');
    });

    it('takes first two from destructuring array', () => {
      info.attrValue = '[foo, bar, baz] of items';
      let instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.key).toBe('foo');
      expect(instruction.attributes.value).toBe('bar');
    });
  });

  describe('options attributes', () => {
    let interpreter, info;

    beforeAll(() => {
      interpreter = new SyntaxInterpreter(new Parser(), new ObserverLocator(), new EventManager());

      interpreter.language = {
        inspectAttribute(resources, elementName, attrName, attrValue) {
          return {
            attrName: attrName,
            attrValue: attrValue
          };
        },
        createAttributeInstruction() {
          return;
        }
      }

      info = {
        attrName: 'custom',
        command: null,
        defaultBindingMode: 1
      };
    });

    it('handles a semicolon inside a string of an options attribute', () => {
      info.attrValue = "foo: 'bar;';";
      let instruction = interpreter.options({}, null, info, null);
      expect(instruction.attributes['foo']).toBe("'bar;'");
    });

    it('handles an escaped single quote inside a string of an options attribute', () => {
      info.attrValue = "foo: 'bar\\'';";
      let instruction = interpreter.options({}, null, info, null);
      expect(instruction.attributes['foo']).toBe("'bar\\''");
    });

    it('handles an escaped single quote and a semicolon inside a string of an options attribute', () => {
      info.attrValue = "foo: 'bar\\';';";
      let instruction = interpreter.options({}, null, info, null);
      expect(instruction.attributes['foo']).toBe("'bar\\';'");
    });

    it('handles multiple properties', () => {
      info.attrValue = "foo: 'bar;'; abc.bind: xyz; hello: ${world}; optimus: ${prime ? 'decepticon;' : ';'} test";
      let instruction = interpreter.options({}, null, info, null);
      expect(instruction.attributes['foo']).toBe("'bar;'");
      expect(instruction.attributes['abc.bind']).toBe("xyz");
      expect(instruction.attributes['hello']).toBe("${world}");
      expect(instruction.attributes['optimus']).toBe("${prime ? 'decepticon;' : ';'} test");
    });
    /**
     * options with a default
     */
    it('handles single unnamed option with default property', () => {
      let resources = { getAttribute(name) {} };

      info.attrValue = "bar";

      spyOn(resources,'getAttribute').and.returnValue({
        primaryProperty: { attribute: 'foo' }
      });

      let instruction = interpreter.options(resources, null, info, null, { attributeName: 'foo' });
      expect(instruction.attributes['foo']).toBe('bar');
    });

    it('handles single unnamed option with default property and semicolon', () => {
      let resources = { getAttribute(name) {} };

      info.attrValue = "bar;";

      spyOn(resources,'getAttribute').and.returnValue({
        primaryProperty: { attribute: 'foo' }
      });

      let instruction = interpreter.options(resources, null, info, null, { attributeName: 'foo' });
      expect(instruction.attributes['foo']).toBe('bar');
    });

    it('handles single named option with default property and no semicolon', () => {
      let resources = { getAttribute(name) {} };

      info.attrValue = "foo: bar";

      let instruction = interpreter.options(resources, null, info, null, { attributeName: 'foo' });
      expect(instruction.attributes['foo']).toBe('bar');
    });

    it('handles single named option with default property and semicolon', () => {
      let resources = { getAttribute(name) {} };

      info.attrValue = "foo: bar;";

      let instruction = interpreter.options(resources, null, info, null, { attributeName: 'foo' });
      expect(instruction.attributes['foo']).toBe('bar');
    });

    it('handles single non-default named option with default property and no semicolon', () => {
      let resources = { getAttribute(name) {} };

      info.attrValue = "far: boo";

      let instruction = interpreter.options(resources, null, info, null, { attributeName: 'foo' });
      expect(instruction.attributes['far']).toBe('boo');
    });

    it('handles single non-default named option with default property and semicolon', () => {
      let resources = { getAttribute(name) {} };

      info.attrValue = "far: boo;";

      let instruction = interpreter.options(resources, null, info, null, { attributeName: 'foo' });
      expect(instruction.attributes['far']).toBe('boo');
    });
    /**
     * end: options with a default
     */
  });
});
