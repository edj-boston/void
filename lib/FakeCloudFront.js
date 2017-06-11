/* eslint callback-return:0 */
'use strict';

const extend = require('jquery-extend');

class FakeCloudFront {
    constructor (options) {
        const defaults = {
            invalidations    : [],
            throwCreateError : null,
            throwCheckError  : null
        };

        // Extend `this` by our `defaults` and `options`
        extend(true, this, defaults, options);
    }

    createInvalidation (params, callback) {
        if (this.throwCreateError) {
            callback(this.throwCreateError);
            return;
        }

        const invalidation = {
            Id     : `ID${Math.floor(Math.random() * 1000000000000)}`,
            Status : 'InProgress'
        };
        this.invalidations.push(invalidation);

        return callback(null, invalidation);
    }

    getInvalidation (params, callback) {
        if (this.throwCheckError) {
            callback(this.throwCheckError);
            return;
        }

        const inv = this.invalidations.find(invalidation => {
            return (invalidation.Id == params.Id);
        });

        if (inv.Status == 'InProgress') {
            callback(null, inv);
            inv.Status = 'Completed';
        } else {
            callback(null, inv);
        }
    }
}

module.exports = FakeCloudFront;
