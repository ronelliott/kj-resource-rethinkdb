'use strict';

const is = require('is'),
      prequire = require('parent-require'),
      rethinkdb = prequire('rethinkdb');

module.exports = function($opts) {
    var enabled = is.defined($opts.enabled) ? $opts.enabled : true,
        inject = $opts.inject || '$rethink',
        uri = $opts.uri;

    if (enabled && (is.null(uri) || is.undefined(uri))) {
        throw new Error('URI is not defined!');
    }

    return function($$resolver, callback) {
        if (!enabled) {
            callback();
            return;
        }

        rethinkdb.connect(
            uri,
            function(err, conn) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    $$resolver.add(inject, conn);
                    callback();
                });
    };
};
