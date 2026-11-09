(function () {
    'use strict';

    angular.module('actinver_todolist').component('signinForm', {
        bindings: {
            onSuccess: '&',
            user: '='
        },
        templateUrl: 'views/auth/signin/signin-form.html',
        controller: ['SignInService', SignInFormController]
    });

    function SignInFormController(SignInService) {
        var vm = this;

        vm.error = '';
        vm.sending = false;

        vm.signIn = signIn;

        vm.$onInit = onInit;

        function onInit() {
            vm.user = vm.user || { username: '', password: '' };
        }

        function signIn() {
            if (vm.sending) return;

            vm.error = '';
            var form = vm.signinForm;
            if (!form || form.$valid !== true || form.$pending) return;

            vm.sending = true;
            return SignInService.signIn(vm.user)
                .then(function () {
                    vm.onSuccess();
                })
                .catch(function (error) {
                    if (error.status === 401) {
                        vm.error = 'Correo o contraseña incorrectos.';
                    } else if (error.status === 422) {
                        vm.error = 'Revisa los datos del formulario.';
                    } else {
                        vm.error = 'No se pudo iniciar sesión. Intenta nuevamente.';
                    }
                })
                .finally(function () {
                    vm.sending = false;
                });
        }
    }
})();
