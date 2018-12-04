(function(){
    'use strict';
    angular.module('app')
        .controller('testColourPicker',[function(){
            var vm = this;
            vm.model = '#f05a28';
            vm.buttonText = 'Primary Colour';
            vm.isPreview = true;
            vm.isShow = false;
        }]);
})();