(function () {
	"use strict";

	var controllerId = "footerAlertController";

    var DEFAULT_EXPIRY_IN_SECONDS = 10;

	angular.module("app").controller(controllerId, ['$rootScope', '$timeout',
		footerAlertController]);

	function footerAlertController($rootScope, $timeout) {
		var vm = this;
		vm.alerts = [];
		vm.add = add;
		vm.warning = warning;
		vm.info = info;
		vm.error = error;
		vm.success = success;

		//respond to events
		$rootScope.$on('mtk.footerAlert', function (ev, params) {
			add(params.type, params.title, params.msg);
		});

		function warning(title, msg) {
			add('warning', title, msg);
		}
		function info(title, msg) {
			add('info', title, msg);
		}
		function error(title, msg) {
			add('danger', title, msg);
		}
		function success(title, msg) {
			add('success', title, msg);
		}

		function add(type,title, msg) {
			var a = {};
			a.type = type;
			a.title = title;
			a.msg = msg;
			a.iconClass = getIcon(type);
			a.alertClass = 'alert-' + (type === 'error' ? 'danger' : type);
            vm.alerts.push(a);

            //set up a timeout function to remove this alert
            $timeout(function(){
                findAndRemove(vm.alerts, a);
                a = null;
            }, DEFAULT_EXPIRY_IN_SECONDS * 1000);
		}

        function findAndRemove(arr, o) {
            for (var i = arr.length - 1; i >= 0; i--) {
                if (o === arr[i]) {
                    arr.splice(i, 1);
                    return;
                }
            }
        }

		function getIcon(t) {
            return 'icon-alert-' + t;
		}

	}
})();