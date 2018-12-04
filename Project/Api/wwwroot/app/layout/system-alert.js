(function () {
    "use strict";

	angular.module( "app" ).controller( 'systemAlertController', [ '$rootScope', 'server', 'config', 'permissionService', 'ux', '$uibModal', '$document', systemAlertController]);

	function systemAlertController( $rootScope, server, config, permissionService, ux, $uibModal, $document) {
        var vm = this;
        vm.systemAlert = null;
        vm.subscriptionAlert = null;
		vm.showGuestAccessAlert = false;
        vm.dismiss = dismiss;
        vm.switchToDemoDatabase = switchToDemoDatabase;

		var localStorageKeyPrefix = 'LastGuestAccessAlertDismissal-';

		/*
			Interaction with Permissions

			refresh() needs to run AFTER permissionService has been initialised

			However, if this entire script runs after permissionService, then the $on subscriptions defined below will only be set up
			after permissionService has already broadcast the userSignedIn event, and thus refresh() will never be called.

			As we can't control what order they will be run in, we cater for both possibilities.
		 */


		////  Subscriptions //////////

        if(permissionService.isAgent) {
            $rootScope.$on(config.events.refreshSystemAlerts, refresh);
        }

		//if this script runs before permissionService, the event below will be triggered by end of the permissionService's init()
		$rootScope.$on(config.events.userSignedIn, refresh);


		//if this script runs after permissionService, this will cause refresh to run immediately
		if (permissionService.isReady && permissionService.isAgent) {
			refresh();
		}
		
		///////////////////////////


		////  Demo cloning checking //////////

		if ( config.session && config.session.IsCloning ) {
			$uibModal.open( {
				component: 'mtkDemoCloningMask',
				resolve: {},
				backdrop: 'static',
				appendTo: $document.find( '#content' ).eq( 0 )
			} );
		}

		///////////////////////////
        function refresh() {
            clear();
			if (!permissionService.isEditAllowed) {
				showGuestAccessAlertIfNecessary();
			}
            server.getQuietly('/api/billing/systemalerts/')
                .success(process);

        }

        function process(data) {
            data.forEach(function(newAlert) {
				prepare(newAlert);
                if (newAlert.Type.contains('Subscription')) {
					if (!vm.subscriptionAlert) {
						vm.subscriptionAlert = newAlert;
					} else {
						if (isHigherPriority(newAlert, vm.subscriptionAlert)) {
							vm.subscriptionAlert = newAlert;
						}
					}
				}

                if (newAlert.Type === 'Notice') {
					if (!vm.systemAlert) {
						vm.systemAlert = newAlert;
					} else {
						if (isHigherPriority(newAlert, vm.systemAlert)) {
							vm.systemAlert = newAlert;
						}
					}
                }
            });
        }

		function isHigherPriority(a,b) {
			var q = ['danger', 'error', 'success', 'warning', 'info'];
			return q.indexOf(a.State.toLowerCase()) < q.indexOf(b.State.toLowerCase());
		}

		function prepare(alert) {
			//handle relative and absolute URLs
			if (alert.LinkUrl) {
				if ( alert.LinkUrl.startsWith('http')) {
					alert.target='_blank'; //links out of app on in new window
				} else if (alert.LinkUrl.startsWith('www')) {
					alert.LinkUrl = 'http://' + alert.LinkUrl;
					alert.target='_blank'; //links out of app on in new window
				} else if (alert.LinkUrl.startsWith('#/')) {
					//do nothing
				} else if (alert.LinkUrl.startsWith('/app/open/')) {
					alert.target='_blank'; //links a report in new window
				} else if (alert.LinkUrl.startsWith('/')) {
					alert.LinkUrl = '#' + alert.LinkUrl;
				} else {
					alert.LinkUrl = '#/' + alert.LinkUrl;
				}
			}
		}

        function dismiss(which) {
			if (which === 'showGuestAccessAlert') {
				storeDismissalOfGuestAccessAlert();
			} else {
				server.post('/api/billing/systemalerts/dismiss', {Id: vm[which].Id})
					.success(refresh);
			}

			clear(which);
        }

        function clear(which) {
			if(which) {
				vm[which] = null;
			} else {
				vm.systemAlert = null;
				vm.subscriptionAlert = null;
				vm.showGuestAccessAlert = false;
			}
        }

		function showGuestAccessAlertIfNecessary() {
			var doIt = true;

			if (!supports_html5_storage()) {
				//local storage feature not available
				vm.showGuestAccessAlert = doIt;
				return;
			}

			//check local storage to see if this user has dismissed the alert before
			var data = window.localStorage[localStorageKeyPrefix + config.session.CustomerId];

			if (data) {
				//data is a string of an int counting number of milliseconds since unix epoch
				var m = moment(Number(data));
				var now = moment();

				//console.log(data, m.format(), now.diff(m, 'minutes'));
				//if (now.diff(m, 'minutes') < 1) {
				//	doIt = false;
				//}

				if (now.diff(m, 'hours') < 24) {
					doIt = false;
				}

			}
			vm.showGuestAccessAlert = doIt;
		}

		function storeDismissalOfGuestAccessAlert() {
			window.localStorage[localStorageKeyPrefix + config.session.CustomerId] = (new Date()).getTime();
		}

		function supports_html5_storage() {
			try {
				return 'localStorage' in window && window['localStorage'] !== null;
			} catch (e) {
				return false;
			}
		}

        function switchToDemoDatabase() {
            ux.modal.confirm('This will update your current session with the demo portfolio. <BR> <b>Are you sure you want to do this?</b>', function (confirmed) {
                if (confirmed) {
                    server.post('sec/user/portfolios/activedemo')
                        .success(function(response) {
                            // clear session to force session reload
                            config.session = null;
                            // refresh the page
                            location.reload();
                        });
                }

            });
        }

    }
})();