/**
 * Created by elporfirio on 10/09/16.
 */

(function () {
  'use strict';

  angular.module('actinver_todolist').component('taskForm', {
    bindings: {
      editing: '<?',
      onDelete: '&?',
      onSuccess: '&?',
      onUpdate: '&?',
      sending: '=?',
      task: '=?'
    },
    templateUrl: 'views/tasks/task-form.html',
    controller: ['TaskService', TaskFormController]
  });

  function TaskFormController(TaskService) {
    const vm = this;

    vm.error = '';
    vm.sending = false;

    vm.delTask = delTask;
    vm.submitTask = submitTask;

    vm.$onInit = onInit;

    function delTask(task, taskId) {
      TaskService.deleteTask(task, taskId).then(function (response) {
        console.info(response);
        vm.onDelete();
      });
    }

    function onInit() {
      vm.task = vm.task || {
        title: '',
        description: '',
        due: '',
        done: false
      };
    }

    function submitTask() {
      if (vm.sending) return;
      vm.error = '';
      const form = vm.taskForm;
      if (!form || form.$valid !== true || form.$pending) return;
      if (vm.editing && !vm.task.id) {
        vm.error = 'No se pudo identificar la tarea que deseas editar.';
        return;
      }

      vm.sending = true;
      const editing = vm.editing;
      const request = editing
        ? TaskService.updateTask(vm.task, vm.task.id)
        : TaskService.createTask(vm.task);
      return request
        .then(function () {
          const callback = editing ? vm.onUpdate : vm.onSuccess;
          if (callback) callback();
        })
        .catch(function (error) {
          if (error.status === 422) {
            vm.error = 'Revisa los datos del formulario.';
          } else if (error.status === 401) {
            vm.error = 'Tu sesión expiró. Inicia sesión nuevamente.';
          } else if (error.status === 404) {
            vm.error = 'La tarea ya no está disponible.';
          } else {
            vm.error = 'No se pudo guardar la tarea. Intenta nuevamente.';
          }
        })
        .finally(function () {
          vm.sending = false;
        });
    }
  }
})();
