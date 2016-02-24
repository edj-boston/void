/* eslint no-console:0 */
'use strict';

const AWS = require('aws-sdk'),
    Job = require('./Job.js'),
    extend = require('jquery-extend'),
    scan = require('./scan.js');


class Void {
    constructor (options) {
        const defaults = {
            name         : Math.random().toString(36).substr(2, 5).toUpperCase(), // Random name for logging, can be overridden
            distribution : process.env.DISTRIBUTION_ID, // AWS distribution id
            paths        : [ '/*' ], // Paths to be cleared (default to distrubution wildcard)
            dirs         : [], // Dirs to be scanned and added to `paths`
            poison       : [], // Paths to be removed from `paths`
            queue        : [], // Queue of invalidations
            maxPaths     : 2,  // Max number of paths per invalidation
            maxJobs      : 3,  // Max number of simultaneous `Job` objects
            logger       : console.log, // An optional log function
            cloudfront   : new AWS.CloudFront() // Credentialed AWS-SDK object
        };

        // Extend `this` by our `defaults` and `options`
        extend(true, this, defaults, options);

        // Recurse `dirs` and add to `paths`
        this.dirs.forEach(dir => {
            const paths = scan(dir);
            this.paths = this.paths.concat(paths);
        }, this);

        // Remove `poison` items from `paths`
        this.poison.forEach(path => {
            const i = this.paths.indexOf(path);
            if (i > -1) this.paths.splice(i, 1);
        }, this);

        // Batch up paths into jobs and place them in the queue
        this.populateQueue();

        // Run the max number of jobs (or all jobs if fewer than max)
        const max = (this.queue.length < this.maxJobs) ? this.queue.length : this.maxJobs;
        for (let i = 0; i < max; i++) this.queue[i].run();
    }

    runNextJob (err) {
        if (err) this.err(err);

        let counter = 0;
        for (let i = 0; i < this.queue.length; i++) {
            const job = this.queue[i];
            if (job.status == 'paused') {
                job.run();
                return;
            } else if (job.status == 'complete') {
                counter++;
            }
        }
        if (counter == this.queue.length) this.log('All jobs complete!');
    }

    populateQueue () {
        let counter = 0;

        for (let i = 0, j = this.paths.length; i < j; i += this.maxPaths) {
            const subset = this.paths.slice(i, i + this.maxPaths);

            const job = new Job({
                prefix   : `[Void:${this.name}]`,
                paths    : subset,
                complete : this.runNextJob.bind(this),
                logger   : this.logger
            });

            this.queue.push(job);

            counter++;
        }

        this.log(`Created ${counter} item(s) in the queue`);
    }

    log (message) {
        return this.logger(`[Void:${this.name}] ${message}`);
    }

    err (message) {
        throw new Error(`[Void:${this.name}] ${message}`);
    }
}

// Export the constructor
module.exports = Void;
