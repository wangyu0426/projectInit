(function () {
    angular.module('app').component('mtkDashboardValueWidget', {
            templateUrl: '/app/dashboard/components/mtk-dashboard-value-widget.html',
            bindings: {
                widgetType: '<'
            },
            controller: ['$scope', '$element', '$timeout', 'config', 'ux', 'server', 'dashboardHelperService', 'textFormat', controller],
            controllerAs: 'vm'
        }
    );

    function controller($scope, $element, $timeout, config, ux, server, dashboardHelper, textFormat) {
        var vm = this;
     
        vm.isLoading = true;
        vm.title = textFormat.splitCamelCase(vm.widgetType).toUpperCase();
        vm.AlertLevel = "muted";

        loadData();

        $scope.$on(config.events.refreshData, function (event, eventData) {
            loadData();
        });

        //////////////////

        function loadData() {
            server.getQuietly('v1/dashboard?FilterTypes=' + vm.widgetType).success(function (data) {
                if (data.valueWidgets.length > 0) {
                    var widgetData = data.valueWidgets[0];
                    load(widgetData);
                } else {
                    $element.css('display', 'none');
                }
                vm.isLoading = false;
            });
        }

        function load(widget) {
            vm.AlertLevel = widget.alertLevel || 'warning'; // default to empty

            // $element.removeClass("alert-warning alert-danger alert-info");
            // $element.addClass("alert-" + vm.AlertLevel);

            //set main value
            if (widget.percent) {
                vm.featureNumber = widget.percentage;
                vm.isPercent = true;
            } else if (widget.amount) {
                vm.featureNumber = widget.amount;
                vm.isCurrency = true;
            } else if (widget.quantity) {
                vm.featureNumber = widget.quantity;
                vm.isQuantity = true;
            } else {
                vm.featureNumber = 0;
                //empty
            }

            vm.icon = dashboardHelper.getWidgetIcon(widget);
            vm.href = dashboardHelper.getWidgetHref(widget.filterType);
            vm.title = widget.label.toUpperCase();  

        }
    }
})();