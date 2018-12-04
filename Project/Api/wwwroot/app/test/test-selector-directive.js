(function () {
    angular.module("app")
        .controller("selectorController", ["$scope", "server", function ($scope, server) {
            var vm = this;
            vm.myObjectOptions = [
                {Id: 'typeA', Name: 'First Type'},
                {Id: 'typeB', Name: 'Second Type'},
                {Id: 'typeC', Name: 'Third Type'}
            ];
            vm.myStringOptions = ['Tom', 'Harry', 'Jonathan'];

            vm.chartValue = '';

            vm.stringValue = '';

            vm.Property = {
                LotType: 'House',
                Address: {
                    Text: '34 William St, Kings Cross, NSW 2011',
                    Number: 34,
                    Street: 'William St',
                    Suburb: 'Kings Cross',
                    State: 'NSW',
                    PostalCode: '2011'},
                possibleLotTypes: ['House', 'Apartment', 'Unit', 'Townhouse', 'Villa'],
                typeValue: 'typeC',
                flagValue:false
            };

            vm.myObjectOptionsTest = [
                {}
            ];

            vm.GetFromSever = function () {
                server.get("financial/chartaccounts").success(function (data) {
                    vm.myObjectOptionsTest = data;
                });
            };

            vm.updateSource = function () {
                vm.myObjectOptionsTest = ["Updated 1", "Updated 2","Another one"];
            };

            vm.stringValue = false;

            vm.updateSource();
        }
        ]);
})();
