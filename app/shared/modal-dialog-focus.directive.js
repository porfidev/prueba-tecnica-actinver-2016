(function () {
  'use strict';

  angular.module('actinver_todolist').directive('modalDialogFocus', [
    '$timeout',
    '$document',
    function ($timeout, $document) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          const previous = $document[0].activeElement;
          const body = angular.element($document[0].body);
          body.addClass('modal-open');
          element.attr('tabindex', '-1');
          const focusTimer = $timeout(function () {
            const field = element[0].querySelector('input:not([disabled]), button:not([disabled])');
            (field || element[0]).focus();
          });

          function keydown(event) {
            if (event.key === 'Escape') {
              event.preventDefault();
              scope.$applyAsync(function () {
                if (!scope.$eval(attrs.modalBusy)) scope.$eval(attrs.onModalClose);
              });
            }
            if (event.key !== 'Tab') return;
            const fields = Array.from(
              element[0].querySelectorAll(
                'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]'
              )
            );
            const first = fields[0];
            const last = fields[fields.length - 1];
            const active = $document[0].activeElement;
            if (!first) {
              event.preventDefault();
              element[0].focus();
            } else if (event.shiftKey && (active === first || active === element[0])) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && (active === last || active === element[0])) {
              event.preventDefault();
              first.focus();
            }
          }
          element.on('keydown', keydown);
          scope.$on('$destroy', function () {
            $timeout.cancel(focusTimer);
            element.off('keydown', keydown);
            body.removeClass('modal-open');
            if (previous && previous.isConnected) previous.focus();
          });
        }
      };
    }
  ]);
})();
