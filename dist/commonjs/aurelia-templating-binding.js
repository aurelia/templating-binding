'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var aureliaTemplating = require('aurelia-templating');
var aureliaBinding = require('aurelia-binding');
var LogManager = require('aurelia-logging');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var LogManager__namespace = /*#__PURE__*/_interopNamespace(LogManager);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

var AttributeMap = (function () {
    function AttributeMap(svg) {
        this.elements = Object.create(null);
        this.allElements = Object.create(null);
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
    AttributeMap.prototype.register = function (elementName, attributeName, propertyName) {
        elementName = elementName.toLowerCase();
        attributeName = attributeName.toLowerCase();
        var element = this.elements[elementName] = (this.elements[elementName] || Object.create(null));
        element[attributeName] = propertyName;
    };
    AttributeMap.prototype.registerUniversal = function (attributeName, propertyName) {
        attributeName = attributeName.toLowerCase();
        this.allElements[attributeName] = propertyName;
    };
    AttributeMap.prototype.map = function (elementName, attributeName) {
        if (this.svg.isStandardSvgAttribute(elementName, attributeName)) {
            return attributeName;
        }
        elementName = elementName.toLowerCase();
        attributeName = attributeName.toLowerCase();
        var element = this.elements[elementName];
        if (element !== undefined && attributeName in element) {
            return element[attributeName];
        }
        if (attributeName in this.allElements) {
            return this.allElements[attributeName];
        }
        if (/(?:^data-)|(?:^aria-)|:/.test(attributeName)) {
            return attributeName;
        }
        return aureliaBinding.camelCase(attributeName);
    };
    AttributeMap.inject = [aureliaBinding.SVGAnalyzer];
    return AttributeMap;
}());

var InterpolationBindingExpression = (function () {
    function InterpolationBindingExpression(observerLocator, targetProperty, parts, mode, lookupFunctions, attribute) {
        this.observerLocator = observerLocator;
        this.targetProperty = targetProperty;
        this.parts = parts;
        this.mode = mode;
        this.lookupFunctions = lookupFunctions;
        this.attribute = this.attrToRemove = attribute;
        this.discrete = false;
    }
    InterpolationBindingExpression.prototype.createBinding = function (target) {
        if (this.parts.length === 3) {
            return new ChildInterpolationBinding(target, this.observerLocator, this.parts[1], this.mode, this.lookupFunctions, this.targetProperty, this.parts[0], this.parts[2]);
        }
        return new InterpolationBinding(this.observerLocator, this.parts, target, this.targetProperty, this.mode, this.lookupFunctions);
    };
    return InterpolationBindingExpression;
}());
function validateTarget(target, propertyName) {
    if (propertyName === 'style') {
        LogManager__namespace.getLogger('templating-binding')
            .info('Internet Explorer does not support interpolation in "style" attributes.  Use the style attribute\'s alias, "css" instead.');
    }
    else if (target.parentElement && target.parentElement.nodeName === 'TEXTAREA' && propertyName === 'textContent') {
        throw new Error('Interpolation binding cannot be used in the content of a textarea element.  Use <textarea value.bind="expression"></textarea> instead.');
    }
}
var InterpolationBinding = (function () {
    function InterpolationBinding(observerLocator, parts, target, targetProperty, mode, lookupFunctions) {
        validateTarget(target, targetProperty);
        this.observerLocator = observerLocator;
        this.parts = parts;
        this.target = target;
        this.targetProperty = targetProperty;
        this.targetAccessor = observerLocator.getAccessor(target, targetProperty);
        this.mode = mode;
        this.lookupFunctions = lookupFunctions;
    }
    InterpolationBinding.prototype.interpolate = function () {
        if (this.isBound) {
            var value = '';
            var parts = this.parts;
            for (var i = 0, ii = parts.length; i < ii; i++) {
                value += (i % 2 === 0 ? parts[i] : this["childBinding".concat(i)].value);
            }
            this.targetAccessor.setValue(value, this.target, this.targetProperty);
        }
    };
    InterpolationBinding.prototype.updateOneTimeBindings = function () {
        for (var i = 1, ii = this.parts.length; i < ii; i += 2) {
            var child = this["childBinding".concat(i)];
            if (child.mode === aureliaBinding.bindingMode.oneTime) {
                child.call();
            }
        }
    };
    InterpolationBinding.prototype.bind = function (source) {
        if (this.isBound) {
            if (this.source === source) {
                return;
            }
            this.unbind();
        }
        this.source = source;
        var parts = this.parts;
        for (var i = 1, ii = parts.length; i < ii; i += 2) {
            var binding = new ChildInterpolationBinding(this, this.observerLocator, parts[i], this.mode, this.lookupFunctions);
            binding.bind(source);
            this["childBinding".concat(i)] = binding;
        }
        this.isBound = true;
        this.interpolate();
    };
    InterpolationBinding.prototype.unbind = function () {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.source = null;
        var parts = this.parts;
        for (var i = 1, ii = parts.length; i < ii; i += 2) {
            var name_1 = "childBinding".concat(i);
            this[name_1].unbind();
        }
    };
    return InterpolationBinding;
}());
var ChildInterpolationBinding = (function () {
    function ChildInterpolationBinding(target, observerLocator, sourceExpression, mode, lookupFunctions, targetProperty, left, right) {
        if (target instanceof InterpolationBinding) {
            this.parent = target;
        }
        else {
            validateTarget(target, targetProperty);
            this.target = target;
            this.targetProperty = targetProperty;
            this.targetAccessor = observerLocator.getAccessor(target, targetProperty);
        }
        this.observerLocator = observerLocator;
        this.sourceExpression = sourceExpression;
        this.mode = mode;
        this.lookupFunctions = lookupFunctions;
        this.left = left;
        this.right = right;
    }
    ChildInterpolationBinding.prototype.updateTarget = function (value) {
        value = value === null || value === undefined ? '' : value.toString();
        if (value !== this.value) {
            this.value = value;
            if (this.parent) {
                this.parent.interpolate();
            }
            else {
                this.targetAccessor.setValue(this.left + value + this.right, this.target, this.targetProperty);
            }
        }
    };
    ChildInterpolationBinding.prototype.call = function () {
        if (!this.isBound) {
            return;
        }
        this.rawValue = this.sourceExpression.evaluate(this.source, this.lookupFunctions);
        this.updateTarget(this.rawValue);
        if (this.mode !== aureliaBinding.bindingMode.oneTime) {
            this._version++;
            this.sourceExpression.connect(this, this.source);
            if (this.rawValue instanceof Array) {
                this.observeArray(this.rawValue);
            }
            this.unobserve(false);
        }
    };
    ChildInterpolationBinding.prototype.bind = function (source) {
        if (this.isBound) {
            if (this.source === source) {
                return;
            }
            this.unbind();
        }
        this.isBound = true;
        this.source = source;
        var sourceExpression = this.sourceExpression;
        if (sourceExpression.bind) {
            sourceExpression.bind(this, source, this.lookupFunctions);
        }
        this.rawValue = sourceExpression.evaluate(source, this.lookupFunctions);
        this.updateTarget(this.rawValue);
        if (this.mode === aureliaBinding.bindingMode.oneWay) {
            aureliaBinding.enqueueBindingConnect(this);
        }
    };
    ChildInterpolationBinding.prototype.unbind = function () {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        var sourceExpression = this.sourceExpression;
        if (sourceExpression.unbind) {
            sourceExpression.unbind(this, this.source);
        }
        this.source = null;
        this.value = null;
        this.rawValue = null;
        this.unobserve(true);
    };
    ChildInterpolationBinding.prototype.connect = function (evaluate) {
        if (!this.isBound) {
            return;
        }
        if (evaluate) {
            this.rawValue = this.sourceExpression.evaluate(this.source, this.lookupFunctions);
            this.updateTarget(this.rawValue);
        }
        this.sourceExpression.connect(this, this.source);
        if (this.rawValue instanceof Array) {
            this.observeArray(this.rawValue);
        }
    };
    ChildInterpolationBinding = __decorate([
        aureliaBinding.connectable()
    ], ChildInterpolationBinding);
    return ChildInterpolationBinding;
}());

var LetExpression = (function () {
    function LetExpression(observerLocator, targetProperty, sourceExpression, lookupFunctions, toBindingContext) {
        this.observerLocator = observerLocator;
        this.sourceExpression = sourceExpression;
        this.targetProperty = targetProperty;
        this.lookupFunctions = lookupFunctions;
        this.toBindingContext = toBindingContext;
    }
    LetExpression.prototype.createBinding = function () {
        return new LetBinding(this.observerLocator, this.sourceExpression, this.targetProperty, this.lookupFunctions, this.toBindingContext);
    };
    return LetExpression;
}());
var LetBinding = (function () {
    function LetBinding(observerLocator, sourceExpression, targetProperty, lookupFunctions, toBindingContext) {
        this.observerLocator = observerLocator;
        this.sourceExpression = sourceExpression;
        this.targetProperty = targetProperty;
        this.lookupFunctions = lookupFunctions;
        this.source = null;
        this.target = null;
        this.toBindingContext = toBindingContext;
    }
    LetBinding.prototype.updateTarget = function () {
        var value = this.sourceExpression.evaluate(this.source, this.lookupFunctions);
        this.target[this.targetProperty] = value;
    };
    LetBinding.prototype.call = function (context) {
        if (!this.isBound) {
            return;
        }
        if (context === aureliaBinding.sourceContext) {
            this.updateTarget();
            return;
        }
        throw new Error("Unexpected call context ".concat(context));
    };
    LetBinding.prototype.bind = function (source) {
        if (this.isBound) {
            if (this.source === source) {
                return;
            }
            this.unbind();
        }
        this.isBound = true;
        this.source = source;
        this.target = this.toBindingContext ? source.bindingContext : source.overrideContext;
        if (this.sourceExpression.bind) {
            this.sourceExpression.bind(this, source, this.lookupFunctions);
        }
        aureliaBinding.enqueueBindingConnect(this);
    };
    LetBinding.prototype.unbind = function () {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        if (this.sourceExpression.unbind) {
            this.sourceExpression.unbind(this, this.source);
        }
        this.source = null;
        this.target = null;
        this.unobserve(true);
    };
    LetBinding.prototype.unobserve = function (arg0) {
        throw new Error('Method not implemented.');
    };
    LetBinding.prototype.connect = function () {
        if (!this.isBound) {
            return;
        }
        this.updateTarget();
        this.sourceExpression.connect(this, this.source);
    };
    LetBinding = __decorate([
        aureliaBinding.connectable()
    ], LetBinding);
    return LetBinding;
}());

var LetInterpolationBindingExpression = (function () {
    function LetInterpolationBindingExpression(observerLocator, targetProperty, parts, lookupFunctions, toBindingContext) {
        this.observerLocator = observerLocator;
        this.targetProperty = targetProperty;
        this.parts = parts;
        this.lookupFunctions = lookupFunctions;
        this.toBindingContext = toBindingContext;
    }
    LetInterpolationBindingExpression.prototype.createBinding = function () {
        return new LetInterpolationBinding(this.observerLocator, this.targetProperty, this.parts, this.lookupFunctions, this.toBindingContext);
    };
    return LetInterpolationBindingExpression;
}());
var LetInterpolationBinding = (function () {
    function LetInterpolationBinding(observerLocator, targetProperty, parts, lookupFunctions, toBindingContext) {
        this.observerLocator = observerLocator;
        this.parts = parts;
        this.targetProperty = targetProperty;
        this.lookupFunctions = lookupFunctions;
        this.toBindingContext = toBindingContext;
        this.target = null;
    }
    LetInterpolationBinding.prototype.bind = function (source) {
        if (this.isBound) {
            if (this.source === source) {
                return;
            }
            this.unbind();
        }
        this.isBound = true;
        this.source = source;
        this.target = this.toBindingContext ? source.bindingContext : source.overrideContext;
        this.interpolationBinding = this.createInterpolationBinding();
        this.interpolationBinding.bind(source);
    };
    LetInterpolationBinding.prototype.unbind = function () {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.source = null;
        this.target = null;
        this.interpolationBinding.unbind();
        this.interpolationBinding = null;
    };
    LetInterpolationBinding.prototype.createInterpolationBinding = function () {
        if (this.parts.length === 3) {
            return new ChildInterpolationBinding(this.target, this.observerLocator, this.parts[1], aureliaBinding.bindingMode.toView, this.lookupFunctions, this.targetProperty, this.parts[0], this.parts[2]);
        }
        return new InterpolationBinding(this.observerLocator, this.parts, this.target, this.targetProperty, aureliaBinding.bindingMode.toView, this.lookupFunctions);
    };
    return LetInterpolationBinding;
}());

var SyntaxInterpreter = (function () {
    function SyntaxInterpreter(parser, observerLocator, eventManager, attributeMap) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.eventManager = eventManager;
        this.attributeMap = attributeMap;
    }
    SyntaxInterpreter.prototype.interpret = function (resources, element, info, existingInstruction, context) {
        if (info.command in this) {
            return this[info.command](resources, element, info, existingInstruction, context);
        }
        return this.handleUnknownCommand(resources, element, info, existingInstruction, context);
    };
    SyntaxInterpreter.prototype.handleUnknownCommand = function (resources, element, info, existingInstruction, context) {
        LogManager__namespace.getLogger('templating-binding').warn('Unknown binding command.', info);
        return existingInstruction;
    };
    SyntaxInterpreter.prototype.determineDefaultBindingMode = function (element, attrName, context) {
        var tagName = element.tagName.toLowerCase();
        if (tagName === 'input' && (attrName === 'value' || attrName === 'files') && element.type !== 'checkbox' && element.type !== 'radio'
            || tagName === 'input' && attrName === 'checked' && (element.type === 'checkbox' || element.type === 'radio')
            || (tagName === 'textarea' || tagName === 'select') && attrName === 'value'
            || (attrName === 'textcontent' || attrName === 'innerhtml') && element.contentEditable === 'true'
            || attrName === 'scrolltop'
            || attrName === 'scrollleft') {
            return aureliaBinding.bindingMode.twoWay;
        }
        if (context
            && attrName in context.attributes
            && context.attributes[attrName]
            && context.attributes[attrName].defaultBindingMode >= aureliaBinding.bindingMode.oneTime) {
            return context.attributes[attrName].defaultBindingMode;
        }
        return aureliaBinding.bindingMode.toView;
    };
    SyntaxInterpreter.prototype.bind = function (resources, element, info, existingInstruction, context) {
        var instruction = existingInstruction || aureliaTemplating.BehaviorInstruction.attribute(info.attrName);
        instruction.attributes[info.attrName] = new aureliaBinding.BindingExpression(this.observerLocator, this.attributeMap.map(element.tagName, info.attrName), this.parser.parse(info.attrValue), info.defaultBindingMode === undefined || info.defaultBindingMode === null
            ? this.determineDefaultBindingMode(element, info.attrName, context)
            : info.defaultBindingMode, resources.lookupFunctions);
        return instruction;
    };
    SyntaxInterpreter.prototype.trigger = function (resources, element, info) {
        return new aureliaBinding.ListenerExpression(this.eventManager, info.attrName, this.parser.parse(info.attrValue), aureliaBinding.delegationStrategy.none, true, resources.lookupFunctions);
    };
    SyntaxInterpreter.prototype.capture = function (resources, element, info) {
        return new aureliaBinding.ListenerExpression(this.eventManager, info.attrName, this.parser.parse(info.attrValue), aureliaBinding.delegationStrategy.capturing, true, resources.lookupFunctions);
    };
    SyntaxInterpreter.prototype.delegate = function (resources, element, info) {
        return new aureliaBinding.ListenerExpression(this.eventManager, info.attrName, this.parser.parse(info.attrValue), aureliaBinding.delegationStrategy.bubbling, true, resources.lookupFunctions);
    };
    SyntaxInterpreter.prototype.call = function (resources, element, info, existingInstruction) {
        var instruction = existingInstruction || aureliaTemplating.BehaviorInstruction.attribute(info.attrName);
        instruction.attributes[info.attrName] = new aureliaBinding.CallExpression(this.observerLocator, info.attrName, this.parser.parse(info.attrValue), resources.lookupFunctions);
        return instruction;
    };
    SyntaxInterpreter.prototype.options = function (resources, element, info, existingInstruction, context) {
        var instruction = existingInstruction || aureliaTemplating.BehaviorInstruction.attribute(info.attrName);
        var attrValue = info.attrValue;
        var language = this.language;
        var name = null;
        var target = '';
        var current;
        var i;
        var ii;
        var inString = false;
        var inEscape = false;
        var foundName = false;
        for (i = 0, ii = attrValue.length; i < ii; ++i) {
            current = attrValue[i];
            if (current === ';' && !inString) {
                if (!foundName) {
                    name = this._getPrimaryPropertyName(resources, context);
                }
                info = language.inspectAttribute(resources, '?', name, target.trim());
                language.createAttributeInstruction(resources, element, info, instruction, context);
                if (!instruction.attributes[info.attrName]) {
                    instruction.attributes[info.attrName] = info.attrValue;
                }
                target = '';
                name = null;
            }
            else if (current === ':' && name === null) {
                foundName = true;
                name = target.trim();
                target = '';
            }
            else if (current === '\\') {
                target += current;
                inEscape = true;
                continue;
            }
            else {
                target += current;
                if (name !== null && inEscape === false && current === '\'') {
                    inString = !inString;
                }
            }
            inEscape = false;
        }
        if (!foundName) {
            name = this._getPrimaryPropertyName(resources, context);
        }
        if (name !== null) {
            info = language.inspectAttribute(resources, '?', name, target.trim());
            language.createAttributeInstruction(resources, element, info, instruction, context);
            if (!instruction.attributes[info.attrName]) {
                instruction.attributes[info.attrName] = info.attrValue;
            }
        }
        return instruction;
    };
    SyntaxInterpreter.prototype._getPrimaryPropertyName = function (resources, context) {
        var type = resources.getAttribute(context.attributeName);
        if (type && type.primaryProperty) {
            return type.primaryProperty.attribute;
        }
        return null;
    };
    SyntaxInterpreter.prototype['for'] = function (resources, element, info, existingInstruction) {
        var parts;
        var keyValue;
        var instruction;
        var attrValue;
        var isDestructuring;
        attrValue = info.attrValue;
        isDestructuring = attrValue.match(/^ *[[].+[\]]/);
        parts = isDestructuring ? attrValue.split('of ') : attrValue.split(' of ');
        if (parts.length !== 2) {
            throw new Error('Incorrect syntax for "for". The form is: "$local of $items" or "[$key, $value] of $items".');
        }
        instruction = existingInstruction || aureliaTemplating.BehaviorInstruction.attribute(info.attrName);
        if (isDestructuring) {
            keyValue = parts[0].replace(/[[\]]/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
            instruction.attributes.key = keyValue[0];
            instruction.attributes.value = keyValue[1];
        }
        else {
            instruction.attributes.local = parts[0];
        }
        instruction.attributes.items = new aureliaBinding.BindingExpression(this.observerLocator, 'items', this.parser.parse(parts[1]), aureliaBinding.bindingMode.toView, resources.lookupFunctions);
        return instruction;
    };
    SyntaxInterpreter.prototype['two-way'] = function (resources, element, info, existingInstruction) {
        var instruction = existingInstruction || aureliaTemplating.BehaviorInstruction.attribute(info.attrName);
        instruction.attributes[info.attrName] = new aureliaBinding.BindingExpression(this.observerLocator, this.attributeMap.map(element.tagName, info.attrName), this.parser.parse(info.attrValue), aureliaBinding.bindingMode.twoWay, resources.lookupFunctions);
        return instruction;
    };
    SyntaxInterpreter.prototype['to-view'] = function (resources, element, info, existingInstruction) {
        var instruction = existingInstruction || aureliaTemplating.BehaviorInstruction.attribute(info.attrName);
        instruction.attributes[info.attrName] = new aureliaBinding.BindingExpression(this.observerLocator, this.attributeMap.map(element.tagName, info.attrName), this.parser.parse(info.attrValue), aureliaBinding.bindingMode.toView, resources.lookupFunctions);
        return instruction;
    };
    SyntaxInterpreter.prototype['from-view'] = function (resources, element, info, existingInstruction) {
        var instruction = existingInstruction || aureliaTemplating.BehaviorInstruction.attribute(info.attrName);
        instruction.attributes[info.attrName] = new aureliaBinding.BindingExpression(this.observerLocator, this.attributeMap.map(element.tagName, info.attrName), this.parser.parse(info.attrValue), aureliaBinding.bindingMode.fromView, resources.lookupFunctions);
        return instruction;
    };
    SyntaxInterpreter.prototype['one-time'] = function (resources, element, info, existingInstruction) {
        var instruction = existingInstruction || aureliaTemplating.BehaviorInstruction.attribute(info.attrName);
        instruction.attributes[info.attrName] = new aureliaBinding.BindingExpression(this.observerLocator, this.attributeMap.map(element.tagName, info.attrName), this.parser.parse(info.attrValue), aureliaBinding.bindingMode.oneTime, resources.lookupFunctions);
        return instruction;
    };
    SyntaxInterpreter.inject = [aureliaBinding.Parser, aureliaBinding.ObserverLocator, aureliaBinding.EventManager, AttributeMap];
    return SyntaxInterpreter;
}());
Object.defineProperty(SyntaxInterpreter.prototype, 'one-way', Object.getOwnPropertyDescriptor(SyntaxInterpreter.prototype, 'to-view'));

var info = {};
var TemplatingBindingLanguage = (function (_super) {
    __extends(TemplatingBindingLanguage, _super);
    function TemplatingBindingLanguage(parser, observerLocator, syntaxInterpreter, attributeMap) {
        var _this = _super.call(this) || this;
        _this.parser = parser;
        _this.observerLocator = observerLocator;
        _this.syntaxInterpreter = syntaxInterpreter;
        _this.emptyStringExpression = _this.parser.parse('\'\'');
        syntaxInterpreter.language = _this;
        _this.attributeMap = attributeMap;
        _this.toBindingContextAttr = 'to-binding-context';
        return _this;
    }
    TemplatingBindingLanguage.prototype.inspectAttribute = function (resources, elementName, attrName, attrValue) {
        var parts = attrName.split('.');
        info.defaultBindingMode = null;
        if (parts.length === 2) {
            info.attrName = parts[0].trim();
            info.attrValue = attrValue;
            info.command = parts[1].trim();
            if (info.command === 'ref') {
                info.expression = new aureliaBinding.NameExpression(this.parser.parse(attrValue), info.attrName, resources.lookupFunctions);
                info.command = null;
                info.attrName = 'ref';
            }
            else {
                info.expression = null;
            }
        }
        else if (attrName === 'ref') {
            info.attrName = attrName;
            info.attrValue = attrValue;
            info.command = null;
            info.expression = new aureliaBinding.NameExpression(this.parser.parse(attrValue), 'element', resources.lookupFunctions);
        }
        else {
            info.attrName = attrName;
            info.attrValue = attrValue;
            info.command = null;
            var interpolationParts = this.parseInterpolation(resources, attrValue);
            if (interpolationParts === null) {
                info.expression = null;
            }
            else {
                info.expression = new InterpolationBindingExpression(this.observerLocator, this.attributeMap.map(elementName, attrName), interpolationParts, aureliaBinding.bindingMode.toView, resources.lookupFunctions, attrName);
            }
        }
        return info;
    };
    TemplatingBindingLanguage.prototype.createAttributeInstruction = function (resources, element, theInfo, existingInstruction, context) {
        var instruction;
        if (theInfo.expression) {
            if (theInfo.attrName === 'ref') {
                return theInfo.expression;
            }
            instruction = existingInstruction || aureliaTemplating.BehaviorInstruction.attribute(theInfo.attrName);
            instruction.attributes[theInfo.attrName] = theInfo.expression;
        }
        else if (theInfo.command) {
            instruction = this.syntaxInterpreter.interpret(resources, element, theInfo, existingInstruction, context);
        }
        return instruction;
    };
    TemplatingBindingLanguage.prototype.createLetExpressions = function (resources, letElement) {
        var expressions = [];
        var attributes = letElement.attributes;
        var attr;
        var parts;
        var attrName;
        var attrValue;
        var command;
        var toBindingContextAttr = this.toBindingContextAttr;
        var toBindingContext = letElement.hasAttribute(toBindingContextAttr);
        for (var i = 0, ii = attributes.length; ii > i; ++i) {
            attr = attributes[i];
            attrName = attr.name;
            attrValue = attr.nodeValue;
            parts = attrName.split('.');
            if (attrName === toBindingContextAttr) {
                continue;
            }
            if (parts.length === 2) {
                command = parts[1];
                if (command !== 'bind') {
                    LogManager__namespace.getLogger('templating-binding-language')
                        .warn("Detected invalid let command. Expected \"".concat(parts[0], ".bind\", given \"").concat(attrName, "\""));
                    continue;
                }
                expressions.push(new LetExpression(this.observerLocator, aureliaBinding.camelCase(parts[0]), this.parser.parse(attrValue), resources.lookupFunctions, toBindingContext));
            }
            else {
                attrName = aureliaBinding.camelCase(attrName);
                parts = this.parseInterpolation(resources, attrValue);
                if (parts === null) {
                    LogManager__namespace.getLogger('templating-binding-language')
                        .warn("Detected string literal in let bindings. Did you mean \"".concat(attrName, ".bind=").concat(attrValue, "\" or \"").concat(attrName, "=${").concat(attrValue, "}\" ?"));
                }
                if (parts) {
                    expressions.push(new LetInterpolationBindingExpression(this.observerLocator, attrName, parts, resources.lookupFunctions, toBindingContext));
                }
                else {
                    expressions.push(new LetExpression(this.observerLocator, attrName, new aureliaBinding.LiteralString(attrValue), resources.lookupFunctions, toBindingContext));
                }
            }
        }
        return expressions;
    };
    TemplatingBindingLanguage.prototype.inspectTextContent = function (resources, value) {
        var parts = this.parseInterpolation(resources, value);
        if (parts === null) {
            return null;
        }
        return new InterpolationBindingExpression(this.observerLocator, 'textContent', parts, aureliaBinding.bindingMode.toView, resources.lookupFunctions, 'textContent');
    };
    TemplatingBindingLanguage.prototype.parseInterpolation = function (resources, value) {
        var i = value.indexOf('${', 0);
        var ii = value.length;
        var char;
        var pos = 0;
        var open = 0;
        var quote = null;
        var interpolationStart;
        var parts;
        var partIndex = 0;
        while (i >= 0 && i < ii - 2) {
            open = 1;
            interpolationStart = i;
            i += 2;
            do {
                char = value[i];
                i++;
                if (char === "'" || char === '"') {
                    if (quote === null) {
                        quote = char;
                    }
                    else if (quote === char) {
                        quote = null;
                    }
                    continue;
                }
                if (char === '\\') {
                    i++;
                    continue;
                }
                if (quote !== null) {
                    continue;
                }
                if (char === '{') {
                    open++;
                }
                else if (char === '}') {
                    open--;
                }
            } while (open > 0 && i < ii);
            if (open === 0) {
                parts = parts || [];
                if (value[interpolationStart - 1] === '\\' && value[interpolationStart - 2] !== '\\') {
                    parts[partIndex] = value.substring(pos, interpolationStart - 1) + value.substring(interpolationStart, i);
                    partIndex++;
                    parts[partIndex] = this.emptyStringExpression;
                    partIndex++;
                }
                else {
                    parts[partIndex] = value.substring(pos, interpolationStart);
                    partIndex++;
                    parts[partIndex] = this.parser.parse(value.substring(interpolationStart + 2, i - 1));
                    partIndex++;
                }
                pos = i;
                i = value.indexOf('${', i);
            }
            else {
                break;
            }
        }
        if (partIndex === 0) {
            return null;
        }
        parts[partIndex] = value.substr(pos);
        return parts;
    };
    TemplatingBindingLanguage.inject = [aureliaBinding.Parser, aureliaBinding.ObserverLocator, SyntaxInterpreter, AttributeMap];
    return TemplatingBindingLanguage;
}(aureliaTemplating.BindingLanguage));

function configure(config) {
    config.container.registerSingleton(aureliaTemplating.BindingLanguage, TemplatingBindingLanguage);
    config.container.registerAlias(aureliaTemplating.BindingLanguage, TemplatingBindingLanguage);
}

exports.AttributeMap = AttributeMap;
exports.ChildInterpolationBinding = ChildInterpolationBinding;
exports.InterpolationBinding = InterpolationBinding;
exports.InterpolationBindingExpression = InterpolationBindingExpression;
exports.LetBinding = LetBinding;
exports.LetExpression = LetExpression;
exports.LetInterpolationBinding = LetInterpolationBinding;
exports.LetInterpolationBindingExpression = LetInterpolationBindingExpression;
exports.SyntaxInterpreter = SyntaxInterpreter;
exports.TemplatingBindingLanguage = TemplatingBindingLanguage;
exports.configure = configure;
//# sourceMappingURL=aurelia-templating-binding.js.map
