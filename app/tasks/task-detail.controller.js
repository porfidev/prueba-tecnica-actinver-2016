/**
 * Created by lcortes on 12/09/16.
 */
(function () {
    'use strict';

    angular
        .module('actinver_todolist')
        .controller('DetailController', [
            'TaskService',
            '$state',
            '$stateParams',
            DetailController
        ]);

    function DetailController(TaskService, $state, $stateParams) {
        var vm = this;

        vm.task = {};

        activate();

        function activate() {
            console.warn('ELSUPERID', $stateParams.taskid);
            TaskService.getTask($stateParams.taskid).then(function (result) {
                vm.task = result.data;
            });
        }
    }
})();
