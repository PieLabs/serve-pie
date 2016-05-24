//lifted from: https://github.com/PixelsCommander/ReactiveElements
(function(root) {

  var exports = {};

  var registerElement = document.registerElement || document.register;

  if (registerElement) {
    registerElement = registerElement.bind(document);
  } else {
    throw new Error('No custom element support or polyfill found!');
  }

  exports.registerReact = function (elementName, ReactComponent) {

    function create(nativeElement) {

      if(nativeElement.__config && nativeElement.__session && nativeElement.__mode){

        var element = React.createElement(ReactComponent, {
          model: nativeElement.__config.model,
          session: nativeElement.__session,
          mode: nativeElement.__mode
        });

        nativeElement.reactiveElement = element;
        return ReactDOM.render(element, nativeElement, function(){
          console.log('rendered!', arguments);
        });
      }
    }

    var elementPrototype = Object.create(HTMLElement.prototype);

    Object.defineProperty(elementPrototype, 'mode', {
      get: function() {
        return this.__mode;
      },
      set: function(d){
        this.__mode = d;
        create(this);
      }
    });

    Object.defineProperty(elementPrototype, 'session', {
      get: function() {
        return this.__session;
      },
      set: function(d){
        this.__session = d;
        create(this);
      }
    });

    Object.defineProperty(elementPrototype, 'config', {
      get: function() {
        return this.__config;
      },
      set: function(d){
        this.__config = d;
        create(this);
      }
    });

    var reactElement;

    elementPrototype.reactRender = function(){
      create(this);
    };

    elementPrototype.createdCallback = function () {
      var event = new CustomEvent('pie.register', {bubbles: true});
      this.dispatchEvent(event);
    };

    registerElement(elementName, {prototype: elementPrototype});
  };

  document.registerReact = exports.registerReact;
})(this);
