(function () {
    angular
        .module('actinver_todolist')
        .controller('TaskController', ['TaskService', '$state', TasksController]);

    function TasksController(TaskService, $state) {
        const vm = this;

        vm.isAddingTask = false;
        vm.newTask = {};

        vm.cancelAddTask = onSuccessAdded;
        vm.onSuccessAdded = onSuccessAdded;
        vm.showAddTask = showAddTask;

        function onSuccessAdded() {
            vm.isAddingTask = false;
        }

        function showAddTask() {
            vm.newTask = { title: '', description: '', due: '', done: false };
            vm.isAddingTask = true;
        }
    }
})();
