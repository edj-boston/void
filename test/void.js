'use strict';

const FakeCF = require('../lib/FakeCloudFront'),
    Void = require('../lib/Void.js');


describe('Void#populateQueue', () => {
    it('should have a queue of length 6', done => {
        const v = new Void({
            cloudfront     : new FakeCF(),
            paths          : [ '/css/custom.css', '/index.html' ],
            dirs           : [ 'test/static' ],
            createInterval : 0,
            checkDelay     : 0,
            checkInterval  : 0,
            callback       : done
        });
        v.queue.length.should.equal(6);
    });

    it('should have a queue of length 5 because of the poison list', done => {
        const v = new Void({
            cloudfront     : new FakeCF(),
            paths          : [ '/css/custom.css', '/index.html' ],
            dirs           : [ 'test/static' ],
            poison         : [ '/test1.html', '/test2.html' ],
            createInterval : 0,
            checkDelay     : 0,
            checkInterval  : 0,
            callback       : done
        });
        v.queue.length.should.equal(5);
    });

    it('should be capable of custom logging', done => {
        const v = new Void({
            cloudfront     : new FakeCF(),
            createInterval : 0,
            checkDelay     : 0,
            checkInterval  : 0,
            callback       : done,
            logger         : message => {
                return message;
            }
        });
        v.log('Something').should.equal(`[Void:${v.name}] Something`);
    });

    it('should be capable of custom errors', done => {
        const name = 'test';
        (function () {
            const v = new Void({
                name,
                cloudfront     : new FakeCF(),
                createInterval : 0,
                checkDelay     : 0,
                checkInterval  : 0,
                callback       : done
            });
            v.runNextJob('Error');
        }).should.throw(`[Void:${name}] Error`);
    });
});
