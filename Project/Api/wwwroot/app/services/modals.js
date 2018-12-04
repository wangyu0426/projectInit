(function(){
    'use strict';

    angular.module('app').service('modalsService', ['$rootScope', '$uibModal', serviceFn]);

    function serviceFn($rootScope, $uibModal){
        return {
            openLinkedModals: openLinkedModals,
            openModal: openModal,
            closePreviousModals: closePreviousModals,

            openReceiptModals: openReceiptModals
        };

        function closePreviousModals() {
            var quitAllModals = 'quitAllModals';
            if ($rootScope.modalResult) {
                $rootScope.modalResult.dismiss(quitAllModals);
                $rootScope.modalResult = null;
            }
        }

        function closePreviousModal() {
            if ($rootScope.modalResult) {
                $rootScope.modalResult.dismiss();
                $rootScope.modalResult = null;
            }
        }

        function openModal(options) {
            closePreviousModal();

            var modalResult = $uibModal.open(options);

            $rootScope.modalResult = modalResult;

            modalResult.result.then(function (response) {
                if (response && response.callbackFn) {
                    response.callbackFn();
                }
                $rootScope.modalResult = null;
            });

            return modalResult;
        }

        function openLinkedModals(modals, index) {
            // set default vale, to support our uglify version
            if(index === undefined){
                index = 0;
            }

            closePreviousModal();

            var currentModal = modals[index];
            var modalResult = $uibModal.open(currentModal);

            $rootScope.modalResult = modalResult;

            var goPrevious = true; // by default

            modalResult.result.then(function (response) {
                if (response && response.callbackFn) {
                    response.callbackFn();
                }

                var nextIndex = index + 1;
                var hasNextModal = modals.length > nextIndex;
                if (response && response.nextAction && hasNextModal) {
                    goPrevious = false;
                    var nextModal = modals[nextIndex];
                    if (response.tenantId) {
                        if (nextModal.resolve.bankTransaction) {
                            var data = nextModal.resolve.bankTransaction();
                            nextModal.resolve.bankTransaction = function () {
                                data.tenancyId = response.tenantId;
                                return data;
                            }
                        }
                    }

                    if (response.tenancyId) {
                        if (nextModal.resolve.tenancyId) {
                            nextModal.resolve.tenancyId = function () {
                                return response.tenancyId;
                            }
                        }

                        // update current modal parameters
                        if(currentModal.resolve.bankTransaction){
                            var data = currentModal.resolve.bankTransaction();
                            currentModal.resolve.bankTransaction = function () {
                                data.tenancyId = response.tenancyId;
                                return data;
                            }
                        } 
                    }

                    openLinkedModals(modals, nextIndex);
                }
            });

            modalResult.closed.then(function (data) {
                var isQuitAll = modalResult.result.$$state.value;
                if(isQuitAll === 'quitAllModals'){
                    return;
                }

                var previousIndex = index - 1;
                var hasPreviousModal = previousIndex >= 0;
                if (hasPreviousModal && goPrevious) {
                    openLinkedModals(modals, previousIndex);
                }
            });           

            return modalResult;
        }

        function openReceiptModals(resolver) {
            var options = {
                component: 'mtkReceiptTenant',
                resolve: resolver
            };

            var nextAction = {
                component: 'mtkReceiptDeposit',
                resolve: {
                    tenancyId: function () {
                        //return null;
                    }
                }
            };

            return openLinkedModals([options, nextAction]);
        }
    }  
}());