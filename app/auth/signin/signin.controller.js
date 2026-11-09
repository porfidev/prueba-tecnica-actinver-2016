/**
 * Created by elporfirio on 12/09/16.
 */
(function () {
    'use strict';

    angular
        .module('actinver_todolist')
        .controller('SignInController', ['$state', SignInController]);

    function SignInController($state) {
        var vm = this;

        vm.ok = false;
        vm.user = {
            username: '',
            password: '',
            grant_type: 'password'
        };

        vm.successSignIn = successSignIn;

        activate();

        function activate() {}
        function successSignIn() {
            console.info('TODO SALIO OKAY');
            vm.ok = true;

            $state.go('tasks');
        }
    }
})();
