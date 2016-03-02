'use strict';

const _ = require('lodash');
const cache = require('memory-cache');
const async = require('async');

const defaultOptions = {
    logger: {
        debug: function() {},
        error: function() {},
    },

    // existence check for each cache key
    updateCheckPeriodInSeconds: 10,
};

module.exports = new_();

function new_(mainOptions) {
    mainOptions = _.clone(mainOptions || {});
    _.defaultsDeep(mainOptions, defaultOptions);

    let doing = false;
    const waitList = [];
    const keys = [];
    const handlers = {};
    const log = mainOptions.logger;

    let updateCheckTaskInterval = null;

    return _.assign(new_.bind(), {
        get: cache.get,
        put: cache.put,
        addHandler: addHandler,
        ensureUpToDate: ensureUpToDatePublic,
        start: start,
        stop: stop,
    });

    function addHandler(key, handler) {
        keys.push(key);
        handlers[key] = handler;
    }

    function ensureUpToDatePublic(keyOrKeysOrCallback, callback) {
        if (typeof callback !== 'function') {
            return log.error(new Error('callback is not a function'));
        }
        waitList.push(callback);
        if (doing) {
            return;
        }
        doing = true;
        ensureUpToDatePrivate(keyOrKeysOrCallback, function(err) {
            doing = false;
            _.each(waitList, function(waitListCallbackItem) {
                if (err) {
                    return waitListCallbackItem(err);
                }
                waitListCallbackItem();
            });
            waitList.splice(0, waitList.length);
        });
    }

    function start(callback) {
        callback = callback || function() {};
        updateCheckTaskInterval = setInterval(function() {
            ensureUpToDatePrivate(function(err) {
                if (err) {
                    log.error('cache:', err);
                }
            });
        }, mainOptions.updateCheckPeriodInSeconds * 1000);
        ensureUpToDatePrivate(callback);
    }

    function stop() {
        clearInterval(updateCheckTaskInterval);
    }

    function ensureUpToDatePrivate(keyOrKeysOrCallback, callback) {
        var requiredKeys = false;
        if (typeof keyOrKeysOrCallback == 'string') {
            requiredKeys = [keyOrKeysOrCallback];
        } else if (typeof keyOrKeysOrCallback == 'function') {
            callback = keyOrKeysOrCallback;
        } else {
            requiredKeys = keyOrKeysOrCallback;
        }
        async.eachSeries(keys, function(key, eachCallback) {
            if (requiredKeys && !_.includes(requiredKeys, key)) {
                return process.nextTick(eachCallback);
            }
            var handler = handlers[key];
            if (cache.get(key) === null) {
                log.debug('cache: calling handler for key "' + key + '"');
                cache.put(key, 'working…');
                handler(function(err, val, time) {
                    if (err) {
                        return eachCallback(err);
                    }
                    if (typeof time == 'undefined') {
                        log.debug('cache: writing key ' + key + ' without expiration');
                        cache.put(key, val);
                        return eachCallback();
                    }
                    log.debug('cache: writing key "' + key + '" with expiration (ms): ' + time);
                    cache.put(key, val, time);
                    eachCallback();
                });
            } else {
                process.nextTick(eachCallback);
            }
        }, callback);
    }
}

// function todoMethod(options) {
//     options = _.clone(options || {});
//     _.defaultsDeep(options, mainOptions);
//     requireOptions(options, [
//         'logger',
//     ]);
//     return Promise.resolve();
// }

// function requireOptions(providedOptions, requiredOptionNames) {
//     requiredOptionNames.forEach(function(optionName) {
//         if (typeof providedOptions[optionName] === 'undefined') {
//             throw new Error('missing option: ' + optionName);
//         }
//     });
// }