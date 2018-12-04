(function () {
	'use strict';
	angular.module('app').directive('mtkSparkline', ['$timeout', directive]);

	function directive($timeout) {
		return {
			restrict: 'E',
			require: 'ngModel',
			link: function (scope, elem, attrs, ngModel) {

				var render = function () {
					var model, isCompositeConfig = false, isCompositeModel = false;

					// 2 types of config (object/array) :
					// {type:'line', spotColor: 'green', lineWidth: 5}
					// [{type:'line', lineColor: 'green', lineWidth: 5} , {type:'line', lineColor: 'red', lineWidth: 5}]
					if (angular.isArray(compositeConfig)) {
						isCompositeConfig = true;
					} else if (angular.isObject(compositeConfig)) {
						isCompositeConfig = false;
					}

					//Setup Model : Model can be [1,2,3,4,5] or [[1,2,3,4,5],[6,7,8,9]]
					// Trim trailing comma if it is a string
					angular.isString(ngModel.$viewValue) ? model = ngModel.$viewValue.replace(/(^,)|(,$)/g, "") : model = ngModel.$viewValue;

					model = angular.fromJson(model);

					// render sparkline
					$(elem).sparkline(model, reconcileConfig(compositeConfig));
				};

				// can be used for validating & defaulting config options
				var reconcileConfig = function (config, composite) {
					if (!config) config = {};
					config.type = config.type || 'line';
					config.composite = composite;
					return config;
				};

				var compositeConfig = angular.fromJson(scope.$eval(attrs.options));  // convert to json
				scope.$watch(attrs.ngModel, function () {
					render();
				});

				scope.$watch(attrs.sparklineConfig, function () {
					render();
				});
			}
		};

	}
})();