var SandboxedModule = require('sandboxed-module');
var a = SandboxedModule.require('./a', {
  requires: {'lodash': require('lodash') }
});