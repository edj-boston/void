Void [![npm](https://img.shields.io/npm/v/void.svg)](https://www.npmjs.com/package/void) [![Build Status](https://travis-ci.org/edj-boston/void.svg?branch=master)](https://travis-ci.org/edj-boston/void) [![Coverage Status](https://coveralls.io/repos/edj-boston/void/badge.svg?branch=master&service=github)](https://coveralls.io/github/edj-boston/void?branch=master) [![Dependency Status](https://david-dm.org/edj-boston/void.svg)](https://david-dm.org/edj-boston/void) [![devDependency Status](https://david-dm.org/edj-boston/void/dev-status.svg)](https://david-dm.org/edj-boston/void#info=devDependencies)
====

[Void](https://github.com/edj-boston/void) is a NodeJS [module](https://www.npmjs.org/package/void) that intelligently invalidates your CloudFront cache. It respects the following CloudFront limitations:

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

Void requires a third environment variable that contains the CloudFront distribution id:

	DISTRIBUTION_ID

__WARNING:__ Do _not_ place your AWS credentials or CloudFront Distribution ID in source control!

Follow your hosting provider's instructions for setting environment variables in production:

* [Heroku](https://devcenter.heroku.com/articles/nodejs-support#environment)
* [AWS Elastic Beanstalk](http://docs.aws.amazon.com/gettingstarted/latest/deploy/envvar.html)


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


Options
-------
| name | description | default |
|------|-------------|---------|
| `accessKeyId` | The AWS Access Key ID | `process.env.AWS_ACCESS_KEY_ID` |
| `secretAccessKey` | The AWS secret access key | `process.env.AWS_SECRET_ACCESS_KEY` |
| `name` | Random name for logging, can be overridden | `Math.random().toString(36).substr(2, 5).toUpperCase()` |
| `distribution` | AWS distribution id | `process.env.DISTRIBUTION_ID` |
| `paths` | Array of paths to be cleared | `[ '/*' ]` |
| `dirs` | Array of local directories to be scanned and added to `paths` | `[]` |
| `poison` | Array of paths to be removed from `paths` | `[]` |
| `maxPaths` | Max number of paths per invalidation | `2` |
| `maxJobs` | Max number of simultaneous `Job` objects | `3` |
| `logger` | An optional log function | `console.log` |
| `cloudfront` | A credentialed AWS-SDK object | `new AWS.CloudFront()` |
| `createInterval` | Minutes to wait before retrying to create an invalidation | `2` |
| `createTimeout` | Minutes to wait after 'running' status to quit trying to create an invalidation | `30` |
| `checkDelay` | Minutes to wait before the first status check | `10` |
| `checkInterval` | Minutes to wait between the 2nd and Nth status checks | `2` |
| `checkTimeout` | Minutes to wait after the invalidation is created to quit and stop checking for progress | `20` |
| `callback` | Function to call when completed | `null` |


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


Development
-----------

Clone the repo, cd to your local copy, install deps, and run gulp:

```
$ cd void
$ npm install
$ gulp
```

Gulp will watch the lib and test directories, run tests, and display coverage data.


__WARNING:__ Tests will fail unless you have the `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `DISTRIBUTION_ID` variables configured in your environment!


Notes
-----

1. You may incur charges if you invalidate your CloudFront cache frequently. Please see their [documentation](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html#PayingForInvalidation) and pricing.
2. Again… do NOT put your AWS credentials or CloudFront distribution id in source control.


To do
-----

1. `Void` event callbacks
2. Document `Job` object
