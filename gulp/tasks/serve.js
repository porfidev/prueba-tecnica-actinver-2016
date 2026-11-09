var gulp = require('gulp'),
    webserver = require('gulp-webserver'),
    config = require('../config');

gulp.task(
    'serve',
    gulp.series('build', function () {
        // Rebuild the index when files are added, removed or moved as well as edited.
        var sources = [
            'index.html',
            'configFile.json',
            config.paths.app.scripts,
            config.paths.app.templates,
            config.paths.styles.source
        ].concat(
            config.paths.libs.js,
            config.paths.libs.css,
            config.paths.images.source,
            config.paths.files.file,
            config.paths.fonts.source
        );
        gulp.watch(sources, gulp.series('build'));

        return gulp.src(config.paths.devfolder).pipe(webserver({ open: true, port: 3000 }));
    })
);
