(function () {
    'use strict';
    var CONTROLLER_ID = 'dashboardController';
    angular.module('app').controller(CONTROLLER_ID, ['$rootScope', '$scope', '$window', '$timeout', 'textFormat', 
        'config', 'server', 'ux', 'dashboardHelperService',
        dashboardController]);

    function dashboardController($rootScope, $scope, $window, $timeout, textFormat, 
            config, server, ux,  dashboardHelper) {

        var vm = this;
        var apiPath = 'v1/dashboard';

        vm.currentMonth = textFormat.currentMonth();
        vm.currencySymbol = textFormat.currencySymbol;
        vm.TotalTenantedProperties = 0;
        vm.NumberOfTotalProperties = 0;
        vm.isShowingDetails = false;
        vm.selectedMemberId = null;
        vm.Arrears = [];
        vm.Rec = null;
        vm.Data = {};
        vm.Tasks = {};
        vm.todoIds = {
            MemberId: null
        };

        vm.valueWidgets = [];
        loadDashboard();
        function initData() {
            vm.Data = {};            
        }

        function loadDashboard() {
            initData();
            var url = apiPath;
            var valueWidgetsFilter = ['Seek','Train','Save'];
            vm.valueWidgets = valueWidgetsFilter;
            vm.Data.ValueWidgets = [];
            server.getQuietly(url).success(function (data) {
                vm.Data = data;
                vm.Data.ValueWidgets = data.valueWidgets;
            });
        }

    }
})();
