(function () {
    'use strict';

    angular.module('app').directive('mtkCheckbox', [directive]);

    function directive() {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                model: '=',
                click: '&',
                checked: '&',
                change: '&',
                disabled: '='
            },
            template: "<label class='checkbox-container'><input type='checkbox' ng-model='model' ng-click='click()' ng-disabled='disabled' ng-checked='myChecked()' ng-change='change()'>&nbsp;<span class='lbl' ng-transclude></span></label>",
            link: function (scope, elm, attr) {
                if(attr.checked){
                    scope.myChecked = scope.checked;
                }else {
                    scope.myChecked = function(){ return scope.model;};
                }
            }
        };
    }
})();