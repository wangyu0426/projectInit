(function () {
	'use strict';

	angular.module('app').factory('gridDetail', ['$rootScope', '$compile', '$timeout', factory]);


	function factory($scope, $compile, $timeout) {
		function _factory (includeFile, addToScope,isNotUsingDetailCss) {
			var self = this;

			self.template = '<div><div class="' + ( isNotUsingDetailCss ?'grid-light-detail':'grid-detail') + '" ng-include="\'' + includeFile + '\'"></div></div>'; //works better with two nested divs
			self.render = function(detailData, rowData) {

                detailData = fixData(detailData);
				var rowScope = $scope.$new(false); //true means isolated
				rowScope.rowData = rowData;
				rowScope.detailData = detailData;

				if (addToScope) {
					angular.extend(rowScope,  addToScope);
				}

				var compiled = $compile(self.template)(rowScope);
				rowScope.$apply();

				return  compiled;
				function fixData (d) {
					//fix the data
					var newdata;
					try {
						newdata = JSON.parse(d);
						return newdata;
					}
					catch (e) {
						return d || [];
					}
				}
			};
		}



		return _factory;
	}
})();