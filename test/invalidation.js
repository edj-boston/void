// External dependancies
var assert = require('assert'),
	should = require('should'),
	Void = require('../lib/Void.js'),
	Invalidation = require('../lib/Invalidation.js'),
	AWS = require('aws-sdk');


// Constructor
describe('Invalidation', function() {

	/* *
	 * Validation
	 */

	it('should have a 5 character name property', function() {
		var v = new Void();
		var inv =  new Invalidation({
			parent : v.name,
			log : v.log.bind(v),
			err : v.err.bind(v)
		});
		assert.equal(inv.name.length, 5);
	});

	it('should have a parent', function() {
		var v = new Void();
		(function() {
			var inv =  new Invalidation({
				err : this.err.bind(this)
			});
		}.bind(v)).should.throw('[Void:' + v.name + '] Please pass a parent id');
	});

	it('should have at least one path item', function() {
		var v = new Void();
		var inv =  new Invalidation({
			paths : ['/index.html'],
			parent : v.name,
			err : v.err.bind(v)
		});
		assert.notEqual(inv.paths.length, 0);
	});

	it('should ', function() {
		var v = new Void();
		var inv =  new Invalidation({
			cloudfront : new AWS.CloudFront(),
			parent : v.name,
			err : v.err.bind(v)
		});
		assert.equal(typeof inv.cloudfront, 'object');
	});

});