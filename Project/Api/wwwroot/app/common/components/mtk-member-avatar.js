(function () {
    angular.module('app').component('mtkMemberAvatar', {
        templateUrl: '/app/common/components/mtk-member-avatar.html',
        bindings: {
            memberName: '<',
            memberId: '<',
            size: '@',
            imageSize: '@'
        },
        controller: ['$rootScope', 'textFormat', 'ux', controller],
        controllerAs: 'vm'
    });

    function controller($rootScope, textFormat, ux) {
        var vm = this;
        vm.avatarUrl = null;
        vm.middleAvatarUrl = null;
        vm.emptyGuid = "00000000-0000-0000-0000-000000000000";
        vm.size = vm.size || 35;
        $rootScope.$on('mtk.member.image:refresh', updateAvatarImageTimeStamp);

        vm.$onInit = loadAvatarImage;

        vm.updateAvatarImageTimeStamp = updateAvatarImageTimeStamp;

        function loadAvatarImage () {
            if(vm.memberId) {

                vm.imageSize =  vm.imageSize || 'S';

                vm.avatarUrl = ux.getAvatarUrl(vm.memberId, vm.imageSize);
                vm.middleAvatarUrl = ux.getAvatarUrl(vm.memberId, 'M')


            } else {
                vm.avatarUrl = ux.getAvatarUrl(vm.emptyGuid, 'S');
                vm.middleAvatarUrl = ux.getAvatarUrl(vm.emptyGuid, 'M')
            }
        }

        function updateAvatarImageTimeStamp () {
            vm.avatarUrl = ux.updateAvatarUrl(vm.memberId, vm.imageSize);
            vm.middleAvatarUrl = ux.updateAvatarUrl(vm.memberId, 'M')
        }
    }

})();