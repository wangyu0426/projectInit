(function () {
    'use strict';

    angular.module('app').controller('paymentEditController', ['ux', 'gridBuilder', 'subscriptionUtility',
         controller]);

    function controller(ux, gridBuilder, subscriptionUtility) {
        var vm = this;

        var reportUrlBase = '/app/open/report.html?r=/api/reports/invoices/billing?BillingInvoiceId';

        vm.alert = null;
        vm.dto = null;
        vm.loadingMessage = 'Retrieving subscription information, please wait.';

        init();

        function init() {
            vm.isSaving = false;

            vm.trial = null;
            vm.subscription = null;
            vm.sms = null;

            vm.loadingMessage = '';
            subscriptionUtility.loadData()
                .then(function(data){
                vm.loadingMessage = '';
                vm.subscription = data;

                
            });
        }
    }
})();