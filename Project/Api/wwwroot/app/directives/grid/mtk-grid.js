(function () {
    angular.module('app').directive('mtkGrid', [ '$timeout', controller]);

    function controller($timeout) {
        return {
            restrict: 'E',
            templateUrl: '/app/directives/grid/mtk-grid.html',
            scope: {
                gridTabs: '=gridTabs',
                selectedIds: '=?',
                selectedTab: '@?',
                currentTab: '=?',
                state: '=?',
                onOpen: '&',
                selectedAll: '=?',
                onGridLoad: '&'
            },
            controller: ['$scope', mtkGridCtrl],
            link: function (scope, containerElement, attrs) {
                if (angular.isUndefined(scope.gridFilterBy)) {
                    scope.gridFilterBy = '';
                }
                scope.enableFilter = attrs.hasOwnProperty('enableFilter');
                scope.isFullscreen = false;
                scope.isFilterOpen = false;
                scope.isFilterEnabled = false;
                scope.isFiltering = false;

                if (angular.isUndefined(attrs.enableSearch)) {
                    scope.enableSearch = false;
                } else {
                    scope.enableSearch = true;
                    scope.searchPlaceHolder = attrs.enableSearch;
                }
                scope.onLoad = function (json) {
                    if ( scope.onGridLoad && scope.onGridLoad() ) {
                        scope.onGridLoad()( json );
                    }
                }
                scope.receiveGridUpdate = function (state) {
                    if (!angular.isUndefined(scope.selectedIds)) {
                        scope.selectedIds = state.selectedIds;
                        // unused selectedRows feature
                        //scope.selectedRows = state.selectedRows;
                        scope.state = state;
                    }

                    if (!angular.isUndefined(scope.selectedAll)) {
                        scope.selectedAll = state.selectedAll;
                        // unused selectedRows feature
                        //scope.selectedRows = state.selectedRows;
                    }

                    $timeout(function () {
                        scope.$apply();
                    });
                };

                scope.toggleFullscreen = function() {
                    $('.pageContainer').toggleClass('fullscreen-grid');
                    scope.isFullscreen = ! scope.isFullscreen;
                    $(window).resize(); //fire this so that handlers pick it up
                };

                if (scope.onOpen) {
                    $(containerElement).on('click', 'tr a.open', function (event) {
                        event.preventDefault();
                        var table = $(containerElement).find('table[role="grid"]').DataTable();
                        var tr = $(this).closest('tr');
                        var obj = table.rows(tr).data()[0];

                        if (obj) {
                            scope.onOpen({data: obj, datatable: table});
                        }
                    });

                    $(containerElement).on('click', '.open-row tbody tr', function (event) {
                        if (event.target) {
                            // don't trigger for A tags
                            if (event.target.nodeName === 'A') {
                                return;
                            }

                            // don't trigger for item inside a A tags
                            if(event.target.parentElement && event.target.parentElement.nodeName === 'A'){
                                return;
                            }

                            // don't trigger for select checkbox
                            if ( event.target.classList.contains( 'icon-grid-row-select' ) || event.target.classList.contains('col-select')){
                                return;
                            }
                        }

                        event.preventDefault();
                        var table = $(containerElement).find('table[role="grid"]').DataTable();
                        var tr = $(this).closest('tr');
                        var obj = table.rows(tr).data()[0];

                        if (obj) {
                            scope.onOpen({data: obj, datatable: table});
                        }
                    });
                }
            }
        };

        function mtkGridCtrl($scope) {
            this.isFilterEnabled = function(value) {
                $scope.isFilterEnabled = value;
            };

            this.isFiltering = function(value) {
                $scope.isFiltering = value;
            };
        }
    }
})();
