/**
 * Created by elporfirio on 10/09/16.
 */

angular.module('actinver_todolist').config(['$stateProvider', '$urlRouterProvider', routes]);

function routes($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    const states = [
        {
            name: 'auth',
            abstract: true,
            templateUrl: 'views/layout/auth.layout.html'
        },
        {
            name: 'home',
            url: '/',
            parent: 'auth',
            templateUrl: 'views/home/home.view.html',
            controller: 'HomeController',
            controllerAs: 'HomeCtrl'
        },
        {
            name: 'signup',
            url: '/registro',
            parent: 'auth',
            templateUrl: 'views/auth/signup/signup.view.html',
            controller: 'SignUpController',
            controllerAs: 'SignUpCtrl'
        },
        {
            name: 'signin',
            url: '/login',
            templateUrl: 'views/auth/signin/signin.view.html',
            controller: 'SignInController',
            controllerAs: 'signinctrl'
        },
        {
            name: 'tasks',
            abstract: true,
            templateUrl: 'views/layout/tasks.layout.html',
            controller: 'TaskController',
            controllerAs: 'tasksCtrl'
        },
        {
            name: 'listTasks',
            url: '/tasks',
            parent: 'tasks',
            templateUrl: 'views/tasks/task-list.view.html',
            controller: 'TaskListController',
            controllerAs: 'taskListCtrl'
        },
        {
            name: 'detail',
            url: '/detalle/:taskid',
            params: {
                taskid: null
            },
            templateUrl: 'views/tasks/task-detail.view.html',
            controller: 'DetailController',
            controllerAs: 'detailctrl'
        }
    ];

    states.forEach(function (state) {
        $stateProvider.state(state);
    });
}
