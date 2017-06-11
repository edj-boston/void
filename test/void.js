'use strict';

const FakeCF = require('../lib/FakeCloudFront'),
    Void = require('../lib/Void.js');


describe('Void#populateQueue', () => {
    it('should have a queue of length 6', done => {
        let v = new Void({
            cloudfront     : new FakeCF(),
            paths          : [ '/css/custom.css', '/index.html' ],
            dirs           : [ 'test/static' ],
            createInterval : 0,
            checkDelay     : 0,
            checkInterval  : 0,
            callback       : done,
            logger         : () => {
                return;
            }
        });
        v.queue.length.should.equal(6);
        v = undefined;
    });

    it('should have a queue of length 5 because of the poison list', done => {
        let v = new Void({
            cloudfront     : new FakeCF(),
            paths          : [ '/css/custom.css', '/index.html' ],
            dirs           : [ 'test/static' ],
            poison         : [ '/test1.html', '/test2.html', 'foobar.html' ],
            createInterval : 0,
            checkDelay     : 0,
            checkInterval  : 0,
            callback       : done,
            logger         : () => {
                return;
            }
        });
        v.queue.length.should.equal(5);
        v = undefined;
    });

    it('should be capable of custom logging', done => {
        let v = new Void({
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
        v = undefined;
    });

    it('should be capable of custom errors', done => {
        const name = 'test';
        (function () {
            let v = new Void({
                name,
                cloudfront     : new FakeCF(),
                createInterval : 0,
                checkDelay     : 0,
                checkInterval  : 0,
                callback       : done,
                logger         : () => {
                    return;
                }
            });
            v.runNextJob('Error');
            v = undefined;
        }).should.throw(`[Void:${name}] Error`);
    });
});
