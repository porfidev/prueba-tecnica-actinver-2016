(function () {
    'use strict';

    angular
        .module('actinver_todolist')
        .service('tokenInterceptor', ['$window', 'env', tokenInterceptor]);

    function tokenInterceptor($window, env) {
        var apiUrl = env.api.replace(/\/+$/, '');

        this.request = request;

        function request(config) {
            var isApi = config.url.indexOf(apiUrl + '/') === 0;
            var isPublic =
                config.url === apiUrl + '/Account/Register' || config.url === env.tokenUrl;

            if ($window.localStorage.access_token && isApi && !isPublic) {
                config.headers = config.headers || {};
                config.headers.Authorization = 'Bearer ' + $window.localStorage.access_token;
            }
            return config;
        }
    }
})();
