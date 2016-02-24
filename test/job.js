'use strict';

const Job = require('../lib/Job.js');


describe('Job#construct', () => {
    it('should have a 5 character name property', () => {
        const job =  new Job;
        job.name.length.should.equal(5);
    });

    it('should have at least one path item', () => {
        const job =  new Job({
            paths : [ '/index.html' ]
        });
        job.paths.length.should.not.equal(0);
    });

    it('should be able to log', () => {
        const job =  new Job({
            paths  : [ '/index.html' ],
            logger : message => {
                return message;
            }
        });
        job.log('Something').should.equal(`[Job:${job.name}] Something`);
    });
});
