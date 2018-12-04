(function() {
    'use strict';

    angular.module('app').component('mtkCreateTfaSecret', {
        templateUrl: '/app/user/components/mtk-create-tfa-secret.html',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&'
        },
        controller :  ['$element', 'config', '$filter', 'server', '$location', controller],
        controllerAs: 'vm'
    });

    function controller($element, config, $filter, server, $location) {

        var currentUserTfaSettingPath = 'sec/user/tfa';
        var currentTimePath = 'settings/current-time';

        var vm = this;
        vm.step = 1;
        vm.tfaSecret = TfaUtil.generateBase32Secret(10);
        vm.errorMsg = null;
        vm.isManualMode = false;
        vm.timeCorrection = 0;

        vm.next = function () {
            vm.verifyTotpCode = '';
            vm.step = 2;
        };

        vm.back = function () {
            vm.step = 1;
        };

        vm.cancel = function () {
            vm.dismiss({$value: 'cancel'});
        };

        vm.manualMode = function() {
            vm.isManualMode = true;
        };

        vm.displayTfaSecret = function() {
            var tfaSecretToDisplay = '';
            for (var i = 0; i < vm.tfaSecret.length; i = i + 4) {
                tfaSecretToDisplay += vm.tfaSecret.substring(i, i + 4) + ' ';
            }
            return tfaSecretToDisplay.toLowerCase().trim();
        };

        vm.verify = function() {
            if (!TfaUtil.verifyPinAgainstSecret(vm.tfaSecret, vm.verifyTotpCode, vm.timeCorrection, { previousStep: 2, futureStep: 2 })) {
                vm.errorMsg = 'Invalid code. Please check if the time on your phone is ' + new Date(new Date().getTime() + vm.timeCorrection) + '.';
            } else {
                vm.errorMsg = null;
                server.post(currentUserTfaSettingPath, {
                    TfaSecret: vm.tfaSecret
                }).then(function () {
                    return vm.close({$value : vm.tfaSecret});
                });
            }
        };

        init();

        function init() {
            var provider = $location.host() !== 'app.Veriface.com' ? $location.host() + ':' : '';
            var otpPath = 'otpauth://totp/' + provider + config.session.RegisteredEmail + '?secret=' + vm.tfaSecret + '&issuer=Veriface';

            var qr = new QRious({
                element: $element[0].querySelector('canvas'),
                size: 150,
                value: otpPath
            });

            server.post(currentTimePath)
                .success(function(systemTime) {
                    vm.timeCorrection = systemTime - (new Date().getTime());
                });
        }

    }
})();