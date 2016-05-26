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

#### Debug

````
node --debug-brk $(which serve-pie)

# You can now attach a debugger to localhost:5858

````

### Tests

```
grunt test

```
##### debug tests: 

```

mocha --debug-brk test/spec/path/to/spec.js
# then you can attach a debugger to localhost:5858
# eg: npm install -g node-inspector
#     node-debug _mocha test/spec/**
```

### TODOS

* formalize outcome inputs and outputs (questions, sessions, settings) => outcome what does it return?
* allow it to work with dev style pie elements aka paths are local.
* schema support
* styling
* ~~assets in items~~


* assets in pies?

- either passed in from the model (no problem there)
- baked in?

<template>
  <img src="my-img.jpg"/>
</template>

How do we serve this? it'll be rendered on the page as "my-img.jpg"