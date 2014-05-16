Void [![Build Status](https://travis-ci.org/edj-boston/void.svg?branch=master)](https://travis-ci.org/edj-boston/void)
====

[Void](https://github.com/edj-boston/void) is a NodeJS [module](https://www.npmjs.org/package/teleshenvoidmodule) that intelligently invalidates your CloudFront Cache. It respects the following limitations:

* Hard limit of 1000 paths per invalidation
* Only 3 invalidations can run at the same time (and other processes may be creating them too)
* There is no callback for the native AWS SDK, so the API must be polled


Installation
------------

	$ npm install void


Void relies on the [AWS-SDK](https://www.npmjs.org/package/aws-sdk), which requires that you set two environment variables:

	AWS_ACCESS_KEY_ID
	AWS_SECRET_ACCESS_KEY

You can [export](http://www.cyberciti.biz/faq/linux-unix-shell-export-command/) them in the shell for local testing or permanent use. You can also load them into your environment using a tool like [supervisor](https://www.npmjs.org/package/supervisor) or [foreman](http://ddollar.github.io/foreman/) to load an .env file.

Follow your hosting provider's instructions for setting environment variables in production:

* [Heroku](https://devcenter.heroku.com/articles/nodejs-support#environment)
* [AWS Elastic Beanstalk](http://docs.aws.amazon.com/gettingstarted/latest/deploy/envvar.html)

Void requires a third environment variable that contains the CloudFront distribution id:

	DISTRIBUTION_ID

__WARNING:__ Do _not_ place your AWS credentials or CloudFront Distribution ID in source control!


Usage
-----

Require void at the top of your script.

```js
var Void = require('void');
```

Call the constructor with the `new` keyword.

```js
var v = new Void();
```

_Note:_ Use a capital "V" for the constructor and a single, lowercase "v" to avoid collision with the reserved word "void".


Arguments
---------

* __name:__ will default to a 5 character string for logging
* __distribution:__ will default to `process.env.DISTRIBUTION_ID`
* __paths:__ Array of path strings to be cleared
* __dirs:__ Array of directories to be scanned and added to `paths`
* __poison:__ Array of path strings to be removed from `paths`
* __maxPaths:__ Max number of paths per invalidation (defaults to 1000)
* __maxJobs:__ Max number of simultaneous invalidations (defaults to 3)


Properties
----------

* __queue:__ Queue of invalidations
* __cloudfront:__ The AWS-SDK object


Example
-------

We can change the default `maxPaths` method to see some complex behavior:

```js
var v = new Void({
	paths : [
		'/index.html',
		'/index2.html',
		'/foo/bar.html',
		'/foo2/bar2.html'
	],
	maxPaths : 1
});
```

This will result in the the following console output:

```
[Void:IWZ33] Created 4 item(s) in the queue
[Void:IWZ33][Job:H27NL] Invalidation "IVBLZ2PCXZL5Q" created. Checking in 10 minute(s)...
[Void:IWZ33][Job:JD9ZU] Invalidation "I35PDGSFYBCA1X" created. Checking in 10 minute(s)...
[Void:IWZ33][Job:H1C3R] Too many invalidations, retrying in 2 minute(s)
[Void:IWZ33][Job:H1C3R] Too many invalidations, retrying in 2 minute(s)
[Void:IWZ33][Job:H1C3R] Too many invalidations, retrying in 2 minute(s)
[Void:IWZ33][Job:H1C3R] Too many invalidations, retrying in 2 minute(s)
[Void:IWZ33][Job:H1C3R] Too many invalidations, retrying in 2 minute(s)
[Void:IWZ33][Job:H27NL] In progress, re-checking in 2 minute(s)...
[Void:IWZ33][Job:JD9ZU] In progress, re-checking in 2 minute(s)...
[Void:IWZ33][Job:H1C3R] Too many invalidations, retrying in 2 minute(s)
[Void:IWZ33][Job:H27NL] In progress, re-checking in 2 minute(s)...
[Void:IWZ33][Job:JD9ZU] In progress, re-checking in 2 minute(s)...
[Void:IWZ33][Job:H1C3R] Invalidation "I13B9HSQI6RO7J" created. Checking in 10 minute(s)...
[Void:IWZ33][Job:JD9ZU] Invalidation "I35PDGSFYBCA1X" completed!
[Void:IWZ33][Job:H27NL] Invalidation "IVBLZ2PCXZL5Q" completed!
[Void:IWZ33][Job:7BTD7] Invalidation "I3HRQCLJU7OSZ7" created. Checking in 10 minute(s)...
[Void:IWZ33][Job:H1C3R] Invalidation "I13B9HSQI6RO7J" completed!
[Void:IWZ33][Job:7BTD7] In progress, re-checking in 2 minute(s)...
[Void:IWZ33][Job:7BTD7] Invalidation "I3HRQCLJU7OSZ7" completed!
[Void:IWZ23] All jobs complete!
```


Tests
-----

Install the global dependancies with sudo permissions.

```
$ sudo npm install -g mocha
$ sudo npm install -g should
```

Run mocha directly to see the test results.

```
$ cd void
$ mocha
```

__WARNING:__ Tests will fail unless you have the `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `DISTRIBUTION_ID` variables configured in your environment!


Notes
-----

1. You may incur charges if you invalidate your CloudFront cache frequently. Please see their [documentation](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html#PayingForInvalidation) and pricing.
2. Again… do NOT put your AWS credentials or CloudFront distribution id in source control.


To do
-----

1. More tests
2. Surface granular `Job` properties in `Void` constructor for more flexibility
3. `Void` event callbacks
4. Document `Job` object
