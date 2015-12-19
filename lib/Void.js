// External dependancies
var AWS = require('aws-sdk'),
    extend = require('jquery-extend'),
    Job = require('./Job.js'),
    scan = require('./scan.js');

// Constructor
var Void = function( options ) {

    // Defaults
    var defaults = {
        name         : Math.random().toString(36).substr(2, 5).toUpperCase(), // Random name for logging, can be overridden
        distribution : process.env.DISTRIBUTION_ID, // AWS distribution id
        paths        : ['/*'], // Paths to be cleared (default to distrubution wildcard)
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
    this.dirs.forEach(function(dir) {
        var paths = scan(dir);
        this.paths = this.paths.concat(paths)
    }, this);

    // Remove `poison` items from `paths`
    this.poison.forEach(function(path) {
        var i = this.paths.indexOf(path);
        if( i > -1 ) this.paths.splice(i, 1);
    }, this);

    // Batch up paths into jobs and place them in the queue
    this.populateQueue();

    // Run the max number of jobs (or all jobs if fewer than max)
    var max = ( this.queue.length < this.maxJobs ) ? this.queue.length : this.maxJobs;
    for(i=0; i<max; i++) this.queue[i].run();

};


// Callback to loop over the queue and activate a job or notify when complete
Void.prototype.runNextJob = function(err, data) {
    if(err) this.err(err);

    var counter = 0;
    for(i=0; i<this.queue.length; i++) {
        var job = this.queue[i];
        if(job.status == 'paused') {
            job.run();
            return;
        } else if(job.status == 'complete') {
            counter++;
        }
    }
    if( counter == this.queue.length ) this.log('All jobs complete!');
};


// Batch up our raw data into jobs and place them in the queue
Void.prototype.populateQueue = function() {
    var counter = 0;

    for(i=0, j=this.paths.length; i<j; i+=this.maxPaths) {
        var subset = this.paths.slice(i, i+this.maxPaths);

        var job = new Job({
            prefix   : '[Void:' + this.name + ']',
            paths    : subset,
            complete : this.runNextJob.bind(this),
            logger   : this.logger
        });

        this.queue.push(job);

        counter++;
    }

    this.log('Created ' + counter + ' item(s) in the queue');
}


// Log labeled messages
Void.prototype.log = function( message ) {
    return this.logger('[Void:' + this.name + '] ' + message);
}


// Throw labeled errors
Void.prototype.err = function( message ) {
    throw new Error('[Void:' + this.name + '] ' + message);
}


// Export the constructor
module.exports = Void;