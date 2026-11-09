/**
 * Created by lcortes on 12/09/16.
 */
(function () {
    'use strict';

    angular.module('actinver_todolist').service('TaskService', TaskService);

    TaskService.$inject = [
        '$http',
        'toFormService',
        'postSignIntFix',
        '$httpParamSerializerJQLike',
        '$window',
        'env'
    ];

    /* @ngInject */
    function TaskService(
        $http,
        toFormService,
        postSignIntFix,
        $httpParamSerializerJQLike,
        $window,
        env
    ) {
        var apiUrl = env.api.replace(/\/+$/, '');
        var vm = this;

        vm.title = 'TaskController';

        vm.createTask = createTask;
        vm.deleteTask = deleteTask;
        vm.getTask = getTask;
        vm.getTasks = getTasks;
        vm.updateTask = updateTask;

        activate();

        function activate() {}
        function createTask(task) {
            return $http.post(
                apiUrl + '/ToDoLists',
                $httpParamSerializerJQLike(taskData(task)),
                postSignIntFix
            );
        }

        function deleteTask(task) {
            return $http
                .delete(apiUrl + '/ToDoLists/' + task.id, postSignIntFix)
                .then(deleteTaskSuccess)
                .catch(deleteTaskFailed);

            function deleteTaskSuccess(response) {
                console.log(response);
                return response;
            }

            function deleteTaskFailed(error) {
                console.error(error);
                return error;
            }
        }

        function getTask(taskId) {
            return $http
                .get(apiUrl + '/ToDoLists/' + taskId)
                .then(getTaskSuccess)
                .catch(getTaskFailed);

            function getTaskSuccess(response) {
                console.log(response);
                return response;
            }

            function getTaskFailed(error) {
                console.error(error);
                return error;
            }
        }

        function getTasks() {
            return $http
                .get(apiUrl + '/ToDoLists')
                .then(getTasksSuccess)
                .catch(getTasksFailed);

            function getTasksSuccess(response) {
                console.log(response);
                return response;
            }

            function getTasksFailed(error) {
                console.error(error);
                return error;
            }
        }

        function taskData(task) {
            return {
                title: task.title,
                description: task.description || '',
                due: task.due || '',
                done: !!task.done
            };
        }

        function updateTask(task, taskId) {
            return $http.put(
                apiUrl + '/ToDoLists/' + taskId,
                $httpParamSerializerJQLike(taskData(task)),
                postSignIntFix
            );
        }
    }
})();
