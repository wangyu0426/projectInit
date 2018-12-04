(function () {
    'use strict';

    angular.module('app').controller('testEmailRouteController', ['$window', 'server', 'ux', controller]);

    function controller($window, server, ux) {
        var vm = this;

        vm.email = "";
        vm.addRoute = addRoute;
        vm.cancel = cancel;

        load();

        function load() {
            server.get('/api/comms/emailroutes')
                .success(function (data) {
                    vm.registered = data;
                });

        }

        function addRoute() {
            server.post('/api/comms/emailroutes/add', { Email: vm.email })
                .success(function (response) {
                    ux.alert.response(response, 'Register new email');

                    load();
                });
        }

        function cancel() {
            $window.history.back();
        }
    }
})();