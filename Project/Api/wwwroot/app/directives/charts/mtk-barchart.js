(function () {
    angular.module('app').directive('mtkBarchart', ['$timeout', directive]);

    function directive($timeout) {
        return {
            restrict: 'AE',
            replace:true,
            template:'<div class="flot-bar-chart  position-r" style="width:250px; height: 250px;"></div>',
            scope: {
                values: '=',
                labels: '='
            },
            controller: controller
        };

        function controller($scope, $element, $attrs) {

            $scope.$watch('values', plot);

            function plot(values) {

                var dataset = [{ label: "Monthly Income", data: values, color: mtkColours.Green }];
                var options = {
                    series: {
                        bars: {
                            show:true,
                            zero: true
                        }
                    },
                    bars: {
                        align: "center",
                        barWidth: 0.75
                    },
                    xaxis: {
                        axisLabel: "Month",
                        axisLabelUseCanvas: true,
                        axisLabelFontSizePixels: 12,
                        axisLabelFontFamily: 'Verdana, Arial',
                        axisLabelPadding: 10,
                        ticks: makeTicks($scope.labels)
                    },
                    grid: {
                        borderWidth: 0
                    }
                };
                $.plot($($element), dataset, options);


            }

            function makeTicks(labels) {
                return labels.map(function(l, index) { return [index, l]; });
            }


        }
    }
})();