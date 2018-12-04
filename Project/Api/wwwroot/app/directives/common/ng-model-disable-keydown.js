(function () {
    angular.module('app').directive('ngModelDisableKeydown', [directive]);

    function directive() {
        return {
            restrict: 'A',
            require: 'ngModel',
            priority: 1, // needed for angular 1.2.x
            link: function (scope, elm, attr) {
                if (attr.type === 'radio' || attr.type === 'checkbox') return;
                elm.unbind('input').unbind('keydown');
            }
        };
    }
})();