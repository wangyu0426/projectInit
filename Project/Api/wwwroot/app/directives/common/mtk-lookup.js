(function () {
    angular.module('app').directive('mtkLookup', ['$timeout', '$filter', directive]);

    function directive($timeout, $filter) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/app/directives/common/mtk-lookup.html',
            scope: {
                source: '=',
                model: '=model',
                placeholder: '@',
                ngDisabled: '&',
                onChange: '&',
                isShowNoMatch: '='
            },
            link: link
        };

        function link(scope, element, attrs) {
            var $s = scope;

            $s.index = 0;
            $s.updateIndex = updateIndex;

            $s.listType = { disable: 0, full: 1, filtered: 2};
            $s.showList = $s.listType.disable;

            $s.init = init;
            $s.cursorOnSearch = cursorOnSearch;
            $s.keyboard = keyboard;
            $s.selectHighlighted = selectHighlighted;
            $s.edit = edit;
            $s.cleanup = cleanup;

            if (!!!$s.source) {
                $s.source = [];
            }

            var shouldFocus = true;
            scope.$watch('model', function () {
                $s.cleanup(false);
            });

            scope.$watchCollection('source', function () {
                $s.cleanup(false);
            });

            scope.$watch('search', function () {
                updateFiltered();
            });

            (function () {
                if (attrs.autofocus !== undefined && shouldFocus) {
                    $timeout(function () {
                        element.find('input').select();
                    });
                    shouldFocus = false;
                }
            })();


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

            function keyboard(event) {
                switch (event.which) {
                    case 9: //tab
                        if (!reset()) {
                            selectHighlighted();
                        }
                        break;
                    case 13: //enter
                        selectHighlighted();
                        $s.showList = $s.listType.disable;
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
                    } else if ($s.showList == $s.listType.filtered) {
                        if ($s.index + 1 < $s.filtered.length) {
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
                        var ul = element.find('ul.' + whichList() + '').first();
                        var li = element.find('ul.' + whichList() + ' > li.active').first();
                        if (li.position().top - li.height() < 1) {
                            ul.scrollTop(li[0].offsetTop); //somehow li[0].offsetTop is different than li.offset().top
                        }
                    });
                }

                function handleScrollDown() {
                    $timeout(function () {
                        var ul = element.find('ul.' + whichList() + '').first();
                        var li = element.find('ul.' + whichList() + ' > li.active').first();
                        if (ul.height() - li.position().top - li.height() < 1) {
                            ul.scrollTop(li[0].offsetTop + li.height() - ul.height()); //somehow li[0].offsetTop is different than li.offset().top
                        }
                    });
                }

                function whichList() {
                    return $s.showList == $s.listType.full ? 'full-list' : 'filtered-list';
                }

                function reset() {
                    var search = $s.search ? $s.search.length : 0;
                    if (search > 0 && $s.filtered.length === 0) {
                        $s.model = '';
                        $s.search = '';
                        changed();
                        return true;
                    }
                    return false;
                }
            }

            function selectHighlighted() {
                //select highlighted item from the dropdown
                if ($s.showList == $s.listType.full) {
                    if ($s.source.length > 0) {
                        $s.model = $s.source[$s.index].id;
                        $s.search = $s.source[$s.index].label;
                        changed();
                    }

                } else if ($s.showList == $s.listType.filtered) {
                    if ($s.filtered.length > 0) {
                        $s.model = $s.filtered[$s.index].id;
                        $s.search = $s.filtered[$s.index].label;
                        changed();
                    }
                }
            }

            function edit() {
                $s.showList = $s.listType.filtered;
                $s.index = 0;
            }

            function cleanup(emptyModelWhenSearchIsEmpty) {
                $s.showList = $s.listType.disable;

                if (emptyModelWhenSearchIsEmpty) {
                    if (!!!$s.search || ($s.search.length === 0)) {
                        $s.index = 0;
                        $s.model = '';
                        $s.search = '';
                        changed();
                        return;
                    }
                }

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
            }

            function updateFiltered() {
                if($s.source) {
                    if($s.search) {
                        $s.filtered = $filter('filter')($s.source, {filter: $s.search});
                        $s.filtered = $filter('limitTo')($s.filtered, 50);
                    }else{
                        $s.filtered = $filter('limitTo')($s.source, 50);
                    }
                }
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