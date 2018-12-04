(function () {
    angular.module('app').component('mtkDashboardReconcileWidget', {
            templateUrl: '/app/dashboard/components/mtk-dashboard-reconcile-widget.html',
            bindings: {
                widgetType: '<'
            },
            controller: ['$scope', '$element', '$timeout', '$location', '$uibModal', 'config', 'ux', 'server', 'dashboardHelperService', controller],
            controllerAs: 'vm'
        }
    );

    function controller($scope, $element, $timeout, $location, $uibModal, config, ux, server, dashboardHelper) {
        var vm = this;

        vm.waitingLoad = 2;
        vm.title = "RECONCILIATION";

        vm.AlertLevel = "muted";

        vm.reconcileIcon = 'icon-vf-scale-balanced';

        vm.reconcilesHref = '#/reconciliation/list';
        vm.processItemsHref = '#/transaction/process';
        vm.statusMessage = '';

        vm.bankfeedsSetup = bankfeedsSetup;
        vm.showBankFeedsError = showBankFeedsError;

        var isDemoActive = config.session.Access.DatasetType === 'DemoInstance';
        var isTrial = config.session.Access.SubscriptionStatus === 'Trial' || 
            config.session.Access.SubscriptionStatus === 'TrialExpired' ;
        vm.isBankFeedDisabled = isDemoActive || isTrial;

        vm.showEnableAction = false;

        loadData();

        function loadData() {
            server.getQuietly('entity/dashboard?FilterTypes=Reconciliation,UnprocessedBankTransactions')
                .success(function (data) {
                    if (data.ValueWidgets && data.ValueWidgets.length > 0) {
                        prepareReconcilationWidget(data.ValueWidgets[0]);
                    }

                    if (data.DetailWidgets && data.DetailWidgets.length > 0) {
                        prepareUnprocessedBankTransactionsWidget(data.DetailWidgets[0]);
                    }

                    vm.waitingLoad --;
                });
            server.getQuietly('bankfeeds/status')
                .success(function (data) {
                   vm.bankFeedStatus = data;
                   vm.statusMessage = data.LastStatusText;
                   vm.showEnableAction = !vm.isBankFeedDisabled && !data.IsEnabled;

                    if(vm.bankFeedStatus.IsEnabled ){
                        if (vm.bankFeedStatus.Status === 'Successful' || vm.bankFeedStatus.Status === 'DailySuccessful') {
                            vm.bankFeedsIcon = 'icon-ok-sign success-color' ;
                        } else if (vm.bankFeedStatus.Status === 'DailyNoTransactions') {
                            vm.bankFeedsIcon = 'icon-info-sign' ;
                        } else {
                            vm.bankFeedsIcon =  'icon-warning-sign warning-color';
                        }
                    }

                    vm.bankFeedSuccess = vm.bankFeedStatus.IsEnabled && (vm.bankFeedStatus.Status === 'DailySuccessful' || vm.bankFeedStatus.Status === 'Successful' || vm.bankFeedStatus.Status === 'DailyNoTransactions');

                    vm.waitingLoad --;
                });

                vm.reconcileHref = '#/reconciliation/edit';
        }

        function showBankFeedsError(){
                var modal = $uibModal.open({
                    component: 'mtkBankFeedError',
                    resolve: {
                        bankFeedInfo: function(){                           
                            return  {
                                id: vm.bankFeedStatus.BankFeedId,
                                statusText: vm.bankFeedStatus.LastStatusText,
                                status: vm.bankFeedStatus.Status,
                                detail: vm.bankFeedStatus.LastBankFeedDetail,
                                statusColor : null,
                                updatedOn : vm.bankFeedStatus.UpdatedOn
    
                            }
                        }
                    }
                });
        }

        function bankfeedsSetup(){
            if(vm.bankFeedStatus && vm.bankFeedStatus.IsEnabled && !vm.bankFeedSuccess){
                updateBankFeedCredentials(vm.bankFeedStatus);
            }else{
                $location.url("/setting/bank-account?section=bankFeeds");
            }
        }


        function updateBankFeedCredentials(status) {
            if (!vm.isBankFeedOpen && status.IsEnabled && !vm.bankFeedSuccess ) {
                // prevent to open multiple times
                vm.isBankFeedOpen = true;

                var modal = $uibModal.open({
                    component: 'mtkBankFeedEdit',
                    resolve: {
                        bankFeedInfo: function(){
                            var info = {};
                            info.isUpdateCredentials = true;
                            info.bankFeedLastDate = status.LastFeedDate;
                            info.bankFeedStatus = status.Status;
                            info.accountNumber = status.AccountNumber;
                            return info;
                        }
                    }
                });

                modal.result.then(function (response) { // success
                    if (response) {
                        if (response.IsSuccessful) {                         
                            vm.bankFeedStatus.Status = 'Successful';
                            vm.bankFeedSuccess = true;
                        } 

                        loadData();
                    }
                });

                modal.closed.then(function(){
                    // allow to open again
                    vm.isBankFeedOpen = false;
                });
            }
        }

        function prepareReconcilationWidget(widget) {
            vm.reconciliationIcon = dashboardHelper.getWidgetIcon(widget);
            vm.reconciliationHref = dashboardHelper.getWidgetHref(widget.FilterType);

            /* Reconciliations:

                - if the account is balanced, can you make the icon in the middle of the rec widget green
                - if there are no pending reconciliations AND the account is balanced make the whole widget green

                */
            vm.iconAlertLevel = widget.AlertLevel || 'muted'; // default to empty

            if (vm.iconAlertLevel === 'success') {
                widget.title = 'RECONCILED';
                //Quantity here is the number of pending recs
                if (widget.Quantity === 0) {
                    widget.AlertLevel = 'success';
                } else {
                    widget.AlertLevel = 'muted';
                }

                vm.reconcileIcon = 'icon-vf-scale-balanced';
                vm.reconcileIconA = 'icon-alert-finished';
                vm.reconcileStatus = 'Reconciled';
                vm.isReconciled = true;
                vm.reconciliationIconstyle = 'success-color';  // green
            } else {
                widget.title = 'UNRECONCILED';
                vm.reconcileIcon = 'icon-vf-scale-unbalanced';
                vm.reconcileStatus = 'Unreconciled';
                vm.reconciliationIconstyle = 'warning-color'; // orange
                vm.isReconciled = false;
                widget.AlertLevel = 'muted'; //if it is unreconcilked, doesn't matter if there are no pendings, still show it as muted
            }
        }

        function prepareUnprocessedBankTransactionsWidget(widget) {
            var totalItems = widget.Values[0];

            vm.itemsHref = dashboardHelper.getWidgetHref(widget.FilterType);
            vm.compliment = dashboardHelper.getWidgetCompliment(widget);

            vm.featureNumber = dashboardHelper.getFeatureNumber(widget, totalItems);
            vm.featureLabel = dashboardHelper.getFeatureLabel(widget);
            vm.featureSecond = totalItems.Quantity;
        }
    }
})();