(function () {
    angular.module('app').controller('userEditController', ['$scope','$routeParams' ,'server', 'config', 'ux', controller]);

    function controller($scope, $routeParams,  server, config, ux) {
        var vm = this;

        vm.session = config.session;
        vm.selectedTab = $routeParams.tab;
        vm.enableSupport = enableSupport;

        init();

        function init() {
            server.getQuietly('/api/sec/user/portfolios')
                .success(function(data) {
                    vm.portfolio = getCurrentPortfolio(data, vm.session.Access.CustomerId);
                    if (vm.portfolio) {
                        vm.isSupportEnabled = moment(vm.portfolio.CustomerSupportExpiresOn).isAfter(moment());
                    }
                });
        }

        function enableSupport() {
            if (vm.portfolio) {
                server.post('/api/support/portfolio/' + vm.portfolio.CustomerId, {SupportExpiresOnUpdate: true})
                    .success(function (response) {
                            ux.alert.response(response, 'Support enabled');
                            init();
                        }
                    );
            }
        }

        function getCurrentPortfolio(portfolios, currentCustomerId) {
            for(var i=0; i < portfolios.length; i++) {
                if (portfolios[i].CustomerId === currentCustomerId) {
                    return portfolios[i];
                }
            }
        }
    }
})();
