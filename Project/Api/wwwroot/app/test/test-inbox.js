(function () {
    'use strict';

    angular.module('app').controller('testInboxController', ['$scope', 'server', 'ux', 'gridBuilder', controller]);

    function controller($scope, server, ux, gridBuilder) {
        var vm = this;
        vm.selectedTab = null;
        vm.selectedIds = [];
        vm.isProcessing = false;
        vm.moveToSpam = moveToSpam;
        vm.moveToInbox = moveToInbox;

        init();

        function init() {
            var tableThreads =  new gridBuilder.TableDef('/api/comms/threads')
                .dateCol('Date', 'LastMessageOn', '10%')
                .textCol('To' ,'MemberInitials', '8%')
                .linkCol('Subject', 'Subject', '/#/test/threads/[Id]', '30%')
                .linkCol('Contact', 'ContactReference', '/#/contact/card/[ContactId]', '20%')
                .linkCol('Lot', 'LotReference', '/#/property/card/[LotId]', '20%')
                .textCol('Status' ,'Status', '12%')
                .dateCol('Due', 'DueDate', '10%')
                .sort(1, 'desc')
                .serverSide();

            var tableAll =  new gridBuilder.TableDef('/api/comms/inbound')
                .dateCol('Date', 'MessageDate', '10%')
                .textCol('From' ,'From', '25%')
                .textCol('To' ,'To', '15%')
                .linkCol('Subject', 'Subject', '/api/comms/inbound/[Id]', '30%')
                .floatCol('Spam Score', 'SpamScore', '10%')
                .sort(1, 'desc')
                .serverSide();

            var tableSpam =  new gridBuilder.TableDef('/api/comms/inbound/spam')
                .dateCol('Date', 'MessageDate', '10%')
                .textCol('From' ,'From', '25%')
                .textCol('To' ,'To', '15%')
                .linkCol('Subject', 'Subject', '/api/comms/inbound/[Id]', '30%')
                .floatCol('Spam Score', 'SpamScore', '10%')
                .sort(1, 'desc')
                .serverSide();

            vm.gridTabs = [
                { tableDef: tableThreads, title: 'Inbox', entityName:  { name: 'email' }, icon: 'icon-vf-mail2'},
                { tableDef: tableSpam, title: 'Spam', entityName:  { name: 'email' }, icon: 'icon-vf-mail2'},
                { tableDef: tableAll, title: 'All inbound', entityName:  { name: 'email' }, icon: 'icon-vf-mail2'},
            ];
        }

        function moveToSpam() {
            if (vm.isProcessing) { return; } //stops the send button being hit twice in a row
            vm.isProcessing = true;

            server.post('/api/comms/threads/moveToSpam', { MessageThreadIds: vm.selectedIds })
                .success(function (response) {
                    vm.isProcessing = false;
                    ux.refreshData($scope);
                    ux.alert.response(response);
                });
        }

        function moveToInbox() {
            if (vm.isProcessing) { return; } //stops the send button being hit twice in a row
            vm.isProcessing = true;

            server.post('/api/comms/inbound/moveToInbox', { InMessageIds: vm.selectedIds })
                .success(function (response) {
                    vm.isProcessing = false;
                    ux.refreshData($scope);
                    ux.alert.response(response);
                });
        }

    }
})();