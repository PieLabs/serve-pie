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
npm install -g node-inspector
node-debug _mocha test/spec/**
```


### Dev notes

server additions:
* server side processing - how to glue in?
* server side preprocessing