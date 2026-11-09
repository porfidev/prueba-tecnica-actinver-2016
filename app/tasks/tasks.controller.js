(function () {
  angular
    .module('actinver_todolist')
    .controller('TaskController', ['TaskService', '$state', '$window', TasksController]);

  function TasksController(TaskService, $state, $window) {
    const vm = this;

    vm.isAddingTask = false;
    vm.newTask = {};

    vm.cancelAddTask = onSuccessAdded;
    vm.onSuccessAdded = onSuccessAdded;
    vm.showAddTask = showAddTask;

    this.signOut = function () {
      $window.localStorage.removeItem('access_token');
      return $state.go('home', {}, { location: 'replace' });
    };

    function onSuccessAdded() {
      vm.isAddingTask = false;
    }

    function showAddTask() {
      vm.newTask = { title: '', description: '', due: '', done: false };
      vm.isAddingTask = true;
    }
  }
})();
