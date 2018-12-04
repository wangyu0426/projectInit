(function () {
    'use strict';

    angular.module('app').controller('siteDefaultController', ['$location', 'config', siteDefaultController]);

    function siteDefaultController($location, config) {
        var vm = this;

        vm.isAgent = !!(config.session.Access);
       
    }
})();
