/**
 * Created by elporfirio on 10/09/16.
 */
var gulp = require('gulp'),
    config = require('../config.js'),
    rename = require('gulp-rename'),
    debug = require('gulp-debug').default;

gulp.task('compile-files', function(){
    return gulp.src(config.paths.files.file)
        .pipe(debug({verbose: true}))
        .pipe(gulp.dest(config.paths.files.destiny));
});

gulp.task('compile-files:dist', function(){
    return gulp.src(config.paths.files.file)
        .pipe(debug({verbose: true}))
        .pipe(gulp.dest(config.paths.files.dist));
});