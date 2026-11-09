/**
 * Created by elporfirio on 12/09/16.
 */
(function () {
  'use strict';

  angular
    .module('actinver_todolist')
    .constant('postRequestFix', {
      headers: { 'Content-Type': undefined },
      transformRequest: angular.identity
    })
    .constant('postSignIntFix', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .constant('putRequestFix', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      //transformRequest: angular.identity
    });
})();
