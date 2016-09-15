//A temporary control panel to get the demo working
(function () {

  var prototype = Object.create(HTMLElement.prototype);

  function input(key){
    return [
      '<label>',
      '  <input type="radio" name="mode" value="'+key+'"/>',
      key,
      '</label>'
    ].join('\n');
  }
  var html = [
    input('gather'),
    input('view'),
    input('evaluate')
  ].join('\n');


  function onchange(key){
    return function(event){
      console.log('!!' + key);
      this.env.mode = key;
      this.emitEnvChangedEvent();
    }.bind(this);
  }

  prototype.emitEnvChangedEvent = function () {
    var event = new CustomEvent('pie.envChanged', {bubbles: true});
    this.dispatchEvent(event);
  }

  prototype.addChangeListener = function(key){
    var el = this.querySelector('input[value="'+key+'"]');
    el.addEventListener('change', onchange.bind(this)(key));
  };

  prototype.createdCallback = function () {

    this.innerHTML = html;

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

    this.addChangeListener('gather');
    this.addChangeListener('view');
    this.addChangeListener('evaluate');
  };

  var panel = document.registerElement('tmp-control-panel', { prototype: prototype });
  console.log('registered tmp-control-panel');
})(this);