(function () {
    'use strict';

    angular.module('app').controller('testDocumentList', ['server', 'lookupAdaptor', controller]);

    function controller(server, adaptor) {
        var vm = this;

        vm.properties = [];
        vm.propertyId = '';

        (function () {
            //init
            server
                .get('entity/lots/query')
                .success(function (lots) {
                    vm.properties = new adaptor(lots, adaptor.useReference).lookup;
                });
        })();
    }
})();