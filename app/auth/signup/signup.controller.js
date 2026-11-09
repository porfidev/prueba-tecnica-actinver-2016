/**
 * Created by elporfirio on 10/09/16.
 */
(function () {
    'use strict';

    angular
        .module('actinver_todolist')
        .controller('SignUpController', ['$state', SignUpController]);

    /* @ngInject */
    function SignUpController($state) {
        var vm = this;

        vm.ok = false;
        vm.title = 'SignUpController';
        vm.user = {
            // email: 'elporfirio@gmail.com',
            // password: 'ABcd1234*',
            // confirmpassword: 'ABcd1234*'
        };

        vm.successSignUp = successSignUp;

        activate();

        function activate() {}
        function successSignUp() {
            alert('Registrado');
            $state.go('home');
        }
    }
})();
