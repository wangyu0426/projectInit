(function () {
    angular.module('app').component('mtkStatusBankrec', {
        templateUrl: '/app/common/components/mtk-status-bankrec.html',
        bindings: { },
        controller: ['server', statusBoxController],
        controllerAs: 'vm'
    });

    function statusBoxController(server) {
        var vm = this;

        var apiUrl = '/api/financial/reconciliations?IsOnlyCurrent=true';
        var blankState = { color: '', line: '', amount: '', icon: ''  };

        vm.state = blankState;
        vm.isShown = true;
        vm.isLoading = true;
        vm.refresh = refresh;

        refresh();
        /////////////////////

        function refresh() {
            vm.isLoading = true;
            server
                .getQuietly(apiUrl)
                .success(function (bankrecs) {
                    vm.isLoading = false;
                    applyBankRecData(bankrecs);
                });
        }

        function applyBankRecData(bankrecs) {
            // bankrecs is an array of rec objects and it will only be 1 object, because we used the IsOnlyCurrent flag.
            
            if (!bankrecs || bankrecs.length !== 1) {
                vm.isShown = false;
                return blankState;
            }
            var bankrec = bankrecs[0];
            vm.isShown = true;

            if (bankrec.LedgerTotal !== bankrec.JournalBalance) {
                vm.state = {
                    color: 'infobox-error',
                    line: 'Ledger out',
                    amount: bankrec.JournalBalance - bankrec.LedgerTotal,
                    icon: 'icon-vf-scale-unbalanced icon-animated-bell'
                };
            } else if (bankrec.NetBankBalance !== bankrec.LedgerTotal) {
                vm.state = {
                    color: 'infobox-warning',
                    line: 'Bank out',
                    amount: bankrec.NetBankBalance - bankrec.LedgerTotal,
                    icon: 'icon-vf-scale-unbalanced icon-animated-bell'
                };
            } else {
                vm.state = {
                    color: 'infobox-success',
                    amount: 0,
                    line: 'Reconciled',
                    icon: 'icon-vf-scale-balanced'
                };
            }
        }

    }

})();