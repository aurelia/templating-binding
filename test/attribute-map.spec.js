import {SVGAnalyzer} from 'aurelia-binding';
import {AttributeMap} from '../src/attribute-map';

describe('AttributeMap', () => {
  it('maps attributes', () => {
    let attributeMap = new AttributeMap(new SVGAnalyzer());

    expect(attributeMap.map('foo', 'accesskey')).toBe('accessKey');
    expect(attributeMap.map('div', 'accesskey')).toBe('accessKey');
    expect(attributeMap.map('input', 'accesskey')).toBe('accessKey');

    expect(attributeMap.map('label', 'for')).toBe('htmlFor');
    expect(attributeMap.map('foo', 'for')).toBe('for');

    expect(attributeMap.map('img', 'usemap')).toBe('useMap');

    expect(attributeMap.map('input', 'data-bind')).toBe('data-bind');
    expect(attributeMap.map('input', 'aria-label')).toBe('aria-label');
    expect(attributeMap.map('input', 'foo-bar')).toBe('fooBar');
    expect(attributeMap.map('input', 'foo-bar-baz')).toBe('fooBarBaz');

    expect(attributeMap.map('svg', 'viewBox')).toBe('viewBox');
    expect(attributeMap.map('svg', 'stroke-width')).toBe('stroke-width');

    expect(attributeMap.map('textarea', 'maxlength')).toBe('maxLength');
  });
});
