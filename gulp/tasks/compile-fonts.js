/**
 * Created by elporfirio on 10/09/16.
 */
var gulp = require('gulp'),
    config = require('../config.js'),
    debug = require('gulp-debug').default;

gulp.task('compile-fonts', function () {
    return gulp
        .src(config.paths.fonts.source, { encoding: false })
        .pipe(debug({ verbose: true }))
        .pipe(gulp.dest(config.paths.fonts.destiny));
});

gulp.task('compile-fonts:dist', function () {
    return gulp
        .src(config.paths.fonts.source, { encoding: false })
        .pipe(debug({ verbose: true }))
        .pipe(gulp.dest(config.paths.fonts.dist));
});
