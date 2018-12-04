(function () {
	'use strict';
	var isConfigured = false;
	angular.module('app').factory('mtkAlert', ['$rootScope', '$timeout', mtkAlert]);

	function mtkAlert($rootScope, $timeout) {
		var service = {
			info: show,
			show: show,
			error: showError,
			success: showSuccess,
			warning: showWarning,
			response: showResponse,
			remove: remove
		};

		configureToastr();

		return service;

		function configureToastr() {
			if (isConfigured) return;
			toastr.options.timeOut = 10000;
			toastr.options.positionClass = 'toast-bottom-full-width';
			toastr.options.closeButton = true;
			toastr.options.showMethod = 'fadeIn';
			toastr.options.showEasing = 'linear';
			isConfigured = true;
		}

		function show(message, title) {
			showIt(message, title || 'Information', 'info');
		}

		function showWarning(message, title) {
			showIt(message, title || 'Warning', 'warning');
		}

		function showSuccess(message, title) {
			showIt(message, title, 'success');
		}

		function showError(message, title) {
			showIt(message, title || 'Error', 'error');
		}

		function showResponse(responseObj, title, thresholdLevel, onAlertResponse) {
			var status = responseObj.ResponseStatus;
			if (status) {
				if (responseObj.IsSuccessful) {
					successTick();
				} else {
					if (onAlertResponse) {
						onAlertResponse(status.ErrorCode.toLowerCase(), status.Message);
					} else {
						showIt(status.Message, title, status.ErrorCode, thresholdLevel);
					}
				}
			}
		}

		function showIt(message, title, toastType, thresholdLevel) {
			thresholdLevel = thresholdLevel || 5;
			if (message && typeof message === 'string' && message != '') {
				message = message.replace('\n', '<br/>');
			}
			var type = toastType.toLowerCase();
			if (type === 'error') {
				if (2 <= thresholdLevel)
					toastr.error(message, title);
			} else if (type === 'warning' || type === 'warn') {
				if (3 <= thresholdLevel)
					toastr.warning(message, title);
			} else if (type === 'success') {

				if (4 <= thresholdLevel) {
					if (message || title) {
						toastr.success(message, title);
					} else {
						successTick();
					}
				}
			} else {
				if (5 <= thresholdLevel)
					toastr.info(message, title);
			}
		}

		function successTick() {
			$rootScope.showSuccess = true;
			$timeout(function () {
				$rootScope.showSuccess = false;
			}, 2000);
		}

		function remove() {
			toastr.remove();
		}
	}
})();