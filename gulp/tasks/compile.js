var gulp = require('gulp'),
    config = require('../config'),
    inject = require('gulp-inject'),
    htmlmin = require('gulp-htmlmin');

function index(production) {
    var folder = production ? config.paths.distfolder : config.paths.devfolder;
    var options = { ignorePath: folder.replace(/^\.\//, ''), relative: false, addRootSlash: false };
    var html = gulp
        .src('./index.html')
        .pipe(
            inject(
                gulp.src([folder + '/libs/angular.js', folder + '/libs/**/*.js'], { read: false }),
                Object.assign({}, options, { starttag: '<!-- libs:js -->' })
            )
        )
        .pipe(
            inject(
                gulp.src(
                    [
                        folder + '/js/app.module.js',
                        folder + '/js/app.enviroment.js',
                        folder + '/js/**/*.module.js',
                        folder + '/js/**/*.js'
                    ],
                    { read: false }
                ),
                options
            )
        )
        .pipe(
            inject(
                gulp.src(
                    [
                        folder + '/libs/bootstrap.css',
                        folder + '/libs/**/*.css',
                        folder + '/css/**/*.css'
                    ],
                    { read: false }
                ),
                options
            )
        );
    if (production) html = html.pipe(htmlmin({ collapseWhitespace: true }));
    return html.pipe(gulp.dest(folder));
}

var tasks = [
    'compile-styles',
    'compile-libs',
    'compile-app',
    'compile-images',
    'compile-files',
    'compile-fonts'
];
gulp.task(
    'compile',
    gulp.series(gulp.parallel.apply(gulp, tasks), function () {
        return index(false);
    })
);
gulp.task(
    'compile:dist',
    gulp.series(
        gulp.parallel.apply(
            gulp,
            tasks.map(function (task) {
                return task + ':dist';
            })
        ),
        function () {
            return index(true);
        }
    )
);
