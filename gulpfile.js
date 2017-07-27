'use strict';

const depcheck = require('depcheck'),
    g          = require('gulp-load-plugins')(),
    gulp       = require('gulp'),
    rules      = require('@edjboston/eslint-rules');


// Instrument the code
gulp.task('cover', () => {
    return gulp.src('lib/*.js')
        .pipe(g.istanbul())
        .pipe(g.istanbul.hookRequire());
});


// Run tests and produce coverage
gulp.task('test', () => {
    return gulp.src('test/*.js')
        .pipe(g.mocha({
            require : [ 'should' ]
        }))
        .pipe(g.istanbul.writeReports())
        .pipe(g.istanbul.enforceThresholds({
            thresholds : { global : 76 }
        }));
});


// Push coverage data to coveralls
gulp.task('coveralls', () => {
    return gulp.src('coverage/lcov.info')
        .pipe(g.coveralls());
});


// Lint as JS files (including this one)
gulp.task('lint', () => {
    const globs = [
        '*.js',
        'lib/*.js',
        'test/*.js',
        '!node_modules/**'
    ];

    return gulp.src(globs)
        .pipe(g.eslint({
            extends       : 'eslint:recommended',
            parserOptions : { 'ecmaVersion' : 6 },
            rules
        }))
        .pipe(g.eslint.format())
        .pipe(g.eslint.failAfterError());
});


// Check dep versions with David service
gulp.task('david', () => {
    return gulp.src('package.json')
        .pipe(g.david());
});


// Check for unused deps with depcheck
gulp.task('depcheck', g.depcheck({
    specials : [
        depcheck.special['gulp-load-plugins'],
        depcheck.special.mocha
    ]
}));


// Build macro
gulp.task('build', done => {
    g.sequence('cover', 'test', 'lint')(done);
});


// Macro for Travis
gulp.task('travis', done => {
    g.sequence('build', 'coveralls')(done);
});


// Task for local development
gulp.task('default', [ 'david', 'depcheck', 'build' ], () => {
    gulp.watch([
        'lib/*',
        'test/*'
    ], [ 'build' ]);
});
