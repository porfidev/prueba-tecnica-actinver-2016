/**
 * Created by elporfirio on 10/09/16.
 */

(function () {
  'use strict';

  angular.module('actinver_todolist').component('signupForm', {
    bindings: {
      onSuccess: '&',
      user: '='
    },
    templateUrl: 'views/auth/signup/signup-form.html',
    controller: ['SignUpService', SignUpFormController]
  });

  function SignUpFormController(SignUpService) {
    const vm = this;

    vm.error = '';
    vm.sending = false;
    vm.user = {
      email: '',
      password: '',
      confirmpassword: ''
    };

    vm.signUp = signUp;

    function signUp() {
      if (vm.sending) return;

      vm.error = '';
      const form = vm.signupForm;
      if (!form || form.$valid !== true || form.$pending) return;
      if (vm.user.password !== vm.user.confirmpassword) return;

      vm.sending = true;

      return SignUpService.signUp(vm.user)
        .then(function () {
          vm.onSuccess();
        })
        .catch(function (error) {
          if (error.status === 409) {
            vm.error = 'Ese correo ya está registrado.';
          } else if (error.status === 422) {
            vm.error = 'Revisa los datos del formulario.';
          } else {
            vm.error = 'No se pudo completar el registro. Intenta nuevamente.';
          }
        })
        .finally(function () {
          vm.sending = false;
        });
    }
  }
})();
