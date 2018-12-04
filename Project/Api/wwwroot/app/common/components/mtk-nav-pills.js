(function () {
    angular.module('app').component('mtkNavPills', {
        templateUrl: '/app/common/components/mtk-nav-pills.html',
        bindings: {
            steps: '<',
            selectedStep: '<',
            isWizard: '@',
            onClick: '&'
        },
        controllerAs: 'vm',
        controller: [controller]
    });

    function controller() {
        var vm = this;

        vm.select = select;

        vm.stepItems = [];
        vm.wizard = false;

        vm.$onInit = function () {

        };

        vm.$onChanges = function () {
            vm.wizard = eval(vm.isWizard);

            if (angular.isArray(vm.steps)) {
                if (vm.stepItems.length === 0) {
                    vm.stepItems = vm.steps.map(addStep);
                } else if (vm.stepItems.length != vm.steps.length) {
                    vm.stepItems = vm.steps.map(addStep);
                }

                var lastItem = null;
                vm.stepItems.forEach(function (item) {
                    // When used in a Wizard, selecting an item completes the previous step and enables this one
                    if (vm.wizard && item.label === vm.selectedStep && !item.isActive) {
                        item.isDisabled = false;
                        if (lastItem) {
                            lastItem.isCompleted = true;
                        }
                    }
                    item.isActive = vm.selectedStep === item.label;
                    lastItem = item;
                });
            }
        };

        /////////////


        function addStep(label, index) {
            return {
                label: label,
                isActive: false,
                isDisabled: vm.wizard && index !== 0,
                isCompleted: false
            };
        }

        function select(label) {
            vm.onClick({ label: label });
        }

    }
})();