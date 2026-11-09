/**
 * Created by elporfirio on 12/09/16.
 */

angular.module('actinver_todolist').config([
    '$httpProvider',
    function ($httpProvider) {
        $httpProvider.interceptors.push('tokenInterceptor');
    }
]);
