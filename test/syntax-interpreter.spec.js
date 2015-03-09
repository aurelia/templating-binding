import {SyntaxInterpreter} from '../src/syntax-interpreter';
import {
  Parser,
  ObserverLocator,
  EventManager,
  ListenerExpression,
  BindingExpression,
  NameExpression,
  CallExpression,
  ONE_WAY,
  TWO_WAY,
  ONE_TIME
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
      expect(interpreter.determineDefaultBindingMode(el, 'value')).toBe(TWO_WAY);
      expect(interpreter.determineDefaultBindingMode(el, 'checked')).toBe(TWO_WAY);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(ONE_WAY);
    });

    it('handles textarea', () => {
      var el = createElement('<textarea></textarea>');
      expect(interpreter.determineDefaultBindingMode(el, 'value')).toBe(TWO_WAY);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(ONE_WAY);
    });

    it('handles textarea', () => {
      var el = createElement('<select></select>');
      expect(interpreter.determineDefaultBindingMode(el, 'value')).toBe(TWO_WAY);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(ONE_WAY);
    });

    it('handles contenteditable="true"', () => {
      var el = createElement('<div contenteditable="true"></div>');
      expect(interpreter.determineDefaultBindingMode(el, 'textcontent')).toBe(TWO_WAY);
      expect(interpreter.determineDefaultBindingMode(el, 'innerhtml')).toBe(TWO_WAY);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(ONE_WAY);
    });

    it('handles contenteditable="false"', () => {
      var el = createElement('<div contenteditable="false"></div>');
      expect(interpreter.determineDefaultBindingMode(el, 'textcontent')).toBe(ONE_WAY);
      expect(interpreter.determineDefaultBindingMode(el, 'innerhtml')).toBe(ONE_WAY);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(ONE_WAY);
    });

    it('handles inherited contenteditable', () => {
      var el = createElement('<div></div>');
      expect(interpreter.determineDefaultBindingMode(el, 'textcontent')).toBe(ONE_WAY);
      expect(interpreter.determineDefaultBindingMode(el, 'innerhtml')).toBe(ONE_WAY);
      expect(interpreter.determineDefaultBindingMode(el, 'foo')).toBe(ONE_WAY);
    });
  });
});
