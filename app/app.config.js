/**
 * Created by elporfirio on 12/09/16.
 */

angular
  .module('actinver_todolist')
  .config([
    '$httpProvider',
    function ($httpProvider) {
      $httpProvider.interceptors.push('tokenInterceptor');
    }
  ])
  .run([
    '$transitions',
    '$state',
    '$window',
    function ($transitions, $state, $window) {
      $transitions.onBefore(
        {
          to: function (state) {
            return state.data && state.data.requiresAuth === true;
          }
        },
        function () {
          if (!$window.localStorage.getItem('access_token')) {
            return $state.target('home');
          }
        }
      );

      $transitions.onBefore(
        {
          to: function (state) {
            return state.name === 'signin' || state.name === 'home' || state.name === 'signup';
          }
        },
        function () {
          if ($window.localStorage.getItem('access_token')) {
            return $state.target('listTasks');
          }
        }
      );
    }
  ]);
