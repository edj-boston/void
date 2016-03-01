'use strict';

const FakeCF = require('../lib/FakeCloudFront'),
    Job  = require('../lib/Job');


describe('Job#construct', () => {
    it('should have a 5 character name property', () => {
        const job =  new Job({
            cloudfront     : new FakeCF(),
            createInterval : 0,
            checkDelay     : 0,
            checkInterval  : 0
        });
        job.name.length.should.equal(5);
    });

    it('should have at least one path item', () => {
        const job =  new Job({
            cloudfront     : new FakeCF(),
            paths          : [ '/index.html' ],
            createInterval : 0,
            checkDelay     : 0,
            checkInterval  : 0
        });
        job.paths.length.should.not.equal(0);
    });

    it('should re-check in progress jobs', () => {
        const job =  new Job({
            cloudfront     : new FakeCF(),
            paths          : [ '/index.html' ],
            createInterval : 0,
            checkDelay     : 0,
            checkInterval  : 0
        });
        job.run();
        job.create();
        job.check();
        job.check();
        job.status.should.equal('complete');
    });

    it('should handle job errors', () => {
        const job =  new Job({
            name           : 'error',
            cloudfront     : new FakeCF(),
            paths          : [ '/index.html' ],
            createInterval : 0,
            checkDelay     : 0,
            checkInterval  : 0
        });
        job.run();
        job.create();
        job.check();
        job.check();
        job.status.should.equal('complete');
    });


    it('should be able to log', done => {
        const job =  new Job({
            cloudfront : new FakeCF(),
            paths      : [ '/index.html' ],
            logger     : message => {
                return message;
            }
        });
        job.log('Something').should.equal(`[Job:${job.name}] Something`);
        done();
    });
});
