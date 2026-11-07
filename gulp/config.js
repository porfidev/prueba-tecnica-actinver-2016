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
            source: './app/assets/sass/*.scss',
            main: './app/assets/sass/main.scss',
            destiny: './.tmp/css',
            dist:  './dist/css'
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
        modules: {
            views: {
                html: './app/modules/**/*.html',
                destiny: './.tmp/views',
                dist: './dist/views'
            },
            js: {
                source: [
                    './app/*.js',
                    './app/modules/**/*.js'
                ],
                destiny: './.tmp/js',
                dist: './dist/js'
            }
        },
        images: {
            source: ['./assets/source/**/*.png', './assets/source/**/*.jpg', './assets/source/**/*.gif'],
            destiny: './.tmp/source',
            dist: './dist/source'
        },
        files: {
            file: ['./assets/files/*.*'],
            destiny: './.tmp/files',
            dist: './dist/files'
        },
        components: {
            views: {
                source: './app/components/**/*.html',
                destiny: './.tmp/views',
                dist: './dist/views'
            },
            modules: {
                source: './app/components/**/*.js',
                destiny: './.tmp/js',
                dist: './dist/js'
            }
        },
        fonts: {
            source: [
                './node_modules/bootstrap/dist/fonts/**/*.*'
                ],
            destiny: './.tmp/fonts',
            dist: './dist/fonts'
        }
    }
};