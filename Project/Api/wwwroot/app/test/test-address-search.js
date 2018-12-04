(function () {
    'use strict';

    angular.module('app').controller('testAddressSearch', ['addressParser', controller]);

    function controller(addressParser) {
        var vm = this;
        vm.address_search = new addressParser.blankAddress();
        vm.address_search1 = new addressParser.blankAddress();
        vm.address_search2 = new addressParser.blankAddress();
    }
})();