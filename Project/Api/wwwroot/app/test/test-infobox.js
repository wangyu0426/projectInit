(function () {
    angular.module('app').controller('testInfoboxController', ['$scope', controller]);

    function controller(scope) {
        scope.inArrearsData = 571.44;

        scope.ledgerOut = {
            UnbalancedAmount: 0,
            LedgerTotal: 10,
            JournalBalance: 20,
            NetBankBalance: 0
        };

        scope.bankOut = {
            UnbalancedAmount: 0,
            LedgerTotal: 1,
            JournalBalance: 1,
            NetBankBalance: 33
        };

        scope.reconciled = {
            UnbalancedAmount: 101,
            LedgerTotal: 101,
            JournalBalance: 101,
            NetBankBalance: 101
        };

        scope.dueData = {
            Days1: { Total: 0.01, Count: 100 },
            Days30: { Total: 30.00, Count: 300 },
            Days60: { Total: 60.01, Count: 600 }
        };
        scope.dueDataOnly1And30 = {
            Days1: { Total: 0.01, Count: 100 },
            Days30: { Total: 30.00, Count: 300 }
        };
    }
})();