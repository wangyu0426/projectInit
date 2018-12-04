(function () {
    angular.module('app').component('mtkDashboardInsightsWidget', {
            templateUrl: '/app/dashboard/components/mtk-dashboard-insights-widget.html',
            bindings: {
                selectedMemberId: '<',
                isShowingDetails: '<'
            },
            controller: ['statsServiceProxy', 'chartBuilder', 'seriesBuilder', '$location', '$filter', controller],
            controllerAs: 'vm'
        }
    );

    function controller(statsService, chartBuilder, seriesBuilder, $location, $filter) {
        var vm = this;

        vm.initFrom = moment().subtract(1, 'month').format('YYYY-MM-DD');
        vm.initTo = moment().format('YYYY-MM-DD');
        vm.from = vm.initFrom;
        vm.to = vm.initTo;

        vm.chartDef = new chartBuilder()
            // .enableTimeSeries()
            .setXAxisTickMaxRotation(0)
            .formatXAxisTick(function (value) {
                return $filter('date')(value, 'd MMM');
            })
            .formatYAxisTick('#%')
            .yAxisBeginAtZero()
            .enableTooltip();

        vm.$onChanges = updateChartSeries;
        vm.showDetail = showDetail;

        //////////////////

        function updateChartSeries() {

            if (vm.isShowingDetails) {
                vm.chartSeries = [
                    new seriesBuilder().setDaysInArrears(3).setSeriesColour(mtkolours.Green).setSeriesName('3+ days'),
                    new seriesBuilder().setDaysInArrears(7).setSeriesColour(mtkolours.Orange).setSeriesName('7+ days'),
                    new seriesBuilder().setDaysInArrears(14).setSeriesColour(mtkolours.Red).setSeriesName('14+ days')
                ];
            } else {
                vm.chartSeries = [
                    new seriesBuilder().setDaysInArrears(3).setSeriesColour(mtkolours.Green).setSeriesName('3+ days')
                ];
            }

            vm.chartSeries.forEach(function (chartSeries) {
                chartSeries.setDataSource(function (filter) {
                    return statsService
                        .getArrears(vm.from, vm.to, vm.timePeriod, vm.selectedMemberId, true, filter.daysInArrears)
                        .then(function(data) {
                            return {
                                ChartLabels: data.map(function(item) {
                                    if (vm.timePeriod === 'month') {
                                        return item.Month;
                                    } else {
                                        return item.Date;
                                    }
                                }), 
                                ChartData: data.map(function(item) {
                                    return item.Value;
                                })
                            };
                        });
                });
            });
            vm.chartSeries = vm.chartSeries.slice();
        }

        function showDetail(data) {
            $location.path('/insights/rent-arrears');
        }
    }
})();