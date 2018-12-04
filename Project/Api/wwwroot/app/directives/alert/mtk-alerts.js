(function () {
    "use strict";

    angular.module('app').directive("mtkAlerts", ['server',  directive]);

    function directive(server) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            templateUrl: '/app/directives/alert/mtk-alerts.html',
            scope: {
                priority: '@'
            },
            link: function (scope) {

            }
        };


    }

})();