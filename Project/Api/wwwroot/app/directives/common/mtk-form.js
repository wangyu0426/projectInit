(function () {
    'use strict';
    angular.module('app').directive('mtkForm', ['$window', 'logger','$timeout', function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            templateUrl: '/app/directives/common/mtk-form.html',
            //scope: false
            // We shouldn't be creating a new scope for the form object, this should be a attr directive
            scope: {
                icon:'@'
            }
        };
    }]);
})();