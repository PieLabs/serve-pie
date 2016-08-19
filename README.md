# serve-pie

A development server for running [pies](http://github.com/PieLabs/pie) locally.

## Install

### Requirements

* node >= 6.0.0

> We'd recommend setting `npm config set engine-strict true` to trigger errors instead of warnings for engine mismatches.

> !! The command below wont work until we have published the library. For now see [Developing/Contributing](#/Developing/Contributing)
```
npm install -g serve-pie
bower install
```

> If your client libs get out of date run `bower install --force` to update.

## Supported Pies  

The following Pies work with `serve-pie`: 

* [corespring-pie-multiple-choice](https://github.com/PieElements/corespring-pie-multiple-choice)
* [khan-perseus-plotter](https://github.com/PieLabs/khan-perseus-plotter)
* [h5p-image-hotspot](https://github.com/PieLabs/h5p-image-hotspot)
* [corespring-pie-true-false](https://bitbucket.org/pieelements/corespring-pie-true-false)

## Usage

To use `serve-pie`, run it in a `pie` compatible directory.

For information on the directory structure see the [pie spec](http://github.com/PieLabs/pie).

### CLI Options

run `serve-pie --help` to see usage.

run `serve-pie --version` to see the version.

## Developing/Contributing

### Branches

* develop - active dev branch
* master - for releases only 

```
git clone git@github.com:PieLabs/serve-pie.git
cd serve-pie
npm install # install the dependencies
npm link # link serve-pie as a global executable

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
```

### TODOS

* integration testing
* support for references in json-schemas
* add `oneOf` and `anyOf` etc support to json-schemas
* improve ui of schema renderer for different types (eg: min/max etc)
* fix markdown styling of readme
* Re-add the accessibility controls (maybe put them behind a flag? `--with-accessibility-tools`)
* add the show/hide session toggle from ev's prototype (https://share.proto.io/JT9K7Q/)
* setup release process (tagging, merging to master, publishing etc)
