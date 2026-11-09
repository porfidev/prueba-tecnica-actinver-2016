/**
 * Created by elporfirio on 10/09/16.
 */

module.exports = {
    paths: {
        serverStart: '/',
        tempfolder: '.tmp',
        devfolder: './.tmp',
        distfolder: './dist',
        styles: {
            source: './app/assets/sass/**/*.scss',
            main: './app/assets/sass/main.scss',
            destiny: './.tmp/css',
            dist: './dist/css'
        },
        bower: './bower_components',
        libs: {
            js: [
                './node_modules/angular/angular.js',
                './node_modules/angular-ui-router/release/angular-ui-router.js',
                './node_modules/angular-loading-bar/build/loading-bar.js'
            ],
            css: [
                './node_modules/bootstrap/dist/css/bootstrap.css',
                './node_modules/angular-loading-bar/build/loading-bar.css'
            ],
            destiny: './.tmp/libs',
            dist: './dist/libs'
        },
        app: {
            base: './app',
            scripts: './app/**/*.js',
            templates: './app/**/*.html',
            jsDestiny: './.tmp/js',
            jsDist: './dist/js',
            viewsDestiny: './.tmp/views',
            viewsDist: './dist/views'
        },
        images: {
            source: [
                './assets/source/**/*.png',
                './assets/source/**/*.jpg',
                './assets/source/**/*.gif'
            ],
            destiny: './.tmp/source',
            dist: './dist/source'
        },
        files: {
            file: ['./assets/files/*.*'],
            destiny: './.tmp/files',
            dist: './dist/files'
        },
        fonts: {
            source: ['./node_modules/bootstrap/dist/fonts/**/*.*'],
            destiny: './.tmp/fonts',
            dist: './dist/fonts'
        }
    }
};
