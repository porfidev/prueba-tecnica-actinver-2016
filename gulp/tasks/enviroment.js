/**
 * Created by elporfirio on 10/09/16.
 */
'use strict';

const gulp = require('gulp'),
  config = require('../config.js'),
  ngConfig = require('gulp-ng-config'),
  rename = require('gulp-rename'),
  debug = require('gulp-debug').default;

gulp.task('enviroment', function () {
  return gulp
    .src('configFile.json')
    .pipe(ngConfig('actinver_todolist.enviroment', { environment: 'local' }))
    .pipe(rename('app.enviroment.js'))
    .pipe(gulp.dest(config.paths.devfolder + '/js'))
    .pipe(debug());
});

gulp.task('enviroment:dist', function () {
  return gulp
    .src('configFile.json')
    .pipe(ngConfig('actinver_todolist.enviroment', { environment: 'production' }))
    .pipe(rename('app.enviroment.js'))
    .pipe(gulp.dest(config.paths.distfolder + '/js'))
    .pipe(debug());
});
