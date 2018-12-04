(function () {
    angular.module('app').directive('mtkBarchartCashflow', ['$timeout', '$window', 'textFormat', 'flotHelper', directive]);

    function directive($timeout, $window, textFormat, flotHelper) {
        return {
            restrict: 'AE',
            replace:true,
            template:'<div class="chart-gradient-background-vertical position-r" style="width:{{width}}; height:250px; padding: 12px; margin-bottom: 18px;"><div class="flot-bar-chart position-r" style="width:100%; height: 100%; overflow: hidden"><div class="flot-bar-chart-placeholder" style="height:100%"></div></div></div>',
            scope: {
                values: '=',
                labels: '=',
                width: '=?'
            },
            link: controller
        };

        function controller($scope, $element, $attrs) {
            var placeholder = $($element).find(".flot-bar-chart-placeholder");

            //Default width
            if (angular.isUndefined($scope.width)) $scope.width = '100%';

            ///////////////
            //Watches and events

            $scope.$watch('values', plot);

            //resize the graph when the window resizes
            $($window).on('resize.mtkBarchartIncomeExpense.window', plot);

            //remove window resize handler when this directive is removed from the DOM
            $scope.$on('$destroy', function() {
                $($window).off('resize.mtkBarchartIncomeExpense.window');
            });

            //////////////////

            function plot() {
                var values = $scope.values;
                var dataset = [
                    {
                        bars: {
                            show: true,
                            zero: true,
                            lineWidth:0,
                            fill:0.9,
                            fillColor: {
                                colors: [mtkColours.lighten(mtkColours.Green, 15), mtkColours.Green,  ]
                            }
                        },
                        data: values.income,
                        color: mtkColours.Green,
                        label: 'Money In'
                    },
                    {
                        bars: {
                            show: true,
                            zero: true,
                            lineWidth:0,
                            fill:0.8,
                            fillColor: {
                                colors: [ mtkColours.Red, mtkColours.lighten(mtkColours.Red, 30) ]
                            }
                        },
                        data: values.expenses,
                        color: mtkColours.Red,
                        label: 'Money Out'
                    }
                ];
                var font = {
                    size: 11,
                    lineHeight: 13,
                    family: "Open Sans, sans-serif",
                    color: '#999999'
                };
                var options = {
                    bars: {
                        align: "center",
                        barWidth: 0.75
                    },
                    xaxis: {
                        axisLabel: "Month",
                        axisLabelUseCanvas: true,
                        font: font,
                        ticks: makeTicks($scope.labels),
                        //tickColor: 'white',
                        color: "rgba(255, 255, 255, 0)"
                    },
                    yaxis: {
                        //tickColor: '#f0f0f0',
                        position:'right',
                        color: "rgba(255, 255, 255, 0)",
                        font: font,
                        tickFormatter: function (value, axis) {
                            return textFormat.currency(value);
                        }
                    },
                    legend: {
                        position: 'nw'
                    },
                    grid: {
                        borderWidth: 0,
                       // backgroundColor: {colors: ['#fdfdfd', '#f6f6f6']},
                        autoHighlight: true,
                        markings: [{yaxis: { from: 0, to: 0 },
                            color: tinycolor(mtkColours.LightGrey).setAlpha(0.75).toRgbString(),
                            lineWidth:1
                        }]
                    }
                };


                flotHelper.plotAfterWaitingForDOM(placeholder,  dataset,  options);


                ///////////////

                function makeTicks(labels) {
                    return labels.map(function(l, index) { return [index, l]; });
                }




            }


        }
    }
})();