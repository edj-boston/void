Void
====

A NodeJS module that intelligently invalidates your CloudFront Cache. It respects the following limitations:

* Hard limit of 1000 paths per invalidation
* Only 3 invalidations can run at the same time (and other processes may be creating them too)
* There is no callback for the native AWS SDK, so the API must be polled


Installation
------------

```
$ npm install void
```

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

	[Void:ATP8N] Created 4 item(s) in the queue
	[Void:ATP8N][Job:3OOKD] Invalidation "ICHX4H8Q6VY4E" created. Checking in 10 minute(s)...
	[Void:ATP8N][Job:NMJ33] Invalidation "I18R5EN5BN2XLY" created. Checking in 10 minute(s)...
	[Void:ATP8N][Job:83RH0] Invalidation "I39XPXXVQM3PKY" created. Checking in 10 minute(s)...
	[Void:ATP8N][Job:83RH0] Invalidation "I39XPXXVQM3PKY" completed!
	[Void:ATP8N][Job:NMJ33] Invalidation "I18R5EN5BN2XLY" completed!
	[Void:ATP8N][Job:2V7EE] Invalidation "I2GCM83QRPS72H" created. Checking in 10 minute(s)...
	[Void:ATP8N][Job:3OOKD] Invalidation "ICHX4H8Q6VY4E" completed!
	[Void:ATP8N][Job:2V7EE] Invalidation "I2GCM83QRPS72H" completed!
	[Void:ATP8N] All jobs complete!


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

1. You may incur charges if you invalidate your CloudFront cache frequently. PLease see their (documentation)[http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html#PayingForInvalidation] and pricing.
2. Again… do NOT put your AWS credentials of CloudFront distribution id in source control


To do
-----

1. More tests
2. Surface granual `Job` properties in `Void` constructor for more flexibility
3. Setup Travis CI
4. `Void` event callbacks
5. Document `Job` object
