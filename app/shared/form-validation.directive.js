(function () {
  'use strict';

  angular.module('actinver_todolist').directive('formValidation', formValidation);

  function formValidation() {
    return {
      restrict: 'A',
      require: 'form',
      link: function (scope, element, attrs, form) {
        element.on('submit', submit);
        element.on('$destroy', function () {
          element.off('submit', submit);
        });
        ß;
        function submit(event) {
          event.preventDefault();

          // The form's submit listener commits pending view values and sets $submitted first.
          if (form.$invalid) {
            const firstInvalid = element[0].querySelector(
              '[ng-model].ng-invalid:not(:disabled):not([type="hidden"])'
            );
            if (firstInvalid) firstInvalid.focus();
          }

          if (form.$valid === true && !form.$pending) {
            scope.$apply(attrs.validSubmit);
          }
        }
      }
    };
  }
})();
