// External dependancies
var assert = require('assert'),
	should = require('should'),
	v = require('../lib/Void.js');


// Constructor
describe('Void', function() {

	/* *
	 * Validation
	 */

	it('should throw an error if distribution is not 14 characters', function() {
		(function() {
			v({ distribution : '' });
		}).should.throw('[Void] Distribution id must be a 14 character string');
	});

	it('should throw an error if distribution is not a string', function() {
		(function() {
			v({ distribution : {} });
		}).should.throw('[Void] Distribution id must be a 14 character string');
	});


	/* *
	 * Queue building
	 */

	it('should have a queue of length 6', function() {
		var vd = v({
			distribution : 'ABCDEFGHIJKLMN',
			paths : ['/css/custom.css', '/index.html'],
			dirs : ['test/static']
		});
		assert.equal(vd.queue.length, 6);
	});

	it('should have a queue of length 5 because of the poison list', function() {
		var vd = v({
			distribution : 'ABCDEFGHIJKLMN',
			paths : ['/css/custom.css', '/index.html'],
			dirs : ['test/static'],
			poison : ['/test1.html', '/test2.html']
		});
		assert.equal(vd.queue.length, 5);
	});

});
