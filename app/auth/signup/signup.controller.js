/**
 * Created by elporfirio on 10/09/16.
 */
(function () {
  'use strict';

  angular.module('actinver_todolist').controller('SignUpController', ['$state', SignUpController]);

  function SignUpController($state) {
    const vm = this;

    vm.onSuccessSignUp = onSuccessSignUp;

    function onSuccessSignUp() {
      alert('Nuevo usuario registrado, por favor inicie sesión');
      $state.go('home');
    }
  }
})();
