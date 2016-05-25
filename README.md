# Serve Pie 

# Install

```
npm install # install the dependencies
npm link # link serve-pie as a global executable

```

### Run a sample

```
cd test/resources/sample-content/bower-style/sample-item
serve-pie 
```

### Tests

```
grunt test

```
##### debug tests: 

```

mocha --debug-brk test/spec/path/to/spec.js
# then you can attach an inspector to port 5858
npm install -g node-inspector
node-debug _mocha test/spec/**
```

### TODOS

* formalize outcome inputs and outputs (questions, sessions, settings) => outcome what does it return?
* allow it to work with dev style pie elements aka paths are local.
* schema support

### Dev notes

server additions:
* server side processing - how to glue in?
* server side preprocessing