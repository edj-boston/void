/* eslint no-console:0 */
'use strict';

const AWS = require('aws-sdk'),
    Job = require('./Job.js'),
    extend = require('jquery-extend'),
    scan = require('./scan.js');


class Void {
    constructor (options) {
        const defaults = {
            accessKeyId     : process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY,
            name            : Math.random().toString(36).substr(2, 5).toUpperCase(), // Random name for logging, can be overridden
            distribution    : process.env.DISTRIBUTION_ID, // AWS distribution id
            paths           : [ '/*' ], // Paths to be cleared (default to distrubution wildcard)
            dirs            : [], // Dirs to be scanned and added to `paths`
            poison          : [], // Paths to be removed from `paths`
            maxPaths        : 2,  // Max number of paths per invalidation
            maxJobs         : 3,  // Max number of simultaneous `Job` objects
            logger          : console.log, // An optional log function
            cloudfront      : new AWS.CloudFront(), // Credentialed AWS-SDK object
            createInterval  : 2, // Minutes to wait before retrying to create an `Invalidation`
            createTimeout   : 30, // Minutes to wait after 'running' status to quit trying to create an invalidation
            checkDelay      : 10, // Minutes to wait before the first status check
            checkInterval   : 2,  // Minutes to wait between 2nd-Nth status checks
            checkTimeout    : 20, // Minutes to wait after the invalidation is created to quit and stop checking for progress
            callback        : null // Function to call when completed
        };

        // Extend `this` by our `defaults` and `options`
        extend(true, this, defaults, options);

        // Prop to store invalidations
        this.queue = [];

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
        if (counter == this.queue.length) {
            this.log('All jobs complete!');
            this.callback();
        }

        return this;
    }

    populateQueue () {
        let counter = 0;

        for (let i = 0, j = this.paths.length; i < j; i += this.maxPaths) {
            const subset = this.paths.slice(i, i + this.maxPaths);

            const job = new Job({
                cloudfront     : this.cloudfront,
                prefix         : `[Void:${this.name}]`,
                paths          : subset,
                complete       : this.runNextJob.bind(this),
                logger         : this.logger,
                createInterval : this.createInterval,
                createTimeout  : this.createTimeout,
                checkDelay     : this.checkDelay,
                checkInterval  : this.checkInterval,
                checkTimeout   : this.checkTimeout,
                distribution   : this.distribution,
            });

            this.queue.push(job);

            counter++;
        }

        this.log(`Created ${counter} item(s) in the queue`);

        return this;
    }

    log (message) {
        this.logger(`[Void:${this.name}] ${message}`);

        return this;
    }

    err (message) {
        throw new Error(`[Void:${this.name}] ${message}`);
    }
}

// Export the constructor
module.exports = Void;
