(function () {
    'use strict';

    angular.module('app').directive('mtkTabset', ['$timeout', '$location', directive]);

    function directive($timeout, $location) {

        var lastActiveTabs = {
            list: [],
            add:function (tab) {
                return lastActiveTabs.addTab($location.$$path, tab);
            },
            get: function () {
                return lastActiveTabs.getTab($location.$$path);
            },
            addTab: function (path, tab) {
                //check if we have a record already
                var found = lastActiveTabs.getRecord(path);
                if (found) {
                    found.tab = tab;
                } else {
                    lastActiveTabs.list.push({
                        path: path,
                        tab:  tab
                    });
                }
            },
            getRecord: function (path) {
                return lastActiveTabs.list.getBy('path', path);
            },
            getTab:  function (path) {
                var found = lastActiveTabs.getRecord(path);
                if (found) {return found.tab;}
                return null;
            }
        };


        return {
            restrict: 'E',
            replace: true,
            scope: {
                border: '@',
                selectedTab: '@',
                currentTab: '=?'
            },
            transclude: true,
            templateUrl: '/app/directives/common/mtk-tabset.html',
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

            //check if a tab was specified in the querystring,
            //or if the user was viewing a particular tab last time they were on this page
            //Needs to run after the tabs have been loaded
            $timeout(function () {
                if (attr.selectedTab) {
                    //tab specified in url
                    selectByTitle(attr.selectedTab);
                } else {
                    var last = lastActiveTabs.get();
                    if (last) {
                        //open previously active tab
                        selectByTitle(last);
                    }
                }
            }, 100);

            attr.$observe('selectedTab', function(newVal) {if (newVal) selectByTitle(newVal);});
            scope.$watch('currentTab', function(newVal) {if (newVal && newVal.title) selectByTitle(newVal.title);});

            function activateTab(tab) {
                tab.isActive = true;
                lastActiveTabs.add(titleToPath(tab.title));
                if (scope.currentTab) {
                    scope.currentTab.title = tab.title;
                }
                if (tab.onSelect) {
                    tab.onSelect();
                }
            }

            function titleToPath(title) {
                title = title || "";
                return title.toLowerCase();
            }

            function selectByTab(selectedTab) {
                angular.forEach(scope.tabs, function (tab) {
                        tab.isActive = false;

                    });
                activateTab(selectedTab);

            }

            function selectByTitle(tabTitle) {
                var bFound = false;
                angular.forEach(scope.tabs, function (tab) {
                    if (titleToPath(tab.title) === titleToPath(tabTitle)) {
                        bFound = true;
                        activateTab(tab);
                    } else { //other tab
                        tab.isActive = false;
                    }
                });
                if (!bFound) {
                    //handle a bad link
                    if (scope.tabs && scope.tabs.length >= 1) {
                        activateTab(scope.tabs[0]);
                    }
                }
            }

            scope.select = selectByTab;
        }
    }
})();