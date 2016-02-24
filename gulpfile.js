'use strict';

const coveralls = require('gulp-coveralls'),
    eslint    = require('gulp-eslint'),
    gulp      = require('gulp'),
    istanbul  = require('gulp-istanbul'),
    mocha     = require('gulp-mocha'),
    rules     = require('edj-eslint-rules');


// instrument the code
gulp.task('cover', () => {
    return gulp.src('lib/*.js')
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});


// Run tests and product coverage
gulp.task('test', [ 'cover' ], () => {
    return gulp.src('test/*.js')
        .pipe(mocha({
            require : [ 'should' ]
        }))
        .pipe(istanbul.writeReports())
        .pipe(istanbul.enforceThresholds({
            thresholds : {
                global : 8
            }
        }));
});


// Run tests and product coverage
gulp.task('coveralls', [ 'test' ], () => {
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
        extends : 'eslint:recommended',
        env     : { node : true, es6 : true, mocha : true },
        globals : { $ : true, window : true, document : true, ga : true },
        rules
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});


// Task for local development
gulp.task('default', [ 'lint' ], () => {
    gulp.watch([
        'lib/*',
        'test/*'
    ], [ 'lint' ]);
});
