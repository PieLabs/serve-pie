const path = require('path');

module.exports = `serve-pie:  serve up some pie. 
Options:
  -p | --port [port] - the http port to bind to (default: 5000)
  --root [path]      - the path to the pie root (default: ${process.cwd()})
  --demo [path]      - the path to the demo (default: $root/docs/demo)
  --log [level|path|json_string]  - either a log level or a path to a log config file
    - if a log level it'll apply globally
    - if a path to a log file you can configure individual levels for different loggers
    - if a json string it'll be parsed and set
  --logHttpRequests  - log HTTP requests to the server 
  --fullInstall      - run a full install (with bower and resolution reports) (default: false)
  --withAccessibility - add alpha accessibility components
`;