/**
 * Created by elporfirio on 10/09/16.
 */
var gulp = require('gulp'),
    config = require('../config.js'),
    debug = require('gulp-debug').default;

gulp.task('compile-images', function(){
    return gulp.src(config.paths.images.source)
        .pipe(debug({verbose: true}))
        .pipe(gulp.dest(config.paths.images.destiny));
});

gulp.task('compile-images:dist', function(){
    return gulp.src(config.paths.images.source)
        .pipe(debug({verbose: true}))
        .pipe(gulp.dest(config.paths.images.dist));
});