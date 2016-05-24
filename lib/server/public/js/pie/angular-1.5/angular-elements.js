(function (w) {


  /**
   todo: do same as react. create custom element and on attached bootstrap the ng app.
   Aka: minimise what the component needs to do to function in this context.
   - no events out
   - just some models in - the the comp manipulates the model
   */
   
  var PROPERTY_DELIMITER_CHARACTERS = [':', '-', '_'];

  var registrationFunction = (document.registerElement || document.register).bind(document);

  if (registrationFunction === undefined) {
    return;
  }

  var el = angular.element;



  function loadScope(element){
    return el(element).isolateScope() || el(element).scope();
  }

  var registerAngular = function (elementName, moduleName) {
    moduleName = moduleName || elementName;

    var elementPrototype = Object.create(HTMLElement.prototype);

    var defun = {
      get: function() {
        return this.__config;
      },
      set: function(d){
        this.__config = d;
        console.log('config set: ', d);
        if(this.scope){
          this.scope.config = this.__config;
          this.scope.$digest();
        }
      }
    };

    Object.defineProperty(elementPrototype, 'config', defun);

    elementPrototype.createdCallback = function () {

      var element = this;
      this._content = getContentNodes(this);
      this.angularModuleName = moduleName;

      function configureNgModule($provide) {

        function decorateRootScope($log, $delegate) {

          var scopePrototype = ('getPrototypeOf' in Object) ?
              Object.getPrototypeOf($delegate) : $delegate.__proto__; //jshint ignore:line

          var _new = scopePrototype.$new;
          scopePrototype.$new = function () {
            var child = _new.apply(this, arguments);
            var _emit = child.$emit;
            child.$emit = function(){

              //if the scope is the ui-components scope - send the events out of ng
              if(loadScope(element) === this){
                var eventType = arguments[0];
                console.log('custom $emit - eventType: ', eventType);
                var event = new UIEvent(eventType, {bubbles: true});
                //TODO: i'm assuming arg 1 is the $elem.
                //Any way I can get that using the $emit mechanism?
                var $el = arguments[1];
                var el = $el[0];
                el.dispatchEvent(event);
              } else {
                _emit.apply(this, arguments);
              }
            };
            return child;
          };

          return $delegate;
        }

        $provide.decorator('$rootScope', ['$log', '$delegate', decorateRootScope]);
      }

      angular.module(moduleName)
        .config(['$provide', configureNgModule]);



      angular.bootstrap(this, [this.angularModuleName]);

      this.scope = loadScope(this); //el(this).isolateScope() || el(this).scope() || el(this.parentNode).scope();

      if(this.__config){
        this.scope.config = this.__config;
        this.scope.$digest();
      }

      extend(this, this.scope);

      var attributesObjects = getAllProperties(this, this.attributes);
      extend(this.scope, attributesObjects);

      this.scope.$digest();
    };

    elementPrototype.attributeChangedCallback = function () {
      var attributesObjects = getAllProperties(this, this.attributes);
      extend(this.scope, attributesObjects, true);

      this.scope.$digest();
    };

    registrationFunction(elementName, {
      prototype: elementPrototype
    });
  };

  document.registerAngular = registerAngular;

  if (w.xtag !== undefined) {
    w.xtag.registerAngular = registerAngular;
  }

  var extend = function (extandable, extending, replace) {
    for (var i in extending) {
      if (extandable[i] === undefined || replace === true) {

        if (typeof extending[i] === 'function') {
          extandable[i] = extending[i].bind(extending);
        } else {
          extandable[i] = extending[i];
        }
      }
    }
  };

  var getContentNodes = function (el) {
    var fragment = document.createElement('content');
    while (el.childNodes.length) {
      fragment.appendChild(el.childNodes[0]);
    }
    return fragment;
  };

  var getAllProperties = function (el, attributes) {
    var result = {};

    for (var i = 0; i < attributes.length; i++) {
      var attribute = attributes[i];
      var propertyName = attributeNameToPropertyName(attribute.name);
      result[propertyName] = parseAttributeValue(attributes[i].value);
    }

    result._content = el._content;
    return result;
  };

  var attributeNameToPropertyName = function (attributeName) {
    var result = attributeName.replace('x-', '').replace('data-', '');
    var delimiterIndex = -1;

    while ((delimiterIndex = getNextDelimiterIndex(result)) !== -1) {
      result = result.slice(0, delimiterIndex) + result.charAt(delimiterIndex + 1).toUpperCase() + result.slice(delimiterIndex + 2, result.length);
    }

    return result;
  };

  var getNextDelimiterIndex = function (string) {
    var result = -1;

    for (var i = 0; i < PROPERTY_DELIMITER_CHARACTERS.length; i++) {
      var char = PROPERTY_DELIMITER_CHARACTERS[i];
      result = string.indexOf(char);
      if (result !== -1) {
        break;
      }
    }

    return result;
  }

  var parseAttributeValue = function (value) {
    var regexp = /\{.*?\}/g;
    var matches = value.match(regexp);

    if (matches !== null && matches !== undefined && matches.length > 0) {
      value = eval(matches[0].replace('{', '').replace('}', ''));
    }

    return value;
  };

  // var getterSetter = function (variableParent, variableName, getterFunction, setterFunction) {
  //   if (Object.defineProperty) {
  //     Object.defineProperty(variableParent, variableName, {
  //       get: getterFunction,
  //       set: setterFunction
  //     });
  //   }
  //   else if (document.__defineGetter__) {
  //     variableParent.__defineGetter__(variableName, getterFunction);
  //     variableParent.__defineSetter__(variableName, setterFunction);
  //   }

  //   variableParent["get" + variableName] = getterFunction;
  //   variableParent["set" + variableName] = setterFunction;
  // };
})(window);

//Mozilla bind polyfill
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
    fToBind = this,
    fNOP = function () {
    },
    fBound = function () {
      return fToBind.apply(this instanceof fNOP && oThis
        ? this
        : oThis,
        aArgs.concat(Array.prototype.slice.call(arguments)));
    };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}
