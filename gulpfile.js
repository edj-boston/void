'use strict';

const coveralls = require('gulp-coveralls'),
    david       = require('gulp-david'),
    eslint      = require('gulp-eslint'),
    gulp        = require('gulp'),
    istanbul    = require('gulp-istanbul'),
    mocha       = require('gulp-mocha'),
    rules       = require('edj-eslint-rules'),
    sequence    = require('gulp-sequence');


// Instrument the code
gulp.task('cover', () => {
    return gulp.src([
        'lib/*.js',
        '!lib/FakeCloudFront.js'
    ])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});


// Run tests and product coverage
gulp.task('test', () => {
    return gulp.src('test/*.js')
        .pipe(mocha({
            require : [ 'should' ]
        }))
        .pipe(istanbul.writeReports())
        .pipe(istanbul.enforceThresholds({
            thresholds : { global : 68 }
        }));
});


// Run tests and product coverage
gulp.task('coveralls', () => {
    return gulp.src('coverage/lcov.info')
        .pipe(coveralls());
});


// Lint as JS files (including this one)
gulp.task('lint', () => {
    return gulp.src([
        '*.js',
        'lib/*.js',
        'test/*.js',
        '!node_modules/**'
    ])
    .pipe(eslint({
        extends       : 'eslint:recommended',
        env           : [ 'node', 'mocha' ],
        parserOptions : { 'ecmaVersion' : 6 },
        rules
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});


// Check deps with David service
gulp.task('deps', () => {
    return gulp.src('package.json')
        .pipe(david());
});


// Build macro
gulp.task('build', done => {
    sequence('cover', 'test', 'lint')(done);
});


// Macro for Travis
gulp.task('travis', done => {
    sequence('build', 'coveralls')(done);
});


// Task for local development
gulp.task('default', [ 'deps', 'build' ], () => {
    gulp.watch([
        'lib/*',
        'test/*'
    ], [ 'build' ]);
});
