(function () {
    angular.module('app').component('mtkActivityFeed', {
        templateUrl: '/app/common/components/mtk-activity-feed.html',
        bindings: {
            id: '<',
            type: '@',
            showToolbar: '@'
        },
        controller: ['$scope', 'server', activityFeedController],
        controllerAs: 'vm'
    });

    function activityFeedController($scope, server) {
        var vm = this;

        // comment
        vm.showCommentBox = false;

        vm.toggleComment = toggleComment;
        vm.saveComment = saveComment;
        vm.cancelComment = cancelComment;

        vm.activityType = vm.type;
        if (vm.type === 'lot') {
            vm.activityType = 'property';
            vm.commentType = 'lot';
        }
        if (vm.type === 'job') {
            vm.activityType = 'jobtask';
            vm.commentType = 'job';
        }
        if ( vm.type === 'listing/rental' ) {
            vm.activityType = 'listing/rental';
            vm.commentType = 'rentallisting';
        } if ( vm.type === 'listing/sale' ) {
            vm.activityType = 'listing/sale';
            vm.commentType = 'salelisting';
        }
        /////////////////////

        function toggleComment() {
            vm.showCommentBox = !vm.showCommentBox;
        }

        function saveComment() {
            if (vm.type && vm.id && vm.newCommentText) {
                var comment = {
                    LinkId: vm.id,
                    LinkType: vm.commentType,
                    Comment: vm.newCommentText
                };

                server
                    .post('/api/entity/comment', comment)
                    .success(function () {
                        vm.newCommentText = null;
                        vm.showCommentBox = false;
                        $scope.$broadcast('mtk.activity.feed:refresh');
                    });
            }
        }

        function cancelComment() {
            vm.newCommentText = null;
            vm.showCommentBox = false;
        }
    }

})();