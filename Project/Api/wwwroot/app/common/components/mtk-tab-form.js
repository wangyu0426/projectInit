(function () {
    angular.module('app').component('mtkTabForm', {
        templateUrl: '/app/common/components/mtk-tab-form.html',
        bindings: {
            isWizard: '@',
            title: '@',
            onCompleted: '&',
            noSave: '@',
            isShowFooter:'@'
        },
        transclude: true,
        controllerAs: 'vm',
        controller: ['$anchorScroll', controller]
    });

    function controller($anchorScroll) {
        var vm = this;

        vm.save = save;
        vm.cancel = cancel;

        vm.tabs = [];
        vm.activeTab = null;
        vm.select = select;

        vm.saveLabel = vm.noSave ? '' : 'Save & ';

        vm.addTab = function(index, label, controller, setActive) {
            // console.log('tab-form: ' + label);
            var tab = {
                index: index,
                label: label,
                isDisabled: vm.wizard,
                isCompleted: false,
                controller: controller
            };

            // Cannot control the order this is called, so try to correct positioning when adding
            for (var i = 0; i < vm.tabs.length; i++) {
                if (index <= vm.tabs[i].index) {
                    break;
                }
            }
            vm.tabs.splice(i, 0, tab);

            if (!vm.activeTab || setActive) {
                select(tab);
            }
        };

        vm.$onInit = function () {
            // console.log('tab-form: $onInit');
        };

        vm.$postLink = function () {
            // console.log('tab-form: $postLink');
        };

        vm.$onChanges = function () {
            vm.wizard = eval( vm.isWizard );
            vm.showFooter = eval( vm.isShowFooter ) !== false;
        };

        vm.isLastStep = function () {
            return vm.tabs.indexOf(vm.activeTab) === vm.tabs.length -1;
        };

        /////

        function select(tab) {
           // console.log('tab-form: selected tab: ' + tab.label);
           tab.isDisabled = false;
           if (tab !== vm.activeTab) {
               if (vm.activeTab) {
                   vm.activeTab.controller.tabHide();
                   vm.activeTab.isCompleted = vm.wizard && tab.index > vm.activeTab.index;
               }
               tab.controller.tabShow();
               vm.activeTab = tab;
               $anchorScroll('topOfPage');
           }
        }

        function next() {
            // console.log('tab-form: next');
            vm.activeTab.controller.tabSave(function (isSuccessful) {
                if (isSuccessful) {
                    var nextIndex = vm.tabs.indexOf(vm.activeTab) + 1;
                    if (nextIndex < vm.tabs.length) {
                        // Move on to the next tab
                        select(vm.tabs[nextIndex]);
                    } else {
                        if (angular.isFunction(vm.onCompleted)) {
                            vm.onCompleted();
                        }
                    }
                }
            });
        }

        function save() {
            if (vm.wizard) {
                next();
            } else {
                // console.log('tab-form: save');
                // try to save current tab first
                vm.activeTab.controller.tabSave(function (isSuccessful) {
                    if (isSuccessful) {
                        // Start a recursive loop saving every tab again
                        saveChain(0);
                    }
                });
            }
        }

        function cancel() {
            // console.log('tab-form: cancel');
            if (angular.isFunction(vm.onCompleted)) {
                vm.onCompleted();
            }
        }

        function saveChain(saveIndex) {
            // TODO: when $dirty can be used reliably, only actually POST when it is dirty
            if (saveIndex < vm.tabs.length) {
                if (saveIndex == vm.activeTab.index) {
                    // Skip the active tab because it's already been saved
                    saveChain(saveIndex + 1);
                } else {
                    // console.log('tab-form: saveChain(' + saveIndex + ')');
                    vm.tabs[saveIndex].controller.tabSave(function (isSuccessful) {
                        if (isSuccessful) {
                            saveChain(saveIndex + 1);
                        } else {
                            select(vm.tabs[saveIndex]);
                        }
                    });
                }
            } else {
                // completed, can navigate away
                // console.log('tab-form: saved all');
                if (angular.isFunction(vm.onCompleted)) {
                    vm.onCompleted();
                }
            }
        }

    }
})();