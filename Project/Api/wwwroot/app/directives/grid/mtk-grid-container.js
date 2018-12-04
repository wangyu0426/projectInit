(function () {
    "use strict";
    angular.module("app").directive("mtkGridContainer", ['$rootScope', '$timeout', '$location', 'config', gridContainer]);

    function gridContainer($rootScope, $timeout, $location, config) {
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
            restrict:    "E",
            replace:     true,
            scope:       {
                currentTab: '=',
                allTabs: '='
            },
            transclude:  true,
            templateUrl: "/app/directives/grid/mtk-grid-container.html",
            link:        function (scope, containerElement, attr) {

                scope.tabs = scope.allTabs;

                if (angular.isUndefined(attr.enableSearch)) {
                    scope.enableSearch = false;
                } else {
                    scope.enableSearch = true;
                }

                scope.select = selectByTab;



                //check if a tab was specified in the querystring,
                //or if the user was viewing a particular tab last time they were on this page
                //Needs to run after the tabs have been loaded
                $timeout(function () {
                    if (attr.selectedTab) {
                        //tab specified in url
                        selectByTitle(attr.selectedTab);
                    } else if (lastActiveTabs.get()){
                        //open previously active tab
                        selectByTitle(lastActiveTabs.get());
                    } else {
                        selectByTab(scope.tabs[0]);
                    }
					setupTabAutoSizing();
                });

                attr.$observe('selectedTab', function(newVal) {if (newVal) selectByTitle(newVal);});

                function activateTab(tab) {
                    tab.active = true;
                    lastActiveTabs.add(titleToPath(tab.title));
                    scope.currentTab = tab;
                    if (tab.tableDef.disableFilter) {
                        // Notify who subscribe to this event that the current tab doesn't have any filter.
                        $rootScope.$broadcast(config.events.updateFilters, {});
                    }
                    /*
                    if (scope.currentTab) {
                        scope.currentTab.title = tab.title;
                    } else {
                        scope.currentTab = {title: tab.title};
                    }
                    */
                }

                function titleToPath(title) {
                    title = title || "";
                    return title.toLowerCase();
                }

                function selectByTab(selectedTab) {
                    angular.forEach(scope.tabs, function (tab) {
                        if (tab === selectedTab) {
                            activateTab(tab);
                        } else { //other tab
                            tab.active = false;
                        }
                    });
                }

                function selectByTitle(tabTitle) {
                    var bFound = false;
                    angular.forEach(scope.tabs, function (tab) {
                        if (titleToPath(tab.title) === titleToPath(tabTitle)) {
                            bFound = true;
                            activateTab(tab);
                        } else { //other tab
                            tab.active = false;
                        }
                    });
                    if (!bFound) {
                        //handle a bad link
                        if (scope.tabs && scope.tabs.length >= 1) {
                            activateTab(scope.tabs[0]);
                        }
                    }
                }

				function setupTabAutoSizing () {
					var bigNav = $('#grid-tab-nav-tabs');
					var littleNav = $('#grid-tab-nav-dropdown');
					var buffer = 50;
					var timeoutHandle;

					check();
					$(window).on('resize.gridContainer', throttledCheck);
					scope.$on('$destroy', function() {
						$(window).off('resize.gridContainer');
					});

					function throttledCheck() {
							if (timeoutHandle) {
								$timeout.cancel(timeoutHandle);
							}
							timeoutHandle = $timeout(check,50);
					}
					function check() {
						if (tabsCanFit()) {
							showBig();
							hideSmall();
						} else {
							hideBig();
							showSmall();
						}
					}

					function showBig() {
						bigNav.removeAttr('style');
					}
					function hideBig() {
						//need to keep it on the page so we know how big the tabs are
						bigNav.css({
							visibility: 'hidden',
							height:0,
							minHeight: 0,
							border: 'none'
						});

					}
					function showSmall() {
						littleNav.show();
					}
					function hideSmall() {
						littleNav.hide();
					}


					function tabsCanFit() {
						var totalWidth = 0;
						var s = '';
						bigNav.children().each(function(i, tab){
							totalWidth += tab.offsetWidth;
							s +=  tab.offsetWidth + ' ';
						});

						//using width() deducts the padding (which contains the search box)
						return (bigNav.width() > totalWidth + buffer);
					}

				}
            }
        };
    }
})();