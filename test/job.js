// External dependancies
var assert = require('assert'),
	should = require('should'),
	Job = require('../lib/Job.js'),
	AWS = require('aws-sdk');


// Constructor
describe('Job', function() {

	/* *
	 * Validation
	 */

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


	/* *
	 * Timeouts
	 */

	it('should timeout while creating the invalidation', function(done) {
		this.timeout(60000 * 20);
		var job = new Job({
			paths : ['/foo/bar.html'],
			createTimeout : 0.1,
			createInterval : 0.1,
			timeout : done
		}).run();
	});

	/*it('should timeout while checking the invalidation', function(done) {
		this.timeout(60000 * 20);
		var job = new Job({
			paths : ['/foo/bar.html'],
			createInterval : 0.1,
			checkTimeout : 0.1,
			checkDelay : 0.1,
			checkInterval : 0.1,
			timeout : function() {
				done();
			}
		});
		job.run();
	});*/

});