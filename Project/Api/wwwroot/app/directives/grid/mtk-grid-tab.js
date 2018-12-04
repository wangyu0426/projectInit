(function () {
    "use strict";
    angular.module("app").directive("mtkGridTab", [function () {
        return {
            restrict: "E",
            replace: true,
            require: "?^mtkGridContainer",
            transclude: true,
            scope: {
                active: "=",
                title:'@label',
                icon: '@icon'
            },
            templateUrl: "/app/directives/grid/mtk-grid-tab.html",
            link: function (scope) {
                scope.active = (scope.active !== undefined) ? scope.active : false;
            }
        };
    }]);
})();