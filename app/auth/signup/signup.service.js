/**
 * Created by elporfirio on 10/09/16.
 */
(function () {
    'use strict';

    angular.module('actinver_todolist').service('SignUpService', signUpUserService);

    signUpUserService.$inject = ['$http', 'env'];

    /* @ngInject */
    function signUpUserService($http, env) {
        this.inicio = inicio;
        this.signUp = signUp;

        function inicio() {
            console.log('Activado el servicio');
        }

        function signUp(user) {
            return $http.post(env.api.replace(/\/+$/, '') + '/Account/Register', {
                email: user.email,
                password: user.password,
                confirmpassword: user.confirmpassword
            });
        }
    }
})();
