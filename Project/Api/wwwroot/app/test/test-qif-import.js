(function () {
    'use strict';
    var controllerId = 'testQifImport';
    angular.module('app').controller(controllerId, ['$http', '$routeParams','mtkAlert', 'config', 'server', 'gridBuilder', viewmodel]);

    function viewmodel($http, $routeParams,  mtkAlert, config, server, gridBuilder) {

        var vm = this;
        vm.title = 'Test QIF Import';
        vm.fileName = "";
        vm.isForceImport = false;
        var apiUrl = '/api/financial/common/qif/import';

        vm.save = function () {
            var fd = new FormData();
            fd.append('IsForceImport',vm.isForceImport);
            var files= $('#importFile')[0].files;
            fd.append('file', files[0]);
            $http.post(apiUrl, fd, {
                    transformRequest: angular.identity, headers: {'Content-Type': undefined}
                }
            ).success(function (response) {

                }
            ).error(function (error, b) {

                }
            );
        };

        vm.selectedTab = $routeParams.tab;
        vm.selectedIds =[];

        vm.tableTransactions = new gridBuilder.TableDef('/api/bankstatement/qif/transactions')
            .dateCol('Date', 'Date')
            .textCol('Number','Number')
            .textCol('Payee','Payee')
            .amountCol('Amount','Amount')
            .textCol('Category','Category')
            .textCol('Memo','Memo')
            .enumCol('ClearedStatus','ClearedStatus')
            .sort(1, 'desc')
            .serverSide();

        vm.tableBalances = new gridBuilder.TableDef('/api/bankstatement/qif/balances')
            .dateCol('Date', 'StatementBalanceDate')
            .textCol('Type','Type')
            .textCol('Name','Name')
            .amountCol('Balance','StatementBalance')
            .sort(1, 'desc')
            .serverSide();

        vm.tableImports = new gridBuilder.TableDef('/api/bankstatement/qif/imports')
            .dateCol('Imported On', 'ImportedOn')
            .dateCol('From Date','FromDate','8em')
            .dateCol('To Date','ToDate','8em')
            .enumCol('Status','ImportStatus')
            .sort(1, 'desc')
            .serverSide();

        var myEntityName = {
            name: 'transaction',
            pluralName: 'transactions'
        };
        var myEntityNameBalance = {
            name: 'statement balance',
            pluralName: 'statement balances'
        };
        var myEntityNameImports = {
            name: 'imported file',
            pluralName: 'imported files'
        };

        vm.gridTabs = [
            { tableDef: vm.tableTransactions, title: 'Transactions', entityName: myEntityName },
            { tableDef: vm.tableBalances, title: 'Balances', entityName: myEntityNameBalance },
            { tableDef: vm.tableImports, title: 'Bank statements', entityName: myEntityNameImports }
        ];
    }
})();

