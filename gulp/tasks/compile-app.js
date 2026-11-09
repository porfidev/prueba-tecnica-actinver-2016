var gulp = require('gulp'),
    config = require('../config'),
    waitStreams = require('../wait-streams'),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin');

function compileApp(production) {
    var paths = config.paths.app;
    var js = gulp.src(paths.scripts, { base: paths.base });
    var html = gulp.src(paths.templates, { base: paths.base });
    if (production) {
        js = js.pipe(uglify());
        html = html.pipe(htmlmin({ collapseWhitespace: true }));
    }
    return waitStreams(
        js.pipe(gulp.dest(production ? paths.jsDist : paths.jsDestiny)),
        html.pipe(gulp.dest(production ? paths.viewsDist : paths.viewsDestiny))
    );
}

gulp.task('compile-app', function () {
    return compileApp(false);
});
gulp.task('compile-app:dist', function () {
    return compileApp(true);
});
