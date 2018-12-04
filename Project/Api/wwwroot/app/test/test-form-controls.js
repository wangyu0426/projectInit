(function () {
    'use strict';
    var controllerId = 'testFormControls';
    angular.module('app').controller(controllerId, ['config', viewmodel]);

    function viewmodel (config) {
        var vm = this;

        vm.test_date = config.session.TransactDate;
        vm.test_integer = 12345789;
        vm.test_currency = 125.67;
        vm.test_radioOptions = 'Germany Argentina Brazil Holland'.split(' ');
        vm.test_radio = 'Germany';
        vm.test_radioOptionsComplex = [];
        vm.test_radioOptionsComplex.push(mk('Germany', 'White', "Philip Lahm"));
        vm.test_radioOptionsComplex.push(mk('Brazil', 'Yellow', "David Luis"));
        vm.test_radioOptionsComplex.push(mk('Argentina', 'Blue', "Lionel Messi"));
        vm.test_radioOptionsComplex.push(mk('Holland', 'Orange', "Wesley Snejder"));
        vm.test_radioComplex_id = null;
        vm.test_radio = 'Germany';
        vm.test_checkbox1 = false;
        vm.test_checkbox2 = false;
        vm.test_checkbox3 = false;
        vm.rangeSlider = {
            low:3, high: 47, max: 200, min: -200
        };
        vm.movingDateRangeSlider = {
            low:3, high: 47
        };

        vm.getCaptain = function (id) {
            var o = getObj(id);
            if (!o) return "";
            return o.captain;

        };
        vm.getShirt = function(id) {
            var o = getObj(id);
            if (!o) return "";
            return o.shirt;

        };
        function getObj(id){
            for (var i = vm.test_radioOptionsComplex.length - 1; i >= 0; i--) {
                var obj = vm.test_radioOptionsComplex[i];
                if (obj.Id === id) return obj;
            }
        }

        function mk(country, shirt, captain) {

            return {
                Id: Math.random(),
                Name:country,
                shirt:shirt,
                captain:captain
            };
        }

    }
})();
