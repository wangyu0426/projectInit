(function() {
    'use strict';

    angular.module('app').component('mtkModifyCC', {
        templateUrl: '/app/payment/components/mtk-modify-cc.html',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&'
        },
        controller: [ 'ux', 'subscriptionUtility','permissionService', controller],
        controllerAs: 'vm'
    });

    function controller( ux, subscriptionUtility, permissionService) {
        var vm = this;

        vm.editable = vm.resolve.isOldSubscriber || permissionService.isEditAllowed;
        vm.newCreditCard = {
            cardNumber: '',
            cardType: '',
            cardExpiry: '',
            cardCvc: ''
        };

        // modal control buttons
        vm.save = function () {
            modifyCreditCard();
        };

        vm.cancel = function () {
            vm.dismiss({$value: 'cancel'});
        };

        function modifyCreditCard() {
            var isNotValid = vm.newCreditCard && (!vm.newCreditCard.cardType || vm.newCreditCard.cardType === 'Unsupported');

            if (isNotValid) {
                ux.alert.warning('Credit card details is not valid.');
            } else {
                var ccForm = angular.element('#creditForm');
                subscriptionUtility.modifyCreditCardSave(ccForm).then(function(data) {
                    vm.close({$value: data});
                }, function(reason) {
                    ux.alert.warning(reason);
                });
            }
        }
    }
})();