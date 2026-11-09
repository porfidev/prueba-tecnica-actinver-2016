/**
 * Created by elporfirio on 10/09/16.
 */
const gulp = require('gulp'),
  webserver = require('gulp-webserver'),
  config = require('../config.js');

gulp.task('kill', function () {
  const stream = gulp.src(config.paths.devfolder).pipe(webserver());
  stream.emit('kill');
});
