var Job    = require('../lib/Job.js'),
	AWS    = require('aws-sdk'),
	should = require('should');


describe('Job#construct', function() {

	it('should have a 5 character name property', function() {
		var job =  new Job;
		job.name.length.should.equal(5);
	});

	it('should have at least one path item', function() {
		var job =  new Job({
			paths : ['/index.html'],
		});
		job.paths.length.should.not.equal(0);
	});

});