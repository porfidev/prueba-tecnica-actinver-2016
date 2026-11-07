/**
 * Created by elporfirio on 10/09/16.
 */
(function () {
    'use strict';

    angular
        .module('actinver_todolist')
        .service('SignInService', signInService);

    signInService.$inject = ['$http', 'toFormService', 'postSignIntFix', '$httpParamSerializerJQLike' , '$window', 'env'];

    /* @ngInject */
    function signInService($http, toFormService, postSignIntFix, $httpParamSerializerJQLike, $window, env) {
        this.inicio = inicio;
        this.signIn = signIn;

        ////////////////

        function signIn(user){

            var form = toFormService.convertJsonToFrom(user);
            return $http.post(env.tokenUrl, $httpParamSerializerJQLike(user), postSignIntFix)
                .then(signInSuccess)
                .catch(signInFailed);

            function signInSuccess(response){
                delete $window.localStorage.user;
                delete $window.localStorage.access_token;
                var currentUser = response.data;
                $window.localStorage.user = JSON.stringify(currentUser);
                $window.localStorage.access_token = response.data.access_token;
                console.log(response);
                return response;
            }

            function signInFailed(error){
                delete $window.localStorage.user;
                delete $window.localStorage.access_token;
                console.error(error);
                return error;
            }
        }

        function inicio() {
            console.log("Activado el servicio de Login");
        }
    }

})();
