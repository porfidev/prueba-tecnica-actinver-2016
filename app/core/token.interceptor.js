(function () {
  'use strict';

  angular
    .module('actinver_todolist')
    .service('tokenInterceptor', ['$window', 'env', '$q', '$injector', tokenInterceptor]);

  function tokenInterceptor($window, env, $q, $injector) {
    const apiUrl = env.api.replace(/\/+$/, '');

    this.request = request;

    this.responseError = function (response) {
      const token = $window.localStorage.getItem('access_token');
      const headers = response.config && response.config.headers;

      if (!token) {
        $window.localStorage.removeItem('access_token');
        $injector.get('$state').go('home');
      }

      if (
        response.status === 401 &&
        token &&
        headers &&
        headers.Authorization === 'Bearer ' + token
      ) {
        $window.localStorage.removeItem('access_token');
        $injector.get('$state').go('home');
      }

      return $q.reject(response);
    };

    function request(config) {
      const isApi = config.url.indexOf(apiUrl + '/') === 0;
      const isPublic = config.url === apiUrl + '/Account/Register' || config.url === env.tokenUrl;

      if ($window.localStorage.access_token && isApi && !isPublic) {
        config.headers = config.headers || {};
        config.headers.Authorization = 'Bearer ' + $window.localStorage.access_token;
      }
      return config;
    }
  }
})();
