# TODO description

## Installation
```sh
$ npm install --save cache-worker
```

## Usage
```js
// require default instance (created with default options)
const cache = require('cache-worker');

// override default options
const cache = require('cache-worker')({ anOption: true });

// making an instance available to other files
const cache = require('cache-worker');
cache.anInstance = cache({ anOption: true });

// if Promise isn't defined
global.Promise = require('promise-module');
var cache = require('cache-worker');
```

### TODO usage example
```js
```

## Running tests
```sh
$ npm install
$ npm test
```