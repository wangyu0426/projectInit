(function () {
    angular.module('app').component('avatar', {
        templateUrl: '/scripts/components/avatar.html',
        bindings: {
            memberName: '<',
            memberId: '<',
            size: '@',
            imageSize: '@',
            isSquare:"@"
        },
        controller: [controller],
        controllerAs: 'vm'
    });

    function controller() {
        var vm = this;
        vm.avatarUrl = null;
        vm.middleAvatarUrl = null;
        vm.emptyGuid = "00000000-0000-0000-0000-000000000000";
        vm.size = vm.size || 35;
    }

})();