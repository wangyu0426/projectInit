(function () {
	'use strict';
	angular.module('app').directive('mtkCard', function () {
		return {
			restrict: 'E',
            replace: true,
			transclude: true,
			template: '<div class="container-fluid card-container" ng-transclude></div>'
		};
	});
})();