// External dependencies
var AWS = require('aws-sdk'),
	extend = require('jquery-extend');


// Constructor
var Job = function( options ) {

	// Defaults
	var defaults = {
		name   : Math.random().toString(36).substr(2, 5).toUpperCase(), // Random name for logging, can be overridden
		prefix : '', // Optional prefix for logging
		id     : '', // Assigned by CloudFront
		paths  : [], // Array of paths
		status : 'paused', // Status string, one of 'paused', 'running', 'complete'
		cloudfront     : new AWS.CloudFront(), // Credentialed AWS-SDK object
		distribution   : process.env.DISTRIBUTION_ID,
		running   : null, // Timestamp when the job started running
		checking  : null, // Timestamp when the invalidation was created
		createInterval : 2, // Minutes to wait before retrying to create an `Invalidation`
		createTimeout  : 30, // Minutes to wait after 'running' status to quit trying to create an invalidation
		checkDelay     : 10, // Minutes to wait before the first status check
		checkInterval  : 2,  // Minutes to wait between 2nd-Nth status checks
		checkTimeout   : 20, // Minutes to wait after the invalidation is created to quit and stop checking for progress
		complete : null, // Optional callback to fire when invalidation completes
		timeout  : null // Optional callback to fire when invalidation completes
	};

	// Extend `this` by our `defaults` and `options`
	extend(true, this, defaults, options);

	// Return this for chaining
	return this;
}


// Run the job
Job.prototype.run = function() {
	this.status = 'running';
	this.running = +new Date;
	this.create();
}


// Attempt to create the invalidation
Job.prototype.create = function() {

	// See if we've timed out
	if( (+new Date-this.running) > this.createTimeout * 60000 ) {
		var message = 'Timeout: could not create invalidation after ' + this.createTimeout + ' minutes';
		this.log(message);
		if(typeof this.timeout == 'function') this.timeout(null, message, this);
		return;
	}

	// Setup some data for the API
	var params = {
		DistributionId: this.distribution,
		InvalidationBatch: {
			CallerReference: this.name,
			Paths: {
				Quantity: this.paths.length,
				Items: this.paths
			}
		}
	};

	// Send the request to AWS CloudFront
	this.cloudfront.createInvalidation(params, function(err, data) {
		if(err) {
			if(err.code == 'TooManyInvalidationsInProgress') {
				this.log('Too many invalidations, retrying in ' + this.createInterval + ' minute(s)');
				setTimeout(this.create.bind(this), this.createInterval*60000);
			} else {
				this.log('Failed: ' + err.message);
			}
		} else {
			this.id = data.Id;
			this.log('Invalidation "' + this.id + '" created. Checking in ' + this.checkDelay + ' minute(s)...');
			this.checking = +new Date;
			setTimeout(this.check.bind(this), this.checkDelay*60000);
		}
	}.bind(this));
}


// Get the invalidation status from the API
Job.prototype.check = function() {

	// See if we've timed out
	if( (+new Date-this.checking) > this.checkTimeout * 60000 ) {
		var message = 'Timeout: stopped checking invalidation after ' + this.checkTimeout + ' minutes';
		this.log(message);
		if(typeof this.timeout == 'function') this.timeout(null, message, this);
		return;
	}

	// Setup some data for the API
	var params = {
		DistributionId: this.distribution,
		Id: this.id
	};

	// Send the request to AWS CloudFront
	this.cloudfront.getInvalidation(params, function(err, data) {
		if (err) {
			this.log(err, err.stack);
			this.complete(err);
			return;
	  	}

	  	// Handle the status we get back
  		switch( data.Status ) {
  			case 'InProgress':
		  		this.log('In progress, re-checking in ' + this.checkInterval + ' minute(s)...');
				setTimeout(this.check.bind(this), this.checkInterval*60000);
				return;
  			case 'Completed':
	  			this.status = 'complete';
	  			var message = 'Invalidation "' + this.id + '" completed!';
		  		this.log(message);
		  		if(typeof this.complete == 'function') this.complete(null, message, this);
		  		return;
			default:
	  			console.log(data); // something unexpected happened
	  			return;
		}

	}.bind(this));
}


// Log labeled messages
Job.prototype.log = function( message ) {
	message = '[Job:' + this.name + '] ' + message;
	if( this.prefix ) message = this.prefix + message;
	console.log(message);
}


// Throw labeled errors
Job.prototype.err = function( message ) {
	message = '[Job:' + this.name + '] ' + message;
	if( this.prefix ) message = this.prefix + message;
	throw new Error(message);
}


// Export the constructor
module.exports = Job;