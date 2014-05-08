// External dependancies
var assert = require('assert'),
	should = require('should');


describe('AWS credentials', function() {

	it('should throw an error if AWS_ACCESS_KEY_ID is undefined', function() {
		assert.notEqual(process.env.AWS_ACCESS_KEY_ID, undefined);
	});

	it('should throw an error if AWS_SECRET_ACCESS_KEY is undefined', function() {
		assert.notEqual(process.env.AWS_SECRET_ACCESS_KEY, undefined );
	});

	it('should throw an error if DISTRIBUTION_ID is undefined', function() {
		assert.notEqual(process.env.DISTRIBUTION_ID, undefined );
	});

});