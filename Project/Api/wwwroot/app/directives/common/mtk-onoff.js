(function () {
    'use strict';

    angular.module('app').directive('mtkOnoff', [directive]);

    function directive() {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                model: '=',
                change: '&'
            },
			// ** ng-show='model!==undefined' **
			// hides the control before data has been supplied,
			// so it doesn't look like the input has been switched on as data loads
			// which the user may interpret as the data changing
            template: "<label ng-show='model!==undefined' class='checkbox-container'><input type='checkbox' ng-model='model' ng-change='change()' class='ace ace-switch ace-switch-4'><span class='lbl'></span></label>"
        };
    }
})();