/**
 * Created by elporfirio on 10/09/16.
 */
var gulp = require('gulp'),
    config = require('../config.js'),
    sass = require('gulp-sass')(require('sass')),
    debug = require('gulp-debug'),
    cleancss = require('gulp-clean-css');

gulp.task('compile-styles', function(){
    return gulp.src(config.paths.styles.main)
        .pipe(debug({verbose: true}))
        .pipe(sass({
            loadPaths: [config.paths.styles.source]
        }))
        .pipe(gulp.dest(config.paths.styles.destiny));
});

gulp.task('compile-styles:dist', function(){
    return gulp.src(config.paths.styles.main)
        .pipe(debug({verbose: true}))
        .pipe(sass({
            loadPaths: [config.paths.styles.source]
        }))
        .pipe(cleancss())
        .pipe(gulp.dest(config.paths.styles.dist));
});