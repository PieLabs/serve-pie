(function(root){

  console.log('define pie.Container()');

  function Container(root, model, mode) {

    mode = mode || {view: 'gather', locale: 'en_US'};

    var sessions = {};

    function modelHasId(id, model){
      return model.id === id;
    }

    function observe(o, fn) {
      function buildProxy(prefix, o) {
        return new Proxy(o, {
          set(target, property, value) {
            // same as before, but add prefix
            var setResult = Reflect.set(target, property, value);
            fn(prefix + property, value);
            return setResult;
          },
          get(target, property) {
            // return a new proxy if possible, add to prefix
            let out = Reflect.get(target, property);
            if (out instanceof Object) {
              return buildProxy(prefix + property + '.', out);
            }
            return out;  // primitive, ignore
          },
        });
      }
      return buildProxy('', o);
    }

    function onSessionChanged(id, property, value){
      console.log('session changed for component with data-id: ', id);
      console.log(sessions);
      setTimeout(function(){
        $('.session-preview > textarea').val(JSON.stringify(sessions, null, '  '));
      }, 100);
    }

    // document.addEventListener('registerComponent', function(event){
    //   var id = event.detail[0];
    //   var bridge = event.detail[1];
    //   var element = event.detail[2];
    //   console.log(id, bridge, element);
    // });
    
    document.addEventListener('DOMContentLoaded', function(){

      var els = [];

      var controlPanel = document.querySelector('pie-control-panel');

      if(controlPanel){
        controlPanel.mode = observe(mode, function(){
          console.log('[pie] mode has changed...', mode);

          els.forEach(function(e){
            //in polymer explicitly call `set` the path
            if(typeof e.set === 'function'){
              e.set('mode.view', mode.view);
            } else if(e.__legacyComponentLayer){
              e.__legacyComponentLayer.updateMode(mode);
            } else if (e.__scope){
              e.__scope.$digest();
            } else if(e.reactRender){
              e.reactRender();
            }
          });
        });
      }

      var elements = document.querySelectorAll('[data-id]');

      console.log(elements);

      for (var i = 0; i < elements.length; ++i) {
        var el = elements[i];
        els.push(el);
        var id = el.getAttribute('data-id');
        console.log('id: ', id);
        var config = model.components.filter(modelHasId.bind(null, id));

        var session = {};

        if(sessions[id]){
          throw new Error('session already exists');
        }

        sessions[id] = session;

        el.session = observe(sessions[id], onSessionChanged.bind(this, id));

        el.mode = mode;
        if(config.length === 1){
          el.config = config[0];
        }
      }
    });
  }

  root.pie = root.pie || {} ;
  root.pie.Container = Container;
  console.log('pie.Container() defined');

})(this);
