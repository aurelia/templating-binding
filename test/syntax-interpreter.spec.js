import './setup';
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

export function createElement(html) {
  var div = DOM.createElement('div');
  div.innerHTML = html;
  return div.firstChild;
}

describe('SyntaxInterpreter', () => {
  describe('determineDefaultBindingMode', () => {
    var interpreter;

    beforeAll(() => {
      interpreter = new SyntaxInterpreter(new Parser(), new ObserverLocator(), new EventManager());
    });

    it('handles checkbox input', () => {
      var el = createElement('<input type="checkbox">');
      expect(interpreter.determineDefaultBindingMode(el, 'value')).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'checked')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);
    });

    it('handles radio input', () => {
      var el = createElement('<input type="radio">');
      expect(interpreter.determineDefaultBindingMode(el, 'value')).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'checked')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);
    });

    it('handles file input', () => {
      var el = createElement('<input type="file">');
      expect(interpreter.determineDefaultBindingMode(el, 'files')).toBe(bindingMode.twoWay);
    });

    it('handles unspecified input', () => {
      var el = createElement('<input>');
      expect(interpreter.determineDefaultBindingMode(el, 'value')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'checked')).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);

      var el = createElement('<input type="file">');
      expect(interpreter.determineDefaultBindingMode(el, 'files')).toBe(bindingMode.twoWay);
    });

    it('handles textarea', () => {
      var el = createElement('<textarea></textarea>');
      expect(interpreter.determineDefaultBindingMode(el, 'value')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);
    });

    it('handles textarea', () => {
      var el = createElement('<select></select>');
      expect(interpreter.determineDefaultBindingMode(el, 'value')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);
    });

    it('handles contenteditable="true"', () => {
      var el = createElement('<div contenteditable="true"></div>');
      expect(interpreter.determineDefaultBindingMode(el, 'textcontent')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'innerhtml')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);
    });

    it('handles contenteditable="false"', () => {
      var el = createElement('<div contenteditable="false"></div>');
      expect(interpreter.determineDefaultBindingMode(el, 'textcontent')).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'innerhtml')).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);
    });

    it('handles inherited contenteditable', () => {
      var el = createElement('<div></div>');
      expect(interpreter.determineDefaultBindingMode(el, 'textcontent')).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'innerhtml')).toBe(bindingMode.oneWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);
    });

    it('handles scrolltop/scrollleft', () => {
      var el = createElement('<div></div>');
      expect(interpreter.determineDefaultBindingMode(el, 'scrolltop')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'scrollleft')).toBe(bindingMode.twoWay);
    });

    it('uses specified defaultBindingMode', () => {
      var el = createElement('<div></div>');
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
  });

  describe('for', () => {
    var interpreter, info;

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
      var instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.local).toBe('foo');
    });

    it('parses Array syntax with access-keyed', () => {
      info.attrValue = 'foo of $parent.items[key]';
      var instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.local).toBe('foo');
    });

    it('parses destructuring syntax', () => {
      info.attrValue = '[foo, bar] of items';
      var instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.key).toBe('foo');
      expect(instruction.attributes.value).toBe('bar');
    });

    it('parses destructuring syntax without space after comma separator', () => {
      info.attrValue = '[foo,bar] of items';
      var instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.key).toBe('foo');
      expect(instruction.attributes.value).toBe('bar');
    });

    it('parses destructuring syntax with space inside brackets', () => {
      info.attrValue = '[ foo, bar ] of items';
      var instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.key).toBe('foo');
      expect(instruction.attributes.value).toBe('bar');
    });

    it('parses destructuring syntax with space before bracket', () => {
      info.attrValue = ' [foo, bar] of items';
      var instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.key).toBe('foo');
      expect(instruction.attributes.value).toBe('bar');
    });

    it('parses destructuring syntax without comma separator', () => {
      info.attrValue = '[foo bar] of items';
      var instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.key).toBe('foo');
      expect(instruction.attributes.value).toBe('bar');
    });

    it('parses destructuring syntax without space before of', () => {
      info.attrValue = '[foo, bar]of items';
      var instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.key).toBe('foo');
      expect(instruction.attributes.value).toBe('bar');
    });

    it('takes first two from destructuring array', () => {
      info.attrValue = '[foo, bar, baz] of items';
      var instruction = interpreter.for({}, null, info, null);
      expect(instruction.attributes.key).toBe('foo');
      expect(instruction.attributes.value).toBe('bar');
    });
  });

  describe('options attributes', () => {
    var interpreter, info;

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
      var instruction = interpreter.options({}, null, info, null);
      expect(instruction.attributes['foo']).toBe("'bar;'");
    });

    it('handles an escaped single quote inside a string of an options attribute', () => {
      info.attrValue = "foo: 'bar\\'';";
      var instruction = interpreter.options({}, null, info, null);
      expect(instruction.attributes['foo']).toBe("'bar\\''");
    });

    it('handles an escaped single quote and a semicolon inside a string of an options attribute', () => {
      info.attrValue = "foo: 'bar\\';';";
      var instruction = interpreter.options({}, null, info, null);
      expect(instruction.attributes['foo']).toBe("'bar\\';'");
    });

    it('handles multiple properties', () => {
      info.attrValue = "foo: 'bar;'; abc.bind: xyz; hello: ${world}; optimus: ${prime ? 'decepticon;' : ';'} test";
      var instruction = interpreter.options({}, null, info, null);
      expect(instruction.attributes['foo']).toBe("'bar;'");
      expect(instruction.attributes['abc.bind']).toBe("xyz");
      expect(instruction.attributes['hello']).toBe("${world}");
      expect(instruction.attributes['optimus']).toBe("${prime ? 'decepticon;' : ';'} test");
    });
  });
});
