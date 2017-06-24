'use strict';

const FakeCF = require('../lib/FakeCloudFront'),
    Job  = require('../lib/Job');


describe('Job', () => {
    it('should have a 5 character name property', () => {
        const job =  new Job({
            cloudfront     : new FakeCF(),
            createInterval : 0,
            checkDelay     : 0,
            checkInterval  : 0,
            logger         : () => {
                return;
            }
        });
        job.name.length.should.equal(5);
    });

    it('should have at least one path item', () => {
        const job =  new Job({
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
    });

    describe('#create', () => {
        it('should obey the timeout for creating new jobs', () => {
            let storedMessage = '';
            const job =  new Job({
                cloudfront    : new FakeCF(),
                paths         : [ '/index.html' ],
                createTimeout : -1,
                logger        : message => {
                    storedMessage = message;
                }
            });
            job.run().create();
            storedMessage.should.equal(`[Job:${job.name}] Timeout: could not create invalidation after ${job.createTimeout} minutes`);
        });

        it('should obey the timeout for creating new jobs and fire a callback', () => {
            let storedMessage = '';
            const job =  new Job({
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
            job.run().create();
            storedMessage.should.equal(`Timeout: could not create invalidation after ${job.createTimeout} minutes`);
        });
    });

    describe('#check', () => {
        it('should re-check in progress jobs', () => {
            const job =  new Job({
                cloudfront     : new FakeCF(),
                paths          : [ '/index.html' ],
                createInterval : 0,
                checkDelay     : 0,
                checkInterval  : 0,
                logger         : () => {
                    return;
                }
            });
            job.run().create().check().check();
            job.status.should.equal('complete');
        });

        it('should handle job errors', () => {
            const job =  new Job({
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
            job.run().create().check().check();
            job.status.should.equal('complete');
        });
    });

    describe('#log', () => {
        let storedMessage = '';
        it('should be able to log', () => {
            const job =  new Job({
                cloudfront : new FakeCF(),
                paths      : [ '/index.html' ],
                logger     : message => {
                    storedMessage = message;
                }
            });
            job.log('Something');
            storedMessage.should.equal(`[Job:${job.name}] Something`);
        });
    });
});
