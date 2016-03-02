'use strict';

const assert = require('assert');
const cacheModule = require('../src/built/cache');
const cache = cacheModule({
});

describe('module cache', function() {
    describe('managing instances', function() {
        it('module should be a default instance', function() {
            assert.strictEqual(typeof cacheModule.todoMethod, 'function');
        });
        it('module can create a new instance', function() {
            assert.strictEqual(typeof cacheModule, 'function');
            assert.strictEqual(typeof cache, 'function');
            assert.strictEqual(typeof cache.todoMethod, 'function');
        });
    });
});