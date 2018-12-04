(function () {
    'use strict';
    angular.module('app')
        .directive('mtkEditable', ['$sanitize', mtkEditable]);

    function mtkEditable ($sanitize) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, el, attrs, ngModel) {

                if (!ngModel) return; // Do not initialize if data model not provided.

                attrs.$set('contenteditable', 'true');

                // currently only handling text
                function read() {  // Update editable content in view.
                    // could return $sanitize(el.html())
                    // - but need to handle html encoding
                    ngModel.$setViewValue(el.text());
                }

                ngModel.$render = function() {
                    el.html(ngModel.$viewValue || '');
                };

                el.bind('blur keyup change', function() {
                    scope.$apply(read);
                });

                el.bind('focusout', function() {
                    // console.log(el.html());
                    scope.$emit('mtk.editable.focusout');
                });

                el.bind('keydown keypress', function (event) {
                    if(event.which === 13) {
                        event.preventDefault();
                        event.target.blur();
                    }
                });
            }
        };
    }

})();