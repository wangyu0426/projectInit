(function () {
    'use strict';

    angular.module('app').controller('testActivityFeed', ['server', 'lookupAdaptor', controller]);

    function controller(server, adaptor) {
        var vm = this;

        vm.properties = [];
        vm.propertyId = '';

        server
            .get('entity/lots/query')
            .success(function (lots) {
                vm.properties =  new adaptor(lots, adaptor.useReference).lookup;
            });
    }
})();