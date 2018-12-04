(function () {
    'use strict';

    angular.module('app').controller('testCard', ['$scope', 'server', 'lookupAdaptor', controller]);

    function controller($scope, server, adaptor) {
        var vm = this;

        vm.dto = {};
        vm.properties = [];
        vm.propertyId = "";
        vm.selectedProperty = null;

        (function () {
            //init
            server
                .get('entity/lots/query')
                .success(function (lots) {
                    vm.properties = new adaptor(lots, adaptor.useReference).lookup;
                });
        })();

        $scope.$watch(function () {
            return vm.propertyId;
        }, function (id) {
            if (id) {
                server
                    .get('entity/propertyfolders/' + id)
                    .success(function (dto) {
                        vm.dto = dto;
                    });
            }
        });
    }
})();
