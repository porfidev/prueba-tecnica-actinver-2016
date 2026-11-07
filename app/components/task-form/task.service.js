/**
 * Created by lcortes on 12/09/16.
 */
(function () {
    'use strict';

    angular
        .module('actinver_todolist')
        .service('TaskService', TaskService);

    TaskService.$inject = ['$http', 'toFormService', 'postSignIntFix', '$httpParamSerializerJQLike' , '$window', 'env'];

    /* @ngInject */
    function TaskService($http, toFormService, postSignIntFix, $httpParamSerializerJQLike, $window, env) {
        var apiUrl = env.api.replace(/\/+$/, '');
        var vm = this;
        vm.title = 'TaskController';

        vm.createTask = createTask;
        vm.updateTask = updateTask;
        vm.deleteTask = deleteTask;
        vm.getTasks = getTasks;
        vm.getTask = getTask;

        activate();

        ////////////////

        function activate() {

        }

        function getTasks() {
            return $http.get(apiUrl + '/ToDoLists')
                .then(getTasksSuccess)
                .catch(getTasksFailed);

            function getTasksSuccess(response){
                console.log(response);
                return response;
            }

            function getTasksFailed(error){
                console.error(error);
                return error;
            }
        }

        function getTask(taskId) {
            return $http.get(apiUrl + '/ToDoLists/' + taskId)
                .then(getTaskSuccess)
                .catch(getTaskFailed);

            function getTaskSuccess(response){
                console.log(response);
                return response;
            }

            function getTaskFailed(error){
                console.error(error);
                return error;
            }
        }

        function createTask(task){
            return $http.post(apiUrl + '/ToDoLists', $httpParamSerializerJQLike(task), postSignIntFix)
                .then(createTaskSuccess)
                .catch(createTaskFailed);

            function createTaskSuccess(response){
                console.log(response);
                return response;
            }

            function createTaskFailed(error){
                console.error(error);
                return error;
            }
        }

        function updateTask(task, taskId){
            return $http.put(apiUrl + '/ToDoLists/' + taskId, $httpParamSerializerJQLike(task), postSignIntFix)
                .then(updateTaskSuccess)
                .catch(updateTaskFailed);

            function updateTaskSuccess(response){
                console.log(response);
                return response;
            }

            function updateTaskFailed(error){
                console.error(error);
                return error;
            }
        }

        function deleteTask(task){
            return $http.delete(apiUrl + '/ToDoLists/' + task.Id, postSignIntFix)
                .then(deleteTaskSuccess)
                .catch(deleteTaskFailed);

            function deleteTaskSuccess(response){
                console.log(response);
                return response;
            }

            function deleteTaskFailed(error){
                console.error(error);
                return error;
            }
        }
    }

})();