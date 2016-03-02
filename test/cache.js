'use strict';

const assert = require('assert');
const constants = {
    appCacheIntervalInSeconds: 0.1,
};
const cacheModule = require('../src/built/cache');
const cache = cacheModule({
    updateCheckPeriodInSeconds: constants.appCacheIntervalInSeconds,
    _logger: {
        debug: console.log.bind(null, 'debug'),
        error: console.log.bind(null, 'error'),
    }
});
let handlerTimesCalled = 0;

describe('module cache', function() {
    describe('managing instances', function() {
        it('module should be a default instance', function() {
            assert.strictEqual(typeof cacheModule.get, 'function');
        });
        it('module can create a new instance', function() {
            assert.strictEqual(typeof cacheModule, 'function');
            assert.strictEqual(typeof cache, 'function');
            assert.strictEqual(typeof cache.get, 'function');
        });
    });
    describe('addHandler', function() {
        it('should add a worker', function() {
            cache.addHandler('aHandler', callback => {
                handlerTimesCalled++;
                setTimeout(function() {
                    callback(null, 'cached_value', 50);
                }, 100);
            });
        });
    });
    describe('start', function() {
        it('should check existence of cache periodically', function(done) {
            assert.strictEqual(cache.get('aHandler'), null);
            cache.start(err => {
                if (err) {
                    return done(err);
                }
                assert.strictEqual(cache.get('aHandler'), 'cached_value');
                setTimeout(function() {
                    assert.strictEqual(cache.get('aHandler'), 'cached_value');
                }, 20);
                setTimeout(function() {
                    assert.strictEqual(cache.get('aHandler'), null);
                }, 60);
                setTimeout(function() {
                    assert.strictEqual(cache.get('aHandler'), 'working…');
                }, 120);
                setTimeout(function() {
                    assert.strictEqual(cache.get('aHandler'), 'cached_value');
                    assert.strictEqual(handlerTimesCalled, 2);
                    return done();
                }, 220);
            });
            assert.strictEqual(cache.get('aHandler'), 'working…');
        });
    });
});