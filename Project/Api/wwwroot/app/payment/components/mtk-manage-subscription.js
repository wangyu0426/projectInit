(function() {
    'use strict';

    angular.module('app')
        .component('mtkManageSubscription', {
            templateUrl : '/app/payment/components/mtk-manage-subscription.html',
            bindings: {
                subscription : '<'
            },
            controllerAs: 'vm',
            controller: ['ux', '$uibModal', 'subscriptionUtility', controller]
        });

    function controller(ux, $uibModal, subscriptionUtility) {
        var vm = this;

        vm.modifyCCDetails = modifyCCDetails;

        vm.isLoading = true;
        // on parent changes : data ready
        vm.$onChanges = function () {
            // refresh these properties
            if ( vm.subscription ) {
                vm.isLoading = false;
                 if ( !vm.subscription.currentPlanId ) {
                    vm.subscriptionText = 'Your PropertyMe Subscription Has Been Cancelled';
                }
            }
        };
        function removeSubscription() {
            ux.modal.confirm('Are you sure you want to cancel your subscription?', function (confirmed) {
                if (confirmed) {
                    subscriptionUtility.removeSubscription()
                        .success(handleResponse);
                }
            });
        }

        function handleResponse(response) {
            if (!response) return;

            if(response.error) {
                ux.alert.warning(response.error.message);
            } else {
                subscriptionUtility.clearSessionReload();
            }
        }

        function modifyCCDetails() {
            var modal = $uibModal.open({
                component: 'mtkModifyCC',
                resolve: {
                    isOldSubscriber: function () {
                        return ( vm.subscription.isSetupFeePaid && !vm.subscription.currentPlanId );
                    }
                }
            });

            // handle modal result
            modal.result.then(function (newCreditCard) { // success
                if (newCreditCard) {
                    subscriptionUtility.clearSessionReload();
                 }
            }, function (reason) {  // failed
                switch(reason) {
                    case 'cancel' :
                        // nothing to do
                        break;
                }
            });
        }

    }

})();