/**
 * Created by elporfirio on 11/09/16.
 */
(function () {
    'use strict';

    angular.module('actinver_todolist').directive('formValidation', formValidation);

    //formValidation.$inject = [''];

    /* @ngInject */
    function formValidation() {
        var directive = {
            bindToController: true,
            controller: formValidationController,
            controllerAs: 'vm',
            link: link,
            restrict: 'A',
            scope: {
                callback: '&validSubmit',
                number: '='
            }
        };
        return directive;

        function link(scope, element, attrs, controller) {
            console.warn(element);

            var $element = angular.element(element);
            console.info(attrs);

            $element.bind('submit', function (e) {
                e.preventDefault();

                controller.callIt();

                // // Remove the class pristine from all form elements.
                // $element.find( '.ng-pristine' ).removeClass( 'ng-pristine' );
                //
                // // Get the form object.
                // var form = scope[ attributes.name ];
                //
                // // Set all the fields to dirty and apply the changes on the scope so that
                // // validation errors are shown on submit only.
                // angular.forEach( form , function( formElement , fieldName ) {
                //     // If the fieldname starts with a '$' sign, it means it's an Angular
                //     // property or function. Skip those items.
                //     if ( fieldName[0] === '$' ) return;
                //
                //     formElement.$pristine = false;
                //     formElement.$dirty = true;
                // });
                //
                // // Do not continue if the form is invalid.
                // if ( form.$invalid ) {
                //     // Focus on the first field that is invalid.
                //     $element.find( '.ng-invalid' ).first().focus();
                //
                //     return false;
                // }

                // From this point and below, we can assume that the form is valid.
                //scope.$eval( attributes.customSubmit );

                //scope.$apply();

                ////// OTRO
                /*
                 // Add novalidate to the form element.
                 attributes.$set( 'novalidate' , 'novalidate' );

                 $element.bind( 'submit' , function( e ) {
                 e.preventDefault();

                 // Remove the class pristine from all form elements.
                 $element.find( '.ng-pristine' ).removeClass( 'ng-pristine' );

                 // Get the form object.
                 var form = scope[ attributes.name ];

                 // Set all the fields to dirty and apply the changes on the scope so that
                 // validation errors are shown on submit only.
                 angular.forEach( form , function( formElement , fieldName ) {
                 // If the fieldname starts with a '$' sign, it means it's an Angular
                 // property or function. Skip those items.
                 if ( fieldName[0] === '$' ) return;

                 formElement.$pristine = false;
                 formElement.$dirty = true;
                 });

                 // Do not continue if the form is invalid.
                 if ( form.$invalid ) {
                 // Focus on the first field that is invalid.
                 $element.find( '.ng-invalid' ).first().focus();

                 return false;
                 }

                 // From this point and below, we can assume that the form is valid.
                 scope.$eval( attributes.customSubmit );

                 scope.$apply();
                 });
                 */
            });
        }
    }

    //ControllerName.$inject = ['dependency'];

    /* @ngInject */
    function formValidationController() {
        this.callIt = callIt;

        function callIt() {
            this.callback();
            console.log(this.callback);

            console.info(this.number);
        }
    }
})();
