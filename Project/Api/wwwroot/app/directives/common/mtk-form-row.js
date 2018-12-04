(function () {
    "use strict";
    angular.module("app").directive("mtkFormRow", function () {
        return {
            restrict: "E",
            transclude: true,
            replace: true,
            templateUrl: '/app/directives/common/mtk-form-row.html',
            scope: {
                label:"@",
                helpId: '@'
            }
        };
    });
})();