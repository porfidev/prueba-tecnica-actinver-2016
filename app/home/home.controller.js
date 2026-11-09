(function () {
  angular.module('actinver_todolist').controller('HomeController', ['$state', HomeController]);
  ß;
  function HomeController($state) {
    const vm = this;

    vm.user = {
      username: '',
      password: ''
    };

    vm.goToRegister = goToRegister;
    vm.successSignIn = successSignIn;

    function goToRegister() {
      $state.go('signup');
    }

    function successSignIn() {
      $state.go('listTasks');
    }
  }
})();
