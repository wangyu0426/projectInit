(function () {
	'use strict';
	var controllerId = 'testAlert';
	angular.module('app').controller(controllerId, ['$rootScope', '$scope', 'mtkAlert', 'config', viewmodel]);

	function viewmodel($rootScope, $scope, mtkAlert, config) {

		var vm = this;
		vm.title = 'Alert demo';
		vm.alertTitle = '';
		vm.alertMsg = '';
		vm.toastPos = 'bottom-right';
		vm.toastPositions = ['top-full-width', 'top-right','bottom-full-width', 'bottom-right'];

		$scope.$watch('vm.toastPos', function(newVal, oldVal){
			toastr.options.positionClass = 'toast-' + newVal;
		});
		vm.doAlert = doAlert;
		vm.doToast = doToast;

		$rootScope.$emit(config.events.spinnerToggle, {});


		function doToast(type){
			mtkAlert[type](vm.alertMsg, vm.alertTitle);
		}

		function doAlert(type) {
			$rootScope.$emit('mtk.footerAlert', {type:type, msg: vm.alertMsg, title: vm.alertTitle});

		}

	}
})();
