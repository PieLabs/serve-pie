const EmptyEventHandler = require('./empty');
const fs = require('fs-extra');
const minimist = require('minimist');
const SandboxConsole = require('../processor/console');
const path = require('path');
const vm = require('vm');
const logFactory = require('../../log-factory');
const _ = require('lodash');
const {NodeVM} = require('vm2');

module.exports = function(handlerPath){
  let logger = require('../../log-factory').fileLogger(__filename);
  logger.info(`handlerPath: ${handlerPath}`);

  if(fs.existsSync(handlerPath) && fs.statSync(handlerPath).isFile()){
    try{

      // let sandboxedModule = {
      //   exports: {}
      // };

      let src = fs.readFileSync(handlerPath);
      // let script = new vm.Script(src);
      // let sandboxedLogger = logFactory.getLogger(path.basename(handlerPath , '.js'));
      // let sandboxedConsole = new SandboxConsole(sandboxedLogger);
      // let sandbox = {
      //   module: sandboxedModule,
      //   exports: sandboxedModule.exports,
      //   console: sandboxedConsole
      // }
      // script.runInNewContext(sandbox, {filename: handlerPath});
      
      const vm = new NodeVM({
        console: 'inherit',
        sandbox: {},
        require: {
            external: true,
            builtin: ['fs', 'path', 'http'],
            root: path.resolve(handlerPath, '..'),
            mock: {
                fs: {
                    readFileSync() { return 'Nice try!'; }
                }
            }
            }
        });
      
      let constructor = vm.run(src, path.resolve(handlerPath));//sandboxedModule.exports;

      function newInstance(constructor, args){
        let bind = Function.prototype.bind;
        let instance = 
          new (bind.apply(constructor, [null].concat(values)));
        if(_.isFunction(instance.handle)){
          return instance;
        } else {
          throw new Error('instance is missing "handle" function');
        }
        return instance;
      }

      let values = [];
      
      if(constructor.params){
        let args = minimist(process.argv);
        values = _.map(constructor.params, function(p){
          return args[p];
        });
      } 
      return newInstance(constructor, values);
      
    } catch(e) {
      logger.warn(`error occurred initialising event handler for path: ${path}`, e.stack);
      return new EmptyEventHandler();
    }
  } else {
    return new EmptyEventHandler();
  }
}