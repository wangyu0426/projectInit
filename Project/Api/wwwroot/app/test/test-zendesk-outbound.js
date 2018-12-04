(function () {
    'use strict';

    angular.module('app').controller('testZendeskOutboundController', [ 'server', controller]);

    function controller(server) {
        var vm = this;

        vm.events = [
            'Approved conversion balances',
            'Activated a new member',
            'Started a new subscription',
        ];

        
        vm.newEvent = function(eventName){
            server.post('/api/outbound/event', {EventName:eventName});
        };

    }
})();
