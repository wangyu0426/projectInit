(function () {
    angular.module('app').component('mtkActivityCommentItem', {
        templateUrl: '/app/common/components/mtk-activity-comment-item.html',
        bindings: {
            dto: '<',
            active: '<',
        },
        controllerAs: 'vm',
        controller: function activityCommentController() {
            var vm = this;

            vm.iconClass = function () {
                if (!vm.active) {
                    return 'bg-grey';
                } else {
                    return 'bg-darkgrey';
                }
            };
        }
    });
})();