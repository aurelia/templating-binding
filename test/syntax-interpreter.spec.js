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

export function createElement(html) {
  var div = document.createElement('div');
  div.innerHTML = html;
  return div.firstChild;
}

describe('SyntaxInterpreter', () => {
  describe('determineDefaultBindingMode', () => {
    var interpreter;

    beforeAll(() => {
      interpreter = new SyntaxInterpreter(new Parser(), new ObserverLocator(), new EventManager());
    });

    it('handles input', () => {
      var el = createElement('<input type="checkbox">');
      expect(interpreter.determineDefaultBindingMode(el, 'value')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'checked')).toBe(bindingMode.twoWay);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(bindingMode.oneWay);
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
  });
});
