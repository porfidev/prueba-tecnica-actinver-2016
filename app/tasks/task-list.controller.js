/**
 * Created by lcortes on 12/09/16.
 */
(function () {
  'use strict';

  angular
    .module('actinver_todolist')
    .controller('TaskListController', ['TaskService', '$state', '$window', TaskListController]);

  function TaskListController(TaskService, $state, $window) {
    const vm = this;

    vm.currentTask = {};
    vm.editingTask = false;
    vm.error = '';
    vm.ok = false;
    vm.savingTask = false;
    vm.showDetail = false;
    vm.task = {};
    vm.taskErrors = {};
    vm.tasks = [];
    vm.updatingTasks = {};

    vm.cancelEditTask = cancelEditTask;
    vm.deleteTask = deleteTask;
    vm.editTask = editTask;
    vm.hideTask = hideTask;
    vm.obtainTasks = obtainTasks;
    vm.showTask = showTask;
    vm.successAddTask = successAddTask;
    vm.successDelTask = successDelTask;
    vm.successEditTask = successEditTask;
    vm.updateTaskStatus = updateTaskStatus;

    vm.$onInit = obtainTasks;

    function cancelEditTask() {
      vm.editingTask = false;
      vm.savingTask = false;
      vm.task = {};
    }

    function deleteTask(task) {
      var asegurar = confirm('¿Desea Eliminar?');
      if (asegurar) {
        TaskService.deleteTask(task).then(function (result) {
          vm.obtainTasks();
        });
      }
    }

    function editTask(task) {
      vm.editingTask = true;
      vm.task = angular.copy(task);
    }

    function hideTask() {
      vm.currentTask = {};
      vm.showDetail = false;
    }

    function obtainTasks() {
      TaskService.getTasks().then(function (result) {
        console.info(result);
        vm.tasks = result.data;
      });
    }

    function showTask(task) {
      TaskService.getTask(task.id)
        .then(function (result) {
          if (result.status === 200) {
            vm.currentTask = result.data;
            vm.showDetail = true;
          }
        })
        .catch(function (error) {
          vm.error = 'No se pudo consultar la tarea.';
          console.error(error);
        });
    }

    function successAddTask() {
      vm.editingTask = false;
      vm.task = {};
      vm.obtainTasks();
    }

    function successDelTask() {
      alert('eliminado');
    }

    function successEditTask() {
      cancelEditTask();
      vm.obtainTasks();
    }

    function updateTaskStatus(task) {
      if (vm.updatingTasks[task.id]) return;
      const previousState = !task.done;
      vm.updatingTasks[task.id] = true;
      delete vm.taskErrors[task.id];

      return TaskService.updateTask(task, task.id)
        .then(function (response) {
          task.done = response.data.done;
          if (vm.currentTask.id === task.id) vm.currentTask.done = task.done;
        })
        .catch(function () {
          task.done = previousState;
          vm.taskErrors[task.id] = 'No se pudo actualizar el estado. Intenta nuevamente.';
        })
        .finally(function () {
          delete vm.updatingTasks[task.id];
        });
    }
  }
})();
