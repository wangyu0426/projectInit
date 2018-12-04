(function () {
    'use strict';

    angular.module('app').directive('mtkTab', [directive]);

    function directive() {
        return {
            restrict: 'E',
            replace: true,
            require: '^mtkTabset',
            transclude: true,
            scope: {
                onSelect: '&',
                exclude: '='
            },
            templateUrl: '/app/directives/common/mtk-tab.html',
            controller: ['$scope', controller],
            link: link
        };

        function controller($scope) {
            this.betaFeature = function() {
                $scope.isBetaFeature = true;
            };

            this.hide = function() {
                $scope.isHidden = true;
            };
        }

        function link(scope, element, attr, tabset) {
            scope.title = attr.title;
            scope.isGridTab = attr.grid !== undefined ? true : false;
            scope.isActive = attr.active !== undefined ? true : false;

            var exclude = _.isUndefined(scope.exclude) ? false : scope.exclude;
            if (!exclude) {
                tabset.addTab(scope);
            }
        }
    }
})();