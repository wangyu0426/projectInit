(function () {
    'use strict';

    angular.module('app').controller('testModalController', ['$interval','modalDetail', controller]);

    function controller($interval, modalDetail) {
        var vm = this;
        var modal;
        vm.fireModal = fireModal;

        vm.timeToClose = 5;
        vm.radio = {
            value: 'banana',
            options: 'banana apple orange dragonfruit'.split(' ')
        };

        function fireModal() {

            startTimer();

            var data = {
                radio: vm.radio,
                stopTimer: stopTimer,
                timeToClose: vm.timeToClose,
                parent: vm
            };
            modal = new modalDetail('app/test/test-modal-detail.html', data, stopTimer);
            modal.show();



        }

        function startTimer() {
            vm.stopPromise = $interval(function() {
                vm.timeToClose --;
                if (vm.timeToClose <= 0) {
                    modal.close();
                    vm.timeToClose = 5;
                    stopTimer();
                }
            }, 1000);
        }

        function stopTimer() {
            if (angular.isDefined(vm.stopPromise)) {
                $interval.cancel(vm.stopPromise);
                vm.stopPromise = undefined;
            }
        }




    }
})();