# Serve Pie 

A development server for running pies locally.

## Install

```
npm install -g serve-pie

```

## Usage

To use serve-pie, you run and select a root directory that has the following files:


* index.html - the markup to render in the sample
* index.json - the data model for the pies declared in the layout
* dependencies.json (optional [can use `--pie` as an alternative) - defines how to resolve the pies defined above

> By default the current directory is treated as the root. To change the root use `--root [path]` in the cli.

The dependencies.json should have the following form:
```json
{
 "dependencies" : {
   "local-pie" : "../",
   "git-pie" : "git@git.com:org/repo.git"
 } 
}
```

If the dependency value is a local path, the repo will be attached using `bower link`, allowing you to then make changes to the source and have them reflected in the sample item.

### CLI Options

* --pie - set a path to a local pie dependency (will override what's in dependencies.json). you can have as many of these as you want
* --log [error|warn|info|verbose|debug|silly|path-to-config-file] - a log level or a path to a log config file.
* --root [path] the path to be used as the root, should contain the sample files above.
* ....


## Developing/Contributing

```
git clone git@bitbucket.org:pietools/serve-pie.git
cd serve-pie
npm install # install the dependencies
npm link # link serve-pie as a global executable

```

### Run a test sample

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

# or 

mocha test/spec/**/*.js

```

##### debug tests: 

```

mocha --debug-brk test/spec/path/to/spec.js
# then you can attach a debugger to localhost:5858
# eg: npm install -g node-inspector
#     node-debug _mocha test/spec/**
```

### TODOS
* what to do about accessibility - on load can you pass in accessiblity opts?
  * or do you pass them in at runtime?
  * for now i'm going to set it up as runtime - as this fits with what's currently there.

* formalize outcome inputs and outputs (questions, sessions, settings) => outcome what does it return?
* ~~allow it to work with dev style pie elements aka paths are local. (need to do a bower link for these).~~
* schema support
* styling
* ~~assets in items~~
* assets in pies?
  * either passed in from the model (no problem there)
  * baked in?

<template>
  <img src="my-img.jpg"/>
</template>

How do we serve this? it'll be rendered on the page as "my-img.jpg"



> load( {asl: true} ) ==> { model: { text: '.., aslVid: '..' }}

or 

load() ==> { model: text: '..', aslVid: '..'}}
if( env.accessibility.asl ) {
  ...
} 

if(model.aslVid){
}

 