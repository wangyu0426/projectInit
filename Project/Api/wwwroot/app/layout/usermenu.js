(function () { 
    'use strict';

    angular.module('app').controller('userMenuController', 
        ['server', 'config', usermenu]);

    function usermenu(server, config) {
        var vm = this;
        vm.memberName = config.session.Name;
        vm.memberId = config.session.MemberId;
        vm.logout = function(){
            server.post('/api/v1/auth/logout',{})
            .success(function(){
                location.reload();
            })
        }
    }

})();