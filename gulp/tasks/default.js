var gulp = require('gulp');

gulp.task('build', gulp.series('enviroment', 'compile'));
gulp.task('default', gulp.series('build'));
