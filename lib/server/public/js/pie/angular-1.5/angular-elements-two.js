(function (root) {


  function LegacyComponentLayer(el, bridge) {

    //TODO for poc: Mode, setting an existing session?


    this.updateMode = function (mode) {
      console.log('updateMode...', mode);
      bridge.setMode(el.__mode.view);
      bridge.editable(el.__mode.view == 'gather');
      el.__scope.$digest();
    };

    bridge.answerChangedHandler(function (answers) {
      if (el.__session) {
        var session = bridge.getSession();
        el.__session.answers = session.answers;
      }
    });

    function setDataAndSession() {
      if (el.__session && el.__config) {
        var dataAndSession = {
          data: el.__config,
          session: el.__session
        }
        console.log('.. setting dataAndSession on legacy componenent');
        bridge.setDataAndSession(dataAndSession);
        el.__scope.$digest();
      }
    }

    Object.defineProperty(el, 'mode', {
      get: function () {
        return this.__mode;
      },
      set: function (d) {
        this.__mode = d;
        if (this.__scope) {
          bridge.setMode(this.__mode.view);
          el.__scope.$digest();
        }
      }
    });

    Object.defineProperty(el, 'config', {
      get: function () {
        return this.__config;
      },
      set: function (d) {
        this.__config = d;
        if (this.__scope) {
          setDataAndSession();
        }
      }
    });

    Object.defineProperty(el, 'session', {
      get: function () {
        return this.__session;
      },
      set: function (d) {
        this.__session = d;
        if (this.__scope) {
          setDataAndSession();
        }
      }
    });
  }

  var registerElement = document.registerElement || document.register;

  if (registerElement) {
    registerElement = registerElement.bind(document);
  } else {
    throw new Error('No custom element support or polyfill found!');
  }


  var exports = {};

  var el = angular.element;

  function loadScope(element) {
    return el(element).isolateScope() || el(element).scope();
  }

  function setNgProperty(scope, key, data) {
    scope[key] = data;
    scope.$digest();
  }


  function configureNgModule($provide) {

    var element = this;
    /**
     * Decorate the rootScope so that we can propogate $emits from the directive scope,
     * out of the angular context (needed to support legacy components).
     */
    function decorateRootScope($log, $delegate) {

      var scopePrototype = ('getPrototypeOf' in Object) ?
        Object.getPrototypeOf($delegate) : $delegate.__proto__; //jshint ignore:line

      var _new = scopePrototype.$new;
      scopePrototype.$new = function () {
        var child = _new.apply(this, arguments);
        var _emit = child.$emit;
        child.$emit = function () {

          //if the scope is the ui-components scope - send the events out of ng
          if (loadScope(element) === this) {
            var eventType = Array.prototype.shift.call(arguments);
            var args = Array.prototype.slice.call(arguments);
            console.log('custom $emit - eventType: ', eventType);
            var event = new CustomEvent(eventType, { bubbles: true, detail: args });
            element.dispatchEvent(event);
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

  exports.registerAngular = function (elementName, moduleName) {

    moduleName = moduleName || elementName;

    var elementPrototype = Object.create(HTMLElement.prototype);

    elementPrototype.angularModuleName = moduleName;

    Object.defineProperty(elementPrototype, 'mode', {
      get: function () {
        return this.__mode;
      },
      set: function (d) {
        this.__mode = d;
        if (this.__scope) {
          setNgProperty(this.__scope, 'mode', this.__mode);
        }
      }
    });

    Object.defineProperty(elementPrototype, 'config', {
      get: function () {
        return this.__config;
      },
      set: function (d) {
        this.__config = d;
        if (this.__scope) {
          setNgProperty(this.__scope, 'config', this.__config);
        }
      }
    });

    Object.defineProperty(elementPrototype, 'session', {
      get: function () {
        return this.__session;
      },
      set: function (d) {
        this.__session = d;
        if (this.__scope) {
          setNgProperty(this.__scope, 'session', this.__session);
        }
      }
    });

    function onRegisterComponent(event) {
      var id = event.detail[0];
      var bridge = event.detail[1];
      var element = event.detail[2];
      console.log('[registerComponent]', this, id, bridge, element);
      this.__legacyComponentLayer = new LegacyComponentLayer(this, bridge);
    };

    function create() {
      angular.module(this.angularModuleName)
        .config(['$provide', configureNgModule.bind(this)]);


      //legacy component support... 
      this.addEventListener('registerComponent', onRegisterComponent);

      angular.bootstrap(this, [this.angularModuleName]);
      this.__scope = loadScope(this);

      if (this.__config) {
        setNgProperty(this.__scope, 'config', this.__config);
      }

      if (this.__session) {
        setNgProperty(this.__scope, 'session', this.__session);
      }

      if (this.__mode) {
        setNgProperty(this.__scope, 'mode', this.__mode);
      }
    }

    elementPrototype.createdCallback = function () {
      console.log('created!', this, arguments);
      create.bind(this)();
    };

    registerElement(elementName, { prototype: elementPrototype });
  };

  document.registerAngular = exports.registerAngular;

})(window);
