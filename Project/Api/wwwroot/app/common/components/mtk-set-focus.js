(function() {
    "use strict";
    angular.module("app").directive('mtkSetFocus', ['$timeout', directive]);

    function directive ($timeout) {
        return {
            restrict: 'A',

            link: function (scope, element, attr) {
                // This should be used directly on input elements only
                if (element.prop('nodeName') === 'INPUT') {
                    scope.$watch(attr.mtkSetFocus, setFocus);
                }

                function setFocus(newValue, oldValue) {
                    if (newValue && (newValue != oldValue)) {
                        $timeout(function () {
                            element.focus();
                        });
                    }
                }
            }
        };

    }
})();