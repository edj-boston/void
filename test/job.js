// External dependancies
var assert = require('assert'),
	should = require('should'),
	Job = require('../lib/Job.js'),
	AWS = require('aws-sdk');


// Constructor
describe('Job', function() {

	describe('#construct', function() {

		it('should have a 5 character name property', function() {
			var job =  new Job;
			assert.equal(job.name.length, 5);
		});

		it('should have at least one path item', function() {
			var job =  new Job({
				paths : ['/index.html'],
			});
			assert.notEqual(job.paths.length, 0);
		});

	});

});