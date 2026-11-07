/**
 * Created by elporfirio on 10/09/16.
 */
var gulp = require('gulp'),
    webserver = require('gulp-webserver'),
    config = require('../config.js');

gulp.task('serve', gulp.series('build', function(){
    gulp.watch('configFile.json', gulp.series('enviroment'));
    gulp.watch(config.paths.styles.source, gulp.series('compile-styles'));
    gulp.watch(config.paths.libs.js, gulp.series('compile-libs'));
    gulp.watch(config.paths.libs.css, gulp.series('compile-libs'));
    gulp.watch(config.paths.modules.js.source, gulp.series('compile-modules'));
    gulp.watch(config.paths.modules.views.html, gulp.series('compile-modules'));
    gulp.watch(config.paths.images.source , gulp.series('compile-images'));
    gulp.watch(config.paths.components.modules.source, gulp.series('compile-components'));
    gulp.watch(config.paths.components.views.source, gulp.series('compile-components'));

    return gulp.src(config.paths.devfolder)
        .pipe(webserver({
            //livereload: true,
            //directoryListing: true,
            open: true,
            //fallback: 'index.html',
            // FIX PARA NODE en VAGRANT
            //host: '0.0.0.0',
            port: 3000
        }));
}));
