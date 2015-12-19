var should = require('should'),
	Void   = require('../lib/Void.js');


describe('Void#populateQueue', function() {

	it('should have a queue of length 6', function() {
		var v = new Void({
			paths : ['/css/custom.css', '/index.html'],
			dirs : ['test/static']
		});
		v.queue.length.should.equal(6);
	});

	it('should have a queue of length 5 because of the poison list', function() {
		var v = new Void({
			paths : ['/css/custom.css', '/index.html'],
			dirs : ['test/static'],
			poison : ['/test1.html', '/test2.html']
		});
		v.queue.length.should.equal(5);
	});

});
