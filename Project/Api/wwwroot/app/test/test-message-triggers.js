(function () {
    'use strict';

    angular.module('app').controller('testMessageTriggersController', ['$scope', 'server', 'lookupAdaptor', controller]);

    function controller($scope, server, adaptor) {
        var vm = this;

        vm.properties = [];
        vm.propertyId = '';
        vm.ids= [];

        server
            .get('entity/lots/query')
            .success(function (lots) {
                vm.properties =  new adaptor(lots, adaptor.useReference).lookup;
            });

        $scope.$watch('vm.propertyId', function(value) {
            if (vm.propertyId) {
                vm.ids = [vm.propertyId];
            }
            else {
                vm.ids = [];
            }
        });
    }
})();