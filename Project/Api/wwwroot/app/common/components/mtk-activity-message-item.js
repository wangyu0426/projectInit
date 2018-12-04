(function () {
    angular.module('app').component('mtkActivityMessageItem', {
        templateUrl: '/app/common/components/mtk-activity-message-item.html',
        bindings: {
            dto: '<',
            contextType: '<'
        },
        controller: ['$scope', 'textFormat', 'iconMapper', 'config', 'locationHelper', activityMessageItemController],
        controllerAs: 'vm'
    });

    function activityMessageItemController($scope, textFormat, iconMapper, config, location) {
        var vm = this;

        vm.dueDateClass = dueDateClass;
        vm.iconClass = iconClass;
        vm.typeText = typeText;
        vm.isMessageThread = isMessageThread;
        vm.preview = preview;

        vm.showProperty = vm.contextType !== 'lot';

        vm.icon = iconMapper.map(vm.dto.MessageType);
        vm.url = config.PATH_MAP[vm.dto.MessageType] + vm.dto.LinkId;
        vm.linkTarget = '';
        vm.status = vm.dto.Status;
        vm.warning = null;

        if (vm.dto.Status === 'Unsent' || vm.dto.Status === 'Sent') {
            vm.status = null;
        }

        if (vm.dto.Status === 'Failed' || vm.dto.Status === 'Unread') {
            vm.warning = vm.dto.Status;
        }

        if (vm.dto.MessageType === 'Document') {
            vm.url = 'api/comms/message/' + vm.dto.Id + '/document';
            vm.linkTarget = '_blank';
        }
        
        function typeText() {
            if (vm.dto.LinkType === 'MessageThread') {
                return 'conversation';
            }

            return vm.dto.LinkType;
        }
        var days = textFormat.daysAgo(vm.dto.NextActionDueDate);

        function dueDateClass() {
            if (vm.dto.CompletedOn) {
                return '';
            }

            return {
                'warning text-warning': days >= 0 && days < 1,
                'error text-error': days >= 1,
            };
        }

        function iconClass() {
            if (vm.dto.CompletedOn) {
                return 'bg-grey';
            }

            return {
                'activity-blue' : days < 0 || vm.dto.NextActionDueDate === null,
                'activity-orange': days >= 0 && days < 1,
                'activity-red': days >= 1,
            };
        }

        function isMessageThread() {
            return vm.dto.LinkType === 'MessageThread';
        }

        function preview() {
            if (vm.dto.LinkType === 'MessageThread') {
                location.messageThread(vm.dto.Id);
            } else {
                var modal = location.messagePreview(vm.dto.Id);
                modal.closed.then(function () {
                    $scope.$emit('mtk.activity.feed:refresh');
                });
            }
        }
    }

})();