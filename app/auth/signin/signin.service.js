(function () {
  'use strict';

  angular.module('actinver_todolist').service('SignInService', signInService);

  signInService.$inject = [
    '$http',
    'postSignIntFix',
    '$httpParamSerializerJQLike',
    '$window',
    'env'
  ];

  function signInService($http, postSignIntFix, $httpParamSerializerJQLike, $window, env) {
    this.signIn = signIn;

    function signIn(user) {
      const credentials = {
        username: user.username,
        password: user.password,
        grant_type: 'password'
      };
      return $http
        .post(env.tokenUrl, $httpParamSerializerJQLike(credentials), postSignIntFix)
        .then(function (response) {
          $window.localStorage.access_token = response.data.access_token;
          return response;
        })
        .catch(function (error) {
          delete $window.localStorage.access_token;
          throw error;
        });
    }
  }
})();
