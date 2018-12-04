(function () {
    angular.module('app').component('mtkLabels', {
        templateUrl: '/app/common/components/mtk-labels.html',
        bindings: {
            labels: '<',
            type: '<'
        },
        controller: ['labelsParser', controller],
        controllerAs: 'vm'
    });

    function controller(labelsParser) {
        var vm = this;
        vm.data = null;

        vm.$onChanges = function () {
            vm.data = labelsParser.parseLabels(vm.labels, vm.type);
            console.log(vm.data);
        };
    }

})();