(function () {
    'use strict';

    var controllerId = 'propertyListController';
    angular.module('app').controller(controllerId, ['$routeParams', 'gridBuilder', 'config', 'textFormat', 'modalDetail', '$scope', lots]);

    function lots($routeParams, gridBuilder, config, textFormat, modalDetail, $scope) {
        var apiPath = 'api/v1/usage' ;


        var vm = this;
        vm.pageTitle = 'Api Usages';
        //vm.selectedTab = $routeParams.tab;
        vm.selectedIds = [];

        var tableActive = new gridBuilder.TableDef(apiPath )
            .textCol('Api', 'uri','20%')
            .numberCol('Usage', 'usage','20%')
            .dateTimeCol('Start On', 'usageStartOn','25%')
            .dateTimeCol('Ends On', 'usageEndsOn', '25%')
            .dateTimeCol('Log On', 'logOn', '16%')
            .sort(3,'desc')
            .serverSide();

            var itemName = {
                name: 'Record',
                pluralName: 'Records'
            };
        vm.gridTabs = [
            { tableDef: tableActive, title: 'All', entityName: itemName },

        ];
    }
})();