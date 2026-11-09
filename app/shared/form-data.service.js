/**
 * Created by elporfirio on 12/09/16.
 */
(function () {
  'use strict';

  angular.module('actinver_todolist').service('toFormService', toFormService);

  function toFormService() {
    this.convertJsonToFrom = convertJsonToFrom;

    function convertJsonToFrom(json) {
      const form_data = new FormData();

      for (let key in json) {
        form_data.append(key, json[key]);
      }

      return form_data;
    }
  }
})();
