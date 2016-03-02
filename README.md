# Add promise workers to cache values in memory, retrieve synchronously

## Installation
```sh
$ npm install --save cache-worker
```

## Usage
```js
// require default instance (created with default options)
const cache = require('cache-worker');

// override default options
const winston = require('winston');
const cache = require('cache-worker')({ logger: winston });

// making an instance available to other files
const cache = require('cache-worker');
cache.anInstance = cache({ logger: winston });
```

## Options
### logger
The logger must have the following defined function properties or methods:
- logger.debug
- logger.error

Default value : 
```js
{
    logger: {
        debug: function() {},
        error: function() {},
    }
}
```
### updateCheckPeriodInSeconds
Must be a `Number`
Default value: `10`

### Adding a cache worker
```js
const cache = require('cache-worker')({
    updateCheckPeriodInSeconds: 0.2,
});

cache.addHandler('example', callback => {

    // wait 100ms
    setTimeout(function() {

        // error, value to cache, expires in (ms)
        callback(null, 'exampleValue', 50);

    }, 100);
});

// current value
cache.get('example') === null;

// immediately and every 200ms (updateCheckPeriodInSeconds)
// this will call the example handler
// if and only if cache.get('example') === null
cache.start();

// current value
cache.get('example') === 'working…';

// 50ms later (the handler takes 100ms to execute)
cache.get('example') === 'working…';

// 60ms later
cache.get('example') === 'exampleValue';

// 50ms later (cache expiration was set to 50ms)
cache.get('example') === null;

// cycle continues every 200ms
```

In case of an error returned by a handler function, the cached value will stay at 'working…' state, so the cache handler will stop being called. To avoid this, use `cache.put('key', null)`:
```js
cache.addHandler('example2', callback => {
    setTimeout(function() {
        // in 5min, allow the handler to be called again
        setTimeout(function() {
            cache.put('example2', null);
        }, 5 * 60000);
        callback(new Error('not found'));
    }, 100);
});
```

### cache.start
For each added handler, now and every `updateCheckPeriodInSeconds` seconds, call the handler if the cached value is null (never set or expired)

`cache.start([callback(err)])`

### cache.stop
Stop calling handlers.

### cache.get, cache.put
Functions from memory-cache: <https://github.com/ptarjan/node-cache>

### ensureUpToDate
`ensureUpToDate([key(s)], callback)`

Waits values to be cached before calling the callback. Keys can be a string array or a string (defaults to all keys)

## Running tests
```sh
$ npm install
$ npm test
```