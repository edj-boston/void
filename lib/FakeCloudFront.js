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

        switch (this.invalidations.length) {
            case 15: {
                return callback({ code : 'TooManyInvalidationsInProgress' });
            }
            case 16: {
                return callback('DefaultError');
            }
            default: {
                const invalidation = {
                    Id     : `ID${Math.floor(Math.random() * 1000000000000)}`,
                    Status : 'InProgress'
                };
                this.invalidations.push(invalidation);
                return callback(null, invalidation);
            }
        }
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
        } else if (this.error) {
            callback('error');
        } else {
            callback(null, inv);
        }
    }
}

module.exports = FakeCloudFront;
