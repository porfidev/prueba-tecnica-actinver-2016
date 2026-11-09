const gulp = require('gulp');

gulp.task('build', gulp.series('clean', 'enviroment', 'compile'));
gulp.task('build:dist', gulp.series('clean:dist', 'enviroment:dist', 'compile:dist'));
gulp.task('default', gulp.series('build'));
