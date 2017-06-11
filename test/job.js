'use strict';

const FakeCF = require('../lib/FakeCloudFront'),
    Job  = require('../lib/Job');


describe('Job#construct', () => {
    it('should have a 5 character name property', () => {
        let job =  new Job({
            cloudfront     : new FakeCF(),
            createInterval : 0,
            checkDelay     : 0,
            checkInterval  : 0,
            logger         : () => {
                return;
            }
        });
        job.name.length.should.equal(5);
        job = undefined;
    });

    it('should have at least one path item', () => {
        let job =  new Job({
            cloudfront     : new FakeCF(),
            paths          : [ '/index.html' ],
            createInterval : 0,
            checkDelay     : 0,
            checkInterval  : 0,
            logger         : () => {
                return;
            }
        });
        job.paths.length.should.not.equal(0);
        job = undefined;
    });

    it('should re-check in progress jobs', () => {
        let job =  new Job({
            cloudfront     : new FakeCF(),
            paths          : [ '/index.html' ],
            createInterval : 0,
            checkDelay     : 0,
            checkInterval  : 0,
            logger         : () => {
                return;
            }
        });
        job.run();
        job.create();
        job.check();
        job.check();
        job.status.should.equal('complete');
        job = undefined;
    });

    it('should obey the timeout for creating new jobs', done => {
        let storedMessage = '';
        let job =  new Job({
            cloudfront    : new FakeCF(),
            paths         : [ '/index.html' ],
            createTimeout : -1,
            logger        : message => {
                storedMessage = message;
            }
        });
        job.run();
        job.create();
        job.id.should.equal('');
        storedMessage.should.equal(`[Job:${job.name}] Timeout: could not create invalidation after ${job.createTimeout} minutes`);
        job = undefined;
        done();
    });

    it('should obey the timeout for creating new jobs and fire a callback', done => {
        let storedMessage = '';
        let job =  new Job({
            cloudfront    : new FakeCF(),
            paths         : [ '/index.html' ],
            createTimeout : -1,
            timeout       : (err, message) => {
                if (err) throw err;
                storedMessage = message;
            },
            logger : () => {
                return;
            }
        });
        job.run();
        job.create();
        job.id.should.equal('');
        storedMessage.should.equal(`Timeout: could not create invalidation after ${job.createTimeout} minutes`);
        job = undefined;
        done();
    });

    it('should handle generic errors in the callback for creating an invalidation', done => {
        let storedMessage = '';
        let job =  new Job({
            cloudfront : new FakeCF({
                throwCreateError : { message : 'some message' }
            }),
            paths  : [ '/index.html' ],
            logger : message => {
                storedMessage = message;
            }
        });
        job.run();
        job.create();
        storedMessage.should.equal(`[Job:${job.name}] Failed: some message`);
        job = undefined;
        done();
    });

    it('should handle TooManyInvalidationsInProgress error in the callback for creating an invalidation', done => {
        let storedMessage = '';
        let job =  new Job({
            cloudfront : new FakeCF({
                throwCreateError : { code : 'TooManyInvalidationsInProgress' }
            }),
            paths  : [ '/index.html' ],
            logger : message => {
                storedMessage = message;
            }
        });
        job.run();
        job.create();
        storedMessage.should.equal(`[Job:${job.name}] Too many invalidations, retrying in ${job.createInterval} minute(s)`);
        job = undefined;
        done();
    });

    it('should handle generic errors in the callback for checking an invalidation', done => {
        let storedMessage = '';
        let job =  new Job({
            cloudfront : new FakeCF({
                throwCheckError : { message : 'some message' }
            }),
            paths  : [ '/index.html' ],
            logger : message => {
                storedMessage = message;
            }
        });
        job.run();
        job.create();
        job.check();
        storedMessage.should.equal(`[Job:${job.name}] Failed: some message`);
        job = undefined;
        done();
    });

    it('should obey the timeout for checking existing jobs', done => {
        let storedMessage = '';
        let job =  new Job({
            cloudfront   : new FakeCF(),
            paths        : [ '/index.html' ],
            checkTimeout : -1,
            logger       : message => {
                storedMessage = message;
            }
        });
        job.run();
        job.create();
        job.check();
        storedMessage.should.equal(`[Job:${job.name}] Timeout: stopped checking invalidation after ${job.checkTimeout} minutes`);
        job = undefined;
        done();
    });

    it('should obey the timeout for checking existing jobs and fire a callback', done => {
        let storedMessage = '';
        let job =  new Job({
            cloudfront   : new FakeCF(),
            paths        : [ '/index.html' ],
            checkTimeout : -1,
            timeout      : (err, message) => {
                if (err) throw err;
                storedMessage = message;
            },
            logger : () => {
                return;
            }
        });
        job.run();
        job.create();
        job.check();
        storedMessage.should.equal(`Timeout: stopped checking invalidation after ${job.checkTimeout} minutes`);
        job = undefined;
        done();
    });

    it('should handle job errors', () => {
        let job =  new Job({
            name           : 'error',
            cloudfront     : new FakeCF(),
            paths          : [ '/index.html' ],
            createInterval : 0,
            checkDelay     : 0,
            checkInterval  : 0,
            logger         : () => {
                return;
            }
        });
        job.run();
        job.create();
        job.check();
        job.check();
        job.status.should.equal('complete');
        job = undefined;
    });


    it('should be able to log', done => {
        let job =  new Job({
            cloudfront : new FakeCF(),
            paths      : [ '/index.html' ],
            logger     : message => {
                return message;
            }
        });
        job.log('Something').should.equal(`[Job:${job.name}] Something`);
        job = undefined;
        done();
    });
});
