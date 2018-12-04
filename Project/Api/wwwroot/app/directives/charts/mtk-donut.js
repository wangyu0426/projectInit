(function () {
	angular.module('app').directive('mtkDonut', ['$timeout', directive]);

	function directive($timeout) {
		return {
			restrict: 'AE',
			replace:false,
			template:'<div class="easy-pie-chart easyPieChart easyDonut position-r"></div>',
			scope: {
				numbers: '=',
				colours: '='
			},
			link: link
		};

		function link(scope, element) {
			var size = 100;

			scope.$watch('numbers', function(numbers) {
				if (!numbers) return;
				$(element).easyDonut({
					barColor: 'rgba(255,255,255,0.95)',
					trackColor: 'rgba(255,255,255,0.25)',
					numbers: numbers,
					colors: scope.colours,
					scaleColor: false,
					lineCap: 'butt',
					lineWidth: parseInt(size / 7),
					animate: false,
					size: size
				});
			});

        }
	}
})();