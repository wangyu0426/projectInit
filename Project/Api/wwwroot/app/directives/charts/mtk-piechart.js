(function () {
	angular.module('app').directive('mtkPiechart', ['$timeout', 'flotHelper', directive]);

	function directive($timeout, flotHelper) {
		return {
			restrict: 'AE',
			replace:true,
			template:'<div class="chart-gradient-background-vertical position-r" style="width:300px; height:250px; padding: 12px; margin-bottom: 18px;"><div class="flot-pie-chart position-r " style="width:100%; height:100%; line-height: 1.2em;"></div></div>',
			scope: {
				values: '='
			},
			link: controller
		};

		function controller($scope, $element, $attrs) {
			$scope.$watch('values', plot);

			var targetElement = $element.find('.flot-pie-chart');

			function plot() {
				var values = prepareDataseries($scope.values);
				var options = {
					series: {
						pie: {
							show:true,
							combine: {
								threshold: 0.1
							}
						}
					},
					legend: {
						position: 'nw',
						//backgroundColor: mtkColours.LightGrey,
						backgroundOpacity: 0
					}
				};

				//$.plot($($element), values, options);
				flotHelper.plotAfterWaitingForDOM(targetElement, values, options);

			}

			function prepareDataseries(valueMap) {
				var arr = [];

				for (var k in valueMap) {
					if (valueMap.hasOwnProperty(k)) {
						arr.push({
							label: k,
							data: valueMap[k],
							color: getColour(arr.length)
						});
					}
				}
				return arr;
			}

			function getColour(i) {
				var arr = mtkColours.chartColourSet_Expenses;
				return arr[i % arr.length];
			}
		}
	}
})();