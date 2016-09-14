//A temporary control panel to get the demo working


(function () {

  var prototype = Object.create(HTMLElement.prototype);

  prototype.emitEnvChangedEvent = function () {
    var event = new CustomEvent('pie.envChanged', {bubbles: true});
    this.dispatchEvent(event);
  }

  prototype.createdCallback = function () {

    this.innerHTML = 'This is a temporary control panel to get things working.';

    Object.defineProperty(this, 'env', {
      set: function (e) {
        this._env = e;
        this.emitEnvChangedEvent();
      },
      get: function () {
        return this._env;
      }
    });

  };

  prototype.attachedCallback = function() {
    setTimeout(function () {
      this.env = {mode: 'gather'};
    }.bind(this), 1500);
  };

  var panel = document.registerElement('tmp-control-panel', { prototype: prototype });
  console.log('registered tmp-control-panel');
})(this);