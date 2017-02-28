import {camelCase, SVGAnalyzer} from 'aurelia-binding';

export class AttributeMap {
  static inject = [SVGAnalyzer];

  elements = Object.create(null);
  allElements = Object.create(null);

  constructor(svg) {
    this.svg = svg;

    // RegisterUniversal() and register() do .toLowerCase() the attributes,
    // which is why we can pass the same name for both parameters.
    ['accessKey', 'contentEditable', 'tabIndex', 'textContent', 'innerHTML', 'scrollTop', 'scrollLeft', 'readOnly']
    .forEach(n => this.registerUniversal(n, n));

    this.register('label', 'for', 'htmlFor');
    this.register('img', 'usemap', 'useMap');
    this.register('textarea', 'maxlength', 'maxLength');

    ['maxLength', 'minLength', 'formAction', 'formEncType', 'formMethod', 'formNoValidate', 'formTarget']
    .forEach(n => this.register('input', n, n));

    
    ['rowSpan', 'colSpan']
    .forEach(n => {
      this.register('td', n, n);
      this.register('th', n, n);
    });    
  }

  /**
   * Maps a specific HTML element attribute to a javascript property.
   */
  register(elementName, attributeName, propertyName) {
    const elements = this.elements;
    let element = elements[elementName];

    if (!element) {
      elementName = elementName.toLowerCase();
      element = elements[elementName] || (elements[elementName] = Object.create(null));
    }
    
    element[attributeName.toLowerCase()] = propertyName;
  }

  /**
   * Maps an HTML attribute to a javascript property.
   */
  registerUniversal(attributeName, propertyName) {
    attributeName = attributeName.toLowerCase();
    this.allElements[attributeName] = propertyName;
  }

  /**
   * Returns the javascript property name for a particlar HTML attribute.
   */
  map(elementName, attributeName) {
    if (this.svg.isStandardSvgAttribute(elementName, attributeName)) {
      return attributeName;
    }
    elementName = elementName.toLowerCase();
    attributeName = attributeName.toLowerCase();
    const element = this.elements[elementName];
    if (element !== undefined && attributeName in element) {
      return element[attributeName];
    }
    if (attributeName in this.allElements) {
      return this.allElements[attributeName];
    }
    // do not camel case data-*, aria-*, or attributes with : in the name.
    if (/(?:^data-)|(?:^aria-)|:/.test(attributeName)) {
      return attributeName;
    }
    return camelCase(attributeName);
  }
}
