(function () {
	'use strict';
	var controllerId = 'testOrigin';
	angular.module('app').controller(controllerId, ['$rootScope', '$scope', 'mtkAlert', 'config', viewmodel]);

	function viewmodel($rootScope, $scope, mtkAlert, config) {

		var vm = this;
		vm.title = 'Test Mixed Origin';

		//window.frames['printFrame'].contentWindow.postMessage('setDocument', )

		vm.print = function () {
			//window.frames['pdfPreview'].contentWindow.print();
			window.frames['printFrame'].contentWindow.postMessage('printDocument', 'https://cfdocs.propertyme.com');
		};

        return vm;
	}
})();
