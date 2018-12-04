(function(){
    'use strict';

    angular.module('app').directive('mtkAccountNumber', directiveFn);

    function directiveFn(){
        return {
            restrict:'E',
            templateUrl: '/app/directives/account-input/mtk-account-number.html',
            scope:{
                model:'='
            }
        };
    }
})();