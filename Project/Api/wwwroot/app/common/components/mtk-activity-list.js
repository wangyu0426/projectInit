(function () {
    angular.module('app').component('mtkActivityList', {
        templateUrl: '/app/common/components/mtk-activity-list.html',
        bindings: {
            id: '<',
            active: '<',
            title: '@',
            type: '@'
        },
        controller: ['$scope', 'server', 'config', activityListController],
        controllerAs: 'vm'
    });

    function activityListController($scope, server, config) {
        var vm = this;

        vm.isLoading = true;

        vm.refresh = refresh;
        vm.increaseLimit = increaseLimit;

        vm.limit = config.pageSize;
        vm.taskList = null;

        // Refresh straight away when the user chooses Message and creates a merge message so they can navigate to it
        $scope.$on('action:merged', function (eventScope, eventLog) {
            if (eventLog.LinkId === vm.id || eventLog.LotId === vm.id || eventLog.ContactId === vm.id) {
                console.log(eventLog);
                refresh();
            }
        });

        $scope.$on('mtk.activity.feed:refresh', refresh);
        $scope.$watch('vm.id', function (n, o) {
            if (n !== o) {
                refresh();
            }
        });

        refresh();

        /////////////////////

        function refresh() {
            if (!vm.id || !vm.type) {
                return;
            }

            var url = 'entity/' + vm.type + '/' + vm.id;

            if (vm.active) {
                url += '/todos';
            } else {
                url += '/activities';
            }

            server
                .getQuietly(url)
                .success(function (response) {
                    //broadcast if it's empty list, let mtk-right-pane-tabset choose next tab
                    if (response.IsSuccessful) {
                        vm.taskList = response.RelatedActivities;
                    }
                });
        }

        function increaseLimit() {
            vm.limit += config.pageSize;
        }
    }

})();