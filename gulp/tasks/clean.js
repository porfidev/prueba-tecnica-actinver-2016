const gulp = require('gulp'),
  deleteAsync = require('del').deleteAsync,
  config = require('../config');

gulp.task('clean', function () {
  return deleteAsync([config.paths.devfolder]);
});

gulp.task('clean:dist', function () {
  return deleteAsync([config.paths.distfolder]);
});
