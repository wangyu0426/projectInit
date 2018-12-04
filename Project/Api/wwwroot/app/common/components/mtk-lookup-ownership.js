(function () {
    angular.module('app').component('mtkLookupOwnership', {
        templateUrl: '/app/common/components/mtk-lookup-ownership.html',
        bindings: {
            folioId: '<',
            ownershipId: '<',
            onDelete: '&',
            onUpdate: '&',
            placeholder: '@',
            includeDefault: '<'
        },
        controller: ['$timeout', '$scope', 'server', lookupFolioController],
        controllerAs: 'vm'
    });

    function lookupFolioController($timeout, $scope, server) {
        var _apiUrl = '/api/entity/lookup/ownership';

        var vm = this;
        var _list = [];

        vm.searchText = '';
        vm.placeholder = '';
        vm.filteredList = [];
        vm.index = 0;
        vm.posIndex = 0;

        vm.showList = false;
        vm.isLoading = false;
        vm.activate = activate;
        vm.search = search;
        vm.cleanup = cleanup;
        vm.keyboard = keyboard;
        vm.updateIndex = updateIndex;
        vm.selectHighlighted = selectHighlighted;
        vm.show = show;
        vm.refresh = refresh;

        $scope.$watch('vm.ownershipId', setBoundedValue);

        init();

        function init() {
            if (vm.folioId) {
                _apiUrl += '?FolioId=' + vm.folioId;
            }

            if (_list.length === 0) {
                fetchList();
            }
        }

        function activate() {
            vm.showList = true;
        }

        function cleanup(clearSearch) {
            vm.showList = false;
            if (clearSearch) {
                setBoundedValue();
            }
        }

        function show() {
            vm.showList = !vm.showList;
        }

        function setBoundedValue() {
            vm.filteredList = _list;

            _list.some(function (item, index) {
                if (item.Id == vm.ownershipId) {
                    vm.index = index;
                    vm.searchText = getSelectedText(item);
                    return true; // break the loop
                }
            });
        }

        function refresh() {

            server.expireCache(_apiUrl);
            fetchList();
            $timeout(function () {
                vm.showList = true;
            });
        }

        function getItems() {
            return server.cacheGetQuietly(_apiUrl, ['Folio','Ownership']);
        }

        function fetchList() {
            vm.isLoading = true;

            getItems()
                .success(function (lookupDto) {
                    _list = lookupDto;
                    if (vm.includeDefault) {
                        var existDefault = _list.filter(function(item) {
                            return item.Label === 'All Properties';
                        });

                        if (!existDefault || existDefault.length === 0) {
                            _list.unshift({Id:'', Label:'All Properties'});
                        }
                    }
                    if (vm.ownershipId || vm.includeDefault) {
                        setBoundedValue();
                    } else {
                        search();
                    }
                    vm.isLoading = false;
                });
        }

        function search() {
            if (vm.searchText && vm.searchText.length > 0) {
                var keyword = escapeRegExp(vm.searchText);
                var regex = new RegExp('\\b' + keyword, 'i');

                vm.filteredList = _list.filter(function (item) {
                    return item.Label.match(regex);
                });

                vm.index = 0;
            } else {
                vm.filteredList = _list;
            }
        }

        function escapeRegExp(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }

        function keyboard() {
            switch (event.which) {
                case 9: //tab
                    selectHighlighted();
                    break;
                case 13: //enter
                    selectHighlighted();
                    break;
                case 27: //escape
                    handleEsc();
                    break;
                case 38: //up
                    handleUp();
                    break;
                case 40: //down
                    if (!vm.showList) {
                        vm.showList = true;
                    }
                    handleDown();
                    break;
            }

            function handleUp() {
                event.preventDefault();
                if (vm.index > 0) {
                    vm.index--;
                    vm.posIndex = vm.index;
                    return true;
                }
                return false;
            }

            function handleDown() {
                if (vm.index + 1 < vm.filteredList.length) {
                    vm.index++;
                    vm.posIndex = vm.index;
                    return true;
                }
            }

            function handleEsc() {
                cleanup();
            }
        }

        function updateIndex(i) {
            vm.index = i;
        }

        function selectHighlighted() {
            if (vm.index !== -1 && vm.filteredList.length > 0) {
                var selected = vm.filteredList[vm.index];
                vm.searchText = getSelectedText(selected);
                setOwnershipId(selected.Id);
            } else {
                clearOwnershipId();
            }
        }

        function getSelectedText(item) {
            return item.Label;
        }

        function setOwnershipId(id) {
            vm.onUpdate({ ownershipId: id});
            vm.showList = false;
        }

        function clearOwnershipId() {
            vm.onDelete(vm.ownershipId);
        }
    }

})();