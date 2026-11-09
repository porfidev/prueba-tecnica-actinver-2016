/**
 * Created by elporfirio on 10/09/16.
 */
'use strict';

const gulp = require('gulp'),
  config = require('../config.js'),
  debug = require('gulp-debug').default,
  uglify = require('gulp-uglify'),
  merge = require('../wait-streams'),
  cleancss = require('gulp-clean-css');

gulp.task('compile-libs', function () {
  const js = gulp
    .src(config.paths.libs.js)
    .pipe(debug({ verbose: true }))
    .pipe(gulp.dest(config.paths.libs.destiny));

  const css = gulp
    .src(config.paths.libs.css)
    .pipe(debug({ verbose: true }))
    .pipe(gulp.dest(config.paths.libs.destiny));

  return merge(js, css);
});

gulp.task('compile-libs:dist', function () {
  const js = gulp
    .src(config.paths.libs.js)
    .pipe(debug({ verbose: true }))
    .pipe(uglify())
    .pipe(gulp.dest(config.paths.libs.dist));

  const css = gulp
    .src(config.paths.libs.css)
    .pipe(debug({ verbose: true }))
    .pipe(cleancss())
    .pipe(gulp.dest(config.paths.libs.dist));

  return merge(js, css);
});
