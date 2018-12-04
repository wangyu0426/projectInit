(function () {
    'use strict';
    var CONTROLLER_ID = 'testHouseIcons';
    angular.module('app').controller(CONTROLLER_ID, ['$timeout', viewmodel]);
    function viewmodel ($timeout) {
        var vm = this;

       vm.houseRows = [];

        for (var i = 5; i --; ) {
            var row = [];
            for (var j = 20; j--; ) {
                var h = {'class':'success'};

                if (j<= 2) {
                    h.class = 'muted';
                } else if (j <= 4) {
                    h.class = 'danger';
                } else if (j <= 5) {
                    h.class = 'warning';
                }

                row.push(h);
            }
            vm.houseRows.push(row);
        }


    }
})();
