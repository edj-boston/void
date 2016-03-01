/* eslint callback-return:0 */
'use strict';

class FakeCloudFront {
    constructor () {
        this.invalidations = [];
    }

    createInvalidation (params, callback) {
        switch (this.invalidations.length) {
        case 7: {
            return callback('TooManyInvalidationsInProgress');
        }
        case 8: {
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
        const inv = this.invalidations.find(invalidation => {
            return (invalidation.Id == params.Id);
        });

        if (inv.Status == 'InProgress') {
            callback(null, inv);
            inv.Status = 'Completed';
        } else if (params.name == 'error') {
            callback('error');
        } else {
            callback(null, inv);
        }
    }
}

module.exports = FakeCloudFront;
