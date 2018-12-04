(function () {
    angular.module( 'app' ).directive('mtkAutocomplete', ['$timeout', '$filter', directive]);

    function directive($timeout, $filter) {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: '/app/directives/common/mtk-autocomplete.html',
            scope: {
                source: '=',
                model: '=model',
                itemSelected: '=',
                placeholder: '@',
                idField: '@',
                templateField: '@',
                ngDisabled: '&',
                ngBlur: '&',
                refreshData: '&',
                onChange: '&',
                delay:'@'
            },
            link: link
        };

        function link(scope, element, attrs) {
            var $s = scope;

            $s.index = 0;
            $s.updateIndex = updateIndex;
            
            $s.listType = { disable: 0, full: 1};
            $s.showList = $s.listType.disable;

            $s.init = init;
            $s.cursorOnSearch = cursorOnSearch;
            $s.keyboard = keyboard;
            $s.selectHighlighted = selectHighlighted;
            $s.edit = edit;
            $s.cleanup = cleanup;
            $s.getTemplate = getTemplate;
            $s.timeout = null;
            
            if (!!!$s.source) {
                $s.source = [];
            }

            var shouldFocus = true;
            scope.$watch( 'model', function () {
                if ( $s.model === '' ) {
                    $s.showList = $s.listType.disable;
                }
                if ( $s.timeout ) {
                    $timeout.cancel( $s.timeout )
                }
                $s.timeout = $timeout( function () {
                    $s.refreshData();
                    $s.timeout = null;
                },  $s.delay||100);
            } );
            
            function updateIndex(i) {
                $s.index = i;
            }

            function init() {
                $s.index = 0;

                var found = $s.source.some(function (item, index) {
                    if (item.id == $s.model) {
                        $s.index = index;
                        return true; //break the loop
                    }
                });

                if (found) {
                    $timeout(function () {
                        var ul = element.find("ul.full-list").first();
                        ul.scrollTop(0);
                        var item = element.find('ul.full-list > li.active').first();
                        if (item) {
                            var pos = item.position();
                            if (pos) {
                                ul.scrollTop(pos.top);
                            }
                        }
                    });
                } else {
                    $timeout(function () {
                        element.find("ul.full-list").first().scrollTop(100); //scroll it down before immediately scrolling back up to fix painting error
                        element.find("ul.full-list").first().scrollTop(0);
                    });
                }
            }

            function cursorOnSearch() {
                $timeout(function () {
                    element.find('input').focus();
                    $s.showList = $s.listType.full;
                });
            }
            function getTemplate( item ) {
                return item[ $s.templateField ];
            }

            function keyboard(event) {
                switch (event.which) {
                    case 9: //tab
                        selectHighlighted();
                        break;
                    case 13: //enter
                        selectHighlighted();
                        $s.showList = $s.listType.disable;
                        //don't submit the form
                        event.preventDefault();
                        break;
                    case 27: //escape
                        handleEsc();
                        break;
                    case 38: //up
                        if (handleUp()) {
                            handleScrollUp();
                        }
                        break;
                    case 40: //down
                        if (handleDown()) {
                            handleScrollDown();
                        }
                        break;
                }

                function handleEsc() {
                    $s.showList = $s.listType.disabled;
                }

                function handleUp() {
                    event.preventDefault();
                    if ($s.index > 0) {
                        $s.index--;
                        return true;
                    }
                    return false;
                }

                function handleDown() {
                    event.preventDefault();
                    if ($s.showList == $s.listType.full) {
                        if ($s.index + 1 < $s.source.length) {
                            $s.index++;
                            return true;
                        }
                    } else {
                        cursorOnSearch();
                        return false;
                    }
                    return false;
                }

                function handleScrollUp() {
                    $timeout(function () {
                        var ul = element.find('ul.full-list').first();
                        var li = element.find('ul.full-list > li.active').first();
                        if (li.position().top - li.height() < 1) {
                            ul.scrollTop(li[0].offsetTop); //somehow li[0].offsetTop is different than li.offset().top
                        }
                    });
                }

                function handleScrollDown() {
                    $timeout(function () {
                        var ul = element.find('ul.full-list').first();
                        var li = element.find('ul.full-list > li.active').first();
                        if (ul.height() - li.position().top - li.height() < 1) {
                            ul.scrollTop(li[0].offsetTop + li.height() - ul.height()); //somehow li[0].offsetTop is different than li.offset().top
                        }
                    });
                }
            }

            function selectHighlighted() {
                //select highlighted item from the dropdown
                if ($s.source.length > 0) {
                    $s.search = $s.source[ $s.index ][ $s.templateField ];
                    $s.itemSelected = $s.source[ $s.index ]
                    changed();
                }
            }

            function edit() {
                $s.showList = $s.listType.full;
            }

            function cleanup() {
                $s.showList = $s.listType.disable;

                var found = $s.source.some(function (item, index) {
                    if (item.id == $s.model) {
                        $s.index = index;
                        $s.search = item.label;
                        return true; //break the loop
                    }
                });

                if (!found) {
                    $s.search = '';
                }
                $s.ngBlur();
            }

            function changed() {
                if (angular.isFunction(scope.onChange)) {
                    $timeout(function () {
                        scope.onChange({ value: scope.model });
                    });
                }
            }
        }
    }
})();