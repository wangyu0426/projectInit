(function () {
    'use strict';

    angular.module('app').controller('testBankFeedsController', ['$scope', 'server', 'ux', testBankFeedsController]);

    function testBankFeedsController($scope, server, ux) {
        var vm = this;

        $scope.$watch('vm.bankSlug', updateSelectedBank);

        server.get('/api/bankfeeds/institutions').success(
            function (institutions) {

                vm.banksAdaptor = new ux.lookupAdaptor(institutions, function(bank) {
                    return {
                        id: bank.Slug,
                        label: bank.Name,
                        template: bank.Name,
                        filter: bank.Name
                    };
                });
                vm.banks = vm.banksAdaptor.lookup;
            }
        );

        vm.getMfaHeader = getMfaHeader;
        vm.getMyBankFeeds = function(){
            if(vm.mfaRequired){
                var mfaDto = {
                    MultiFactorFields: getFieldValus(vm.mfaRequired.Fields),
                    SubmitTo: vm.mfaRequired.SubmitTo,
                    Customer: vm.mfaRequired.Customer
                };
                server.post('/api/bankfeeds/customer/mfa', mfaDto).success(
                    function (response) {
                        vm.mfaRequired = null;

                        if(response && response.Type === "additionalInformationNeeded"){
                            vm.mfaRequired = response;
                        }

                        vm.bankData = response;
                    }
                );
            }else if(vm.password && vm.userName) {
                var dto = {
                    bankSlug: vm.bankSlug,
                    userName: vm.userName,
                    password: vm.password,
                    third: vm.third,
                    fourth: vm.fourth
                };
                server.post('/api/bankfeeds/customer/data', dto).success(
                    function (response) {
                        vm.mfaRequired = null;

                        if(response && response.Type === "additionalInformationNeeded"){
                            vm.mfaRequired = response;

                            vm.mfaRequired.Fields.forEach( function(field){
                                if( field.Type === 'Options'){
                                    field.options = Object.entries(field.Values).map( function(keyValue){
                                        return {Id: keyValue[0], Name:keyValue[1]};
                                    });

                                    field.lookup = new ux.lookupAdaptor(field.options, ux.lookupAdaptor.useName).lookup;
                                }
                            });
                        }

                        vm.bankData = response;
                    }
                );
            }
        };

        function getMfaHeader(){
            if(vm.mfaRequired){
                if(getFieldValus(vm.mfaRequired.Fields).length === 1) {
                    return getHeadValus(vm.mfaRequired.Fields).join('; ');
                }else{
                    return vm.mfaRequired.Title;
                }
            }
        }

        function getFieldValus(fields){
            return fields.reduce(function(filtered, field) {
                if (field.FieldId) {
                    var inputField = { Fieldid: field.FieldId, Fieldvalue: field.inputValue };
                    filtered.push(inputField);
                }
                return filtered;
            }, []);
        }

        function getHeadValus(fields){
            return fields.reduce(function(filtered, field) {
                if (field.Type === 'Instructions' || field.Type === 'Header') {
                     filtered.push(field.Text);
                }
                return filtered;
            }, []);
        }

        function reset(){
            vm.mfaRequired = null;
            vm.bankData = null;
            vm.third = null;
            vm.fourth = null;
        }

        function updateSelectedBank(bankSlug) {
            if(!bankSlug) return;

            reset();

            var selectedBank = null;
            if (vm.banksAdaptor) {
                vm.banksAdaptor.source.some(function (item) {
                    if (bankSlug === item.Slug) {
                        selectedBank = item;
                        return true;
                    }
                });
            }

            vm.selectedBank = selectedBank;

            if(vm.selectedBank.Credentials.length > 4) {
                ux.alert.warning('Sorry, it doesn\'t support to test ' + selectedBank.Name + ' bank yet');
                vm.bankSlug = null;
            }

            vm.firstLabel = vm.selectedBank.Credentials[0].Name;
            vm.secondLabel = vm.selectedBank.Credentials[1].Name;

            if(vm.selectedBank.Credentials.length >= 3){
                vm.thirdLabel = null;
                vm.fouthLabel = null;

                vm.thirdLabel = vm.selectedBank.Credentials[2].Name;
            }

            if(vm.selectedBank.Credentials.length >= 4){
                vm.fourthLabel = vm.selectedBank.Credentials[3].Name;
            }
        }
    }
})();