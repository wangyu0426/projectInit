(function () {
    'use strict';

    angular.module('app').controller('testRelatedActivityFeed', ['server', 'lookupAdaptor', testRelatedActivityFeed]);

    function testRelatedActivityFeed(server, lookupAdaptor) {
        var vm = this;

        vm.properties = [];
        vm.propertyId = 'a6480210-ab68-4b98-ad6d-2a36fd9f6cac';

        server
            .get('/api/entity/lots/query')
            .success(function (lots) {
                vm.properties = new lookupAdaptor(lots, lookupAdaptor.useReference).lookup;
            }
        );
    }
})();