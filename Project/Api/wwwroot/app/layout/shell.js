(function () { 
    'use strict';
    
    var controllerId = 'shellController';
    angular.module('app').controller(controllerId,
        ['$rootScope', 'config', shell]);

    function shell($rootScope) {


    }
})();