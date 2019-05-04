import * as AureliaBinding from 'aurelia-binding';
import { camelCase, SVGAnalyzer } from 'aurelia-binding';

/**
 * A helper class to store configuration information related to attribute to property mapping
 */
export class AttributeMap {

  /**@internal */
  static inject = [(AureliaBinding as any).SVGAnalyzer];

  /**
   * A record storing all configuration for specific elements and their corresponding attribute mapping
   * @internal
   */
  elements: Record<string, Record<string, any>>;

  /**
   * A record storing all configuration for attribute mapping for all elements
   * @internal
   */
  allElements: Record<string, string>;

  /**@internal */
  svg: SVGAnalyzer;

  constructor(svg: any) {
    this.svg = svg;
    this.elements = Object.create(null);
    this.allElements = Object.create(null);

    // for minification friendliness
    let self = this;

    registerUniversalAttrMapping(self, 'accesskey', 'accessKey');
    registerUniversalAttrMapping(self, 'contenteditable', 'contentEditable');
    registerUniversalAttrMapping(self, 'tabindex', 'tabIndex');
    registerUniversalAttrMapping(self, 'textcontent', 'textContent');
    registerUniversalAttrMapping(self, 'innerhtml', 'innerHTML');
    registerUniversalAttrMapping(self, 'scrolltop', 'scrollTop');
    registerUniversalAttrMapping(self, 'scrollleft', 'scrollLeft');
    registerUniversalAttrMapping(self, 'readonly', 'readOnly');

    registerElementAttrMapping(self, 'label', 'for', 'htmlFor');

    registerElementAttrMapping(self, 'img', 'usemap', 'useMap');

    registerElementAttrMapping(self, 'input', 'maxlength', 'maxLength');
    registerElementAttrMapping(self, 'input', 'minlength', 'minLength');
    registerElementAttrMapping(self, 'input', 'formaction', 'formAction');
    registerElementAttrMapping(self, 'input', 'formenctype', 'formEncType');
    registerElementAttrMapping(self, 'input', 'formmethod', 'formMethod');
    registerElementAttrMapping(self, 'input', 'formnovalidate', 'formNoValidate');
    registerElementAttrMapping(self, 'input', 'formtarget', 'formTarget');

    registerElementAttrMapping(self, 'textarea', 'maxlength', 'maxLength');

    registerElementAttrMapping(self, 'td', 'rowspan', 'rowSpan');
    registerElementAttrMapping(self, 'td', 'colspan', 'colSpan');
    registerElementAttrMapping(self, 'th', 'rowspan', 'rowSpan');
    registerElementAttrMapping(self, 'th', 'colspan', 'colSpan');
  }

  /**
   * Maps a specific HTML element attribute to a javascript property.
   */
  register(elementName: string, attributeName: string, propertyName: string) {
    let elementMappings = this.elements;
    elementName = elementName.toLowerCase();
    attributeName = attributeName.toLowerCase();
    const element = elementMappings[elementName] = (elementMappings[elementName] || Object.create(null));
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

const registerUniversalAttrMapping = (attrMap: AttributeMap, attributeName: string, propertyName: string) => {
  attrMap.registerUniversal(attributeName, propertyName);
};

const registerElementAttrMapping = (attrMap: AttributeMap, elementName: string, attributeName: string, propertyName: string) => {
  attrMap.register(elementName, attributeName, propertyName);
};
