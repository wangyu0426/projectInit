(function () {
    'use strict';

    angular.module('app').directive('mtkRightPaneTabset', ['$timeout', '$location', 'config', directive]);

    function directive($timeout, $location, config) {


        return {
            restrict: 'E',
            replace: true,
            scope: {
                isMouseClick: "=?"
            },
            transclude: true,
            templateUrl: '/app/directives/right-pane-tabs/mtk-right-pane-tabset.html',
            controller: ['$scope', controller],
            link: link
        };

        function controller($scope) {
            $scope.tabs = [];

            this.addTab = function (tab) {
                $scope.tabs.push(tab);
            };
        }

        function link(scope,containerElement, attr) {

            if (scope.tabs.length) {
                activateTab(scope.tabs[0]);
            }

            scope.$on(config.events.noItemsInTaskList, function(event){
                // if there is no items in task list, then active the next "Activity" tab
                if(scope.tabs.length > 1 && scope.tabs[1]) {
                    selectByTab(scope.tabs[1]);
                }
            });

            function activateTab(tab) {
                tab.isActive = true;
                if (scope.currentTab) {
                    scope.currentTab.title = tab.title;
                }
                if (tab.onSelect) {
                    tab.onSelect();
                }
            }


            function selectByTab(selectedTab) {
                angular.forEach(scope.tabs, function (tab) {
                        tab.isActive = false;

                    });
                activateTab(selectedTab);

            }
            
            scope.isMouseClick = false;
            scope.select = function(tab) {
                scope.isMouseClick = true;
                selectByTab(tab);
            };
        }
    }
})();