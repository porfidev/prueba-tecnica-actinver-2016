/**
 * Created by elporfirio on 12/09/16.
 */
(function () {
    'use strict';

    angular.module('actinver_todolist').service('toFormService', toFormService);

    /* @ngInject */
    function toFormService() {
        this.convertJsonToFrom = convertJsonToFrom;

        function convertJsonToFrom(json) {
            var form_data = new FormData();

            for (var key in json) {
                form_data.append(key, json[key]);
            }

            return form_data;
        }
    }
})();
