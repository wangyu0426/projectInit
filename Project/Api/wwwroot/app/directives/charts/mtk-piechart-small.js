(function () {
	angular.module('app').directive('mtkPiechartSmall', ['$timeout', 'flotHelper', directive]);

	function directive($timeout, flotHelper) {
		return {
			restrict: 'AE',
			replace:true,
			template:'<div class="position-r disp-ib" style="width:300px; {{}}; height:250px; padding: 12px; margin-bottom: 18px;"><div class="flot-pie-chart position-r " style="width:100%; height:100%; line-height: 1.2em;"></div></div>',
			scope: {
				values: '=',
				colours: '='
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
							radius:0.650,
							combine: {
								threshold: 0.1
							},
							offset: {
								left:55
							},
							stroke: {
								width:0
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
				if (angular.isArray($scope.colours)) {
					var arr = $scope.colours; //mtkColours.chartColourSet_Expenses;
					return arr[i % arr.length];
				} else {
					return undefined;
				}

			}
		}
	}
})();