/**
 * Created by elporfirio on 10/09/16.
 */
var gulp = require('gulp'),
    config = require('../config.js'),
    debug = require('gulp-debug'),
    inject = require('gulp-inject'),
    htmlmin = require('gulp-htmlmin');


gulp.task('compile', gulp.series(gulp.parallel(
    'compile-styles',
    'compile-libs',
    'compile-modules',
    'compile-images',
    'compile-files',
    'compile-components',
    'compile-fonts'
), function(){
    return gulp.src('./index.html')
        .pipe(inject(gulp.src([
            config.paths.devfolder + '/libs/angular.js',
            config.paths.devfolder + '/libs/**/*.js'
        ], {read: false}),{ignorePath: config.paths.tempfolder, relative: false, addRootSlash: false, starttag: '<!-- libs:js -->'} ))
        .pipe(inject(gulp.src([
            config.paths.devfolder + '/js/app.js',
            config.paths.devfolder + '/js/app.enviroment.js',
            config.paths.devfolder + '/js/app.routes.js',
            config.paths.devfolder + '/js/**/*.js'
        ], {read: false}),{ignorePath: config.paths.tempfolder, relative: false, addRootSlash: false} ))
        .pipe(inject(gulp.src([
            config.paths.devfolder + '/libs/bootstrap.css',
            config.paths.devfolder + '/libs/**/*.css',
            config.paths.devfolder + '/css/**/*.css'
        ], {read: false}),{ignorePath: config.paths.tempfolder, relative: false, addRootSlash: false} ))
        .pipe(gulp.dest(config.paths.devfolder));
}));
