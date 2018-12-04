(function() {
	"use strict";
	angular.module("app").directive("mtkInput", function() {
		return {
			restrict: "E",
			replace: true,
			template: '<input ng-attr="{id: elId,name: elId}" placeholder="{{mtkInputPlaceholder}}" class="form-control" type="text" ng-model="model"/>',
			scope: {
				model: "=model",
				elId:"@id",
                mtkInputPlaceholder: "@placeholder" // in case this object is nested inside another directive, eg mtk-address,
                // we need to give this placeholder a unique name, so it is not confused with the parent directive's placeholder
			},
			link: function (scope, element,attrs) {
			}
		};
	});
})();