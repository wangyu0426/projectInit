(function () {
	'use strict';
	angular.module('app').directive('mtkCardRow', function () {
		return {
			restrict: 'E',
			transclude: true,
			replace: true,
			templateUrl: '/app/directives/common/mtk-card-row.html',
			scope: {
				label:'@'
			}
		};
	});
})();