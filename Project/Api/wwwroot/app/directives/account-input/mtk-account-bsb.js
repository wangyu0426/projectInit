(function(){
    'use strict';

    angular.module('app').directive('mtkAccountBsb', ['session', directiveFn]);

    function directiveFn(session) {
        return {
            restrict:'E',
            templateUrl: '/app/directives/account-input/mtk-account-bsb.html',
            scope:{
                model:'=',
                visible: '@'
            },
            link: function(scope, element, attr) {
                scope.visible = session.hasBsb();
            }
        };
    }
})();
