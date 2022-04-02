import {camelCase, SVGAnalyzer} from 'aurelia-binding';

/** @internal */
declare module 'aurelia-binding' {
  export class SVGAnalyzer {}
}

export class AttributeMap {
  /** @internal */
  static inject = [SVGAnalyzer];

  elements = Object.create(null);
  allElements = Object.create(null);

  /** @internal */
  svg: SVGAnalyzer;

  constructor(svg: SVGAnalyzer) {
    this.svg = svg;

    this.registerUniversal('accesskey', 'accessKey');
    this.registerUniversal('contenteditable', 'contentEditable');
    this.registerUniversal('tabindex', 'tabIndex');
    this.registerUniversal('textcontent', 'textContent');
    this.registerUniversal('innerhtml', 'innerHTML');
    this.registerUniversal('scrolltop', 'scrollTop');
    this.registerUniversal('scrollleft', 'scrollLeft');
    this.registerUniversal('readonly', 'readOnly');

    this.register('label', 'for', 'htmlFor');

    this.register('img', 'usemap', 'useMap');

    this.register('input', 'maxlength', 'maxLength');
    this.register('input', 'minlength', 'minLength');
    this.register('input', 'formaction', 'formAction');
    this.register('input', 'formenctype', 'formEncType');
    this.register('input', 'formmethod', 'formMethod');
    this.register('input', 'formnovalidate', 'formNoValidate');
    this.register('input', 'formtarget', 'formTarget');

    this.register('textarea', 'maxlength', 'maxLength');

    this.register('td', 'rowspan', 'rowSpan');
    this.register('td', 'colspan', 'colSpan');
    this.register('th', 'rowspan', 'rowSpan');
    this.register('th', 'colspan', 'colSpan');
  }

  /**
   * Maps a specific HTML element attribute to a javascript property.
   */
  register(elementName: string, attributeName: string, propertyName: string) {
    elementName = elementName.toLowerCase();
    attributeName = attributeName.toLowerCase();
    const element = this.elements[elementName] = (this.elements[elementName] || Object.create(null));
    element[attributeName] = propertyName;
  }

  /**
   * Maps an HTML attribute to a javascript property.
   */
  registerUniversal(attributeName: string, propertyName: string) {
    attributeName = attributeName.toLowerCase();
    this.allElements[attributeName] = propertyName;
  }

  /**
   * Returns the javascript property name for a particlar HTML attribute.
   */
  map(elementName: string, attributeName: string) {
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
