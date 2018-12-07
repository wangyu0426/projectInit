(function () { 
    'use strict';

    angular.module('app').controller('userMenuController', 
        ['server', usermenu]);

    function usermenu(server) {
        var vm = this;
        vm.user = {
            FirstName:'Yu',
            LastName:'Wang'
        }//config.session.Name;
        vm.size = 35;
        vm.userId = 1;//config.session.MemberId;
        init()
        function init(){
            server.get("user/"+vm.userId).then(function(data){
                vm.user = data.data;
            })
        }
    }

})();