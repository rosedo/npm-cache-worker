'use strict';

const _ = require('lodash');

const defaultOptions = {
};

module.exports = new_();

function new_(mainOptions) {
    mainOptions = _.clone(mainOptions || {});
    _.defaultsDeep(mainOptions, defaultOptions);
    return _.assign(new_.bind(), {
        todoMethod: todoMethod,
    });

    function todoMethod(options) {
        options = _.clone(options || {});
        _.defaultsDeep(options, mainOptions);
        requireOptions(options, [
        ]);
        return Promise.resolve();
    }
}

function requireOptions(providedOptions, requiredOptionNames) {
    requiredOptionNames.forEach(function(optionName) {
        if (typeof providedOptions[optionName] === 'undefined') {
            throw new Error('missing option: ' + optionName);
        }
    });
}