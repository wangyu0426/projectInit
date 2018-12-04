(function () {
    'use strict';

    angular.module('app').component('mtkCheckbox', {
        template: [ '$attrs', function($attrs){
            var reverseValue = angular.isDefined($attrs.reverse) ? "ng-true-value='false' ng-false-value='true'" : '';

            return "<label class='checkbox-container'><input type='checkbox' ng-model='vm.model' " + reverseValue + " ng-checked='vm.myChecked()' >&nbsp;<span class='lbl' ng-transclude></span></label>";
        }],
        bindings: {
            model: '='
        },
        controllerAs: 'vm',
        transclude: true,
        controller: ['$attrs', controller]
    });

    function controller( $attrs) {
        var vm = this;

        if (angular.isDefined($attrs.reverse)){
            vm.myChecked = function () {
                return ! vm.model;
            };
        }else {
            vm.myChecked = function () {
                return vm.model;
            };
        }
    }
})();