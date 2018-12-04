(function () { 
    'use strict';

    angular.module('app').controller('notificationsController',
        ['$rootScope', '$scope','$timeout', 'config', 'textFormat', 'notificationService', notifications]);

    function notifications($rootScope, $scope, $timeout, config, textFormat, notificationService) {
        var vm = this;

        vm.alerts = [];
        vm.disabled = false;
        vm.reload = function() {
            location.reload();
        };

        vm.isDisplayedBefore = false;

        vm.notificationService = notificationService;
        vm.clickAlerts = clickAlerts;

        vm.disconnected = false;
        vm.disconnectedRequireReload = false;
        vm.userSignedOut = false;
        var disconnectionTimer = null;

        vm.clearAll = notificationService.clearAlerts;
        vm.selectEntityType = selectEntityType;

        vm.groupedAlerts = [];

        init();

        return vm;

        // FUNCTIONS //

        function init() {
            vm.disabled = notificationService.disabled;

            $rootScope.$on(config.events.serverDisconnected, serverDisconnected);
            $rootScope.$on(config.events.serverReconnected, serverReconnected);
            $rootScope.$on(config.events.userSignedOut, userSignedOut);

            //notificationService.loadUnreadAlerts();
            loadAlerts();

            // reset isDisplayedBefore after a short time
            $scope.$watch('vm.isDisplayedBefore', function() {
                if(vm.isDisplayedBefore){
                    $timeout(function(){
                        vm.isDisplayedBefore = false;
                    },200);
                }
            });
        }

        function clickAlerts() {
            // only load it once, it's very expensive
            if (notificationService.waitingToLoadingAlerts) {
                loadAlerts().then(notificationService.setRead);
            } else {
                vm.groupedAlerts = groupAlerts(notificationService.newAlerts);
                notificationService.setRead();
            }
        }

        function groupAlerts(alerts) {
            var grouped = _.groupBy(notificationService.newAlerts, function (alert) { 
                return textFormat.untense(alert.Action) + ' ' + textFormat.sanitiseLinkType(selectEntityType(alert.LinkType, alert.RegardingType, alert.Action)); 
            });
            var items = [];
            for (var property in grouped) {
                if (grouped.hasOwnProperty(property)) {
                    var itemGroup =  {
                        title: property,
                        alerts: grouped[property]                        
                    };
                    itemGroup.limit = Math.min(itemGroup.alerts.length, 3);
                    items.push(itemGroup);
                }
            }
            return items;
        }

        function loadAlerts() {
            return notificationService.loadUnreadAlerts().then(function () {
                vm.groupedAlerts = groupAlerts(notificationService.newAlerts);
            });
        }
        function serverDisconnected(scope, eventObj) {
            if (!disconnectionTimer) {
                vm.disconnected = true;

                $timeout(function () {
                    $scope.$apply();
                });

                disconnectionTimer = $timeout(function () {
                    disconnectionTimer = null;
                    vm.disconnectedRequireReload = true;
                }, 10000);
            }
        }

        function serverReconnected(scope, eventObj) {
            var needUpdate = vm.disconnected || vm.disconnectedRequireReload;

            if (needUpdate) {
                vm.disconnected = false;
                vm.disconnectedRequireReload = false;

                $timeout(function () {
                    $scope.$apply();
                });

                if (disconnectionTimer) {
                    $timeout.cancel(disconnectionTimer);
                    disconnectionTimer = null;
                }
            }
        }

        function userSignedOut(scope, eventObj) {
            vm.userSignedOut = true;
            $timeout(function () {
                $scope.$apply();
            });
        }

        function selectEntityType(linkType, regardingType, action) {
            if (regardingType === "Bill" && linkType === "Ownership") {
                return "Bill";
            } else if (linkType === "Folio" && regardingType === "Ownership") {
                return "Owner";
            } else {
                return linkType;
            }
        }

    }
})();