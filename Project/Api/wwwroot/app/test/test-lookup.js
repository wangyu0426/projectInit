(function () {
    angular.module('app').controller('testLookupController', ['$routeParams', controller]);

    function controller($routeParams) {
        var vm = this;

        vm.selectedFolioId = $routeParams.id;
        vm.selectedOwnershipId = $routeParams.OwnershipId;
        vm.updateOwnershipValue = updateOwnershipValue;

        function updateOwnershipValue(newValue) {
            vm.selectedOwnershipId = newValue;
        }
    }
})();