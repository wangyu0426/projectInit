(function(){
    'use strict';

    angular.module( 'app' ).component('mtkDemoCloningMask', {
        templateUrl: '/app/layout/components/mtk-demo-cloning-mask.html',
        bindings: {
            resolve: '<'
        },
        controller: ['$scope', controller],
        controllerAs: 'vm'
    });

    function controller($scope) {       
    }
})();