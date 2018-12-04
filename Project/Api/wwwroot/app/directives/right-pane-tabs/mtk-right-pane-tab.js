(function () {
    'use strict';

    angular.module('app').directive('mtkRightPaneTab', [directive]);

    function directive() {
        return {
            restrict: 'E',
            replace: true,
            require: '^mtkRightPaneTabset',
            transclude: true,
            scope: {
                onSelect: '&'
            },
            templateUrl: '/app/directives/right-pane-tabs/mtk-right-pane-tab.html',
            link: link
        };

        function link(scope, element, attr, tabset) {
            scope.title = attr.tabTitle;
            scope.icon = attr.icon;
            scope.isActive = attr.active !== undefined ? true : false;

            tabset.addTab(scope);
        }
    }
})();