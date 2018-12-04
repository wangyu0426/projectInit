(function() {
	"use strict";
	angular.module("app").directive("mtkEmailInput", function() {
		return {
			restrict: "E",
			// replace: true,
			templateUrl: '/app/directives/common/mtk-email-input.html',
			scope: {
				model: "=model",
				elId:"@id",
				mtkInputPlaceholder: "@placeholder", // in case this object is nested inside another directive, eg mtk-address,
				// we need to give this placeholder a unique name, so it is not confused with the parent directive's placeholder
				isChanged: "=?",
				role: "=?"
			},
			link: function (scope, element,attrs) {
					
			}
		};
	});
})();