'use strict';

const Void   = require('../lib/Void.js');


describe('Void#populateQueue', () => {
    it('should have a queue of length 6', () => {
        const v = new Void({
            paths : [ '/css/custom.css', '/index.html' ],
            dirs  : [ 'test/static' ]
        });
        v.queue.length.should.equal(6);
    });

    it('should have a queue of length 5 because of the poison list', () => {
        const v = new Void({
            paths  : [ '/css/custom.css', '/index.html' ],
            dirs   : [ 'test/static' ],
            poison : [ '/test1.html', '/test2.html' ]
        });
        v.queue.length.should.equal(5);
    });

    it('should be capable of custom logging', () => {
        const v = new Void({
            logger : message => {
                return message;
            }
        });
        v.log('Something').should.equal(`[Void:${v.name}] Something`);
    });
});
