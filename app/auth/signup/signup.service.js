/**
 * Created by elporfirio on 10/09/16.
 */
(function () {
  'use strict';

  angular.module('actinver_todolist').service('SignUpService', signUpUserService);

  signUpUserService.$inject = ['$http', 'env'];

  function signUpUserService($http, env) {
    this.signUp = signUp;

    function signUp(user) {
      return $http.post(env.api.replace(/\/+$/, '') + '/Account/Register', {
        email: user.email,
        password: user.password,
        confirmpassword: user.confirmpassword
      });
    }
  }
})();
