(function () {
    angular.module('app').component('mtkActivityTaskItem', {
        templateUrl: '/app/common/components/mtk-activity-task-item.html',
        bindings: {
            dto: '<',
            contextType: '<'
        },
        controller: ['$filter', '$location', 'textFormat','iconMapper', activityTaskItemController],
        controllerAs: 'vm'
    });

    function activityTaskItemController($filter, $location, textFormat, iconMapper) {
        var vm = this;

        vm.dueDateClass = dueDateClass;
        vm.iconClass = iconClass;
        vm.typeUrl = typeUrl;
        vm.open = open;

        vm.showProperty = vm.contextType !== 'lot';

        vm.icon = iconMapper.map(vm.dto.LinkType);
        var daysAgo = textFormat.daysAgo(vm.dto.NextActionDueDate);
        vm.status = vm.dto.Status;

        if (vm.dto.Status === 'Scheduled' || vm.dto.Status === 'Closed') {
            vm.status = null;
        } else if (vm.dto.Status === 'Reported') {
            vm.status = 'Reported by ' + vm.dto.ReportedContactType;
        } else if (vm.dto.Status === 'Assigned') {
            vm.status = 'Assigned to supplier ' + vm.dto.ContactReference;
        }

        function typeUrl() {
            // special case for job
            if (vm.dto.LinkType === 'Job') {
                return 'jobtask';
            }
            return $filter('lowercase')(vm.dto.LinkType);
        }

        function dueDateClass() {
            if (vm.dto.CompletedOn) {
                return '';
            }
            return {
                'warning text-warning': daysAgo >= 0 && daysAgo < 1,
                'error text-error': daysAgo >= 1,
            };
        }

        function iconClass() {
            if (vm.dto.CompletedOn) {
                return 'bg-grey';
            }
            return {
                'activity-blue' : daysAgo < 0 || vm.dto.NextActionDueDate === null,
                'activity-orange': daysAgo >= 0 && daysAgo < 1,
                'activity-red': daysAgo >= 1,
            };
        }

        function open() {
            $location.url('/' + vm.typeUrl() + '/card/' + vm.dto.LinkId);
        }
    }

})();