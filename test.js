'use strict';

var should = require('should'),
    sinon = require('sinon'),
    reflekt = require('reflekt'),
    proxyquire = require('proxyquire');

describe('rethinkdb', function() {
    beforeEach(function() {
        var self = this;

        this.client = sinon.spy();

        this.rethink = {
            connect: sinon.spy(function(uri, callback) {
                callback(null, self.client);
            }),
        };

        this.initializer = proxyquire('./', {
            'parent-require': function() {
                return self.rethink;
            },
        });

        this.$$resolver = new reflekt.ObjectResolver();
    });

    it('should throw an error if no uri is defined', function() {
        var self = this;
        (function() {
            self.initializer({});
        }).should.throw('URI is not defined!');
    });

    it('should create the resource if it is enabled', function(done) {
        var self = this;
        this.initializer({ enabled: true, uri: '' })(this.$$resolver, function() {
            self.rethink.connect.called.should.equal(true);
            done();
        });
    });

    it('should create the resource if enabled is undefined in the options', function(done) {
        var self = this;
        this.initializer({ uri: '' })(this.$$resolver, function() {
            self.rethink.connect.called.should.equal(true);
            done();
        });
    });

    it('should not create the resource if it is disabled', function(done) {
        var self = this;
        this.initializer({ enabled: false })(this.$$resolver, function() {
            self.rethink.connect.called.should.equal(false);
            done();
        });
    });

    it('should use the defined uri', function(done) {
        var self = this;
        this.initializer({ enabled: true, uri: 'foo' })(this.$$resolver, function() {
            self.rethink.connect.calledWith('foo').should.equal(true);
            done();
        });
    });

    it('should inject the resource using the defined name', function(done) {
        var self = this;
        this.initializer({ enabled: true, inject: 'foo', uri: 'foo' })(this.$$resolver, function() {
            self.$$resolver('foo').should.equal(self.client);
            done();
        });
    });

    it('should inject the resource using `$rethink` if no name is defined', function(done) {
        var self = this;
        this.initializer({ enabled: true, uri: 'foo' })(this.$$resolver, function() {
            self.$$resolver('$rethink').should.equal(self.client);
            done();
        });
    });
});
