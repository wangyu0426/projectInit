(function () {
	'use strict';
    angular.module('app').service('session', ['$rootScope', '$window', '$location', '$http',
        'logger', 'config', 'permissionService', 'locationHelper', sessionService]);
    function sessionService ($rootScope, $window, $location, $http, logger, config, permissionService, locationHelper) {

		var self = {
		    init: init,
            isWaiting: false,
            isReady: false,
            afterInit: [],
            hasBsb: hasBsb
        };

		return self;

        function init() {
            self.isWaiting = true;

			return $http.get('/api/v1/auth', {
                headers: {
                    'If-Modified-Since': 'Mon, 26 Jul 1997 05:00:00 GMT',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
                })
                .error(function (data, status) {
                    self.isWaiting = false;
                if (status === 401) {
                        window.location = "/signin.html";
                    } else {
                        logger.logError(status + " error requesting data", null, true);
                    }
                })
                .success(function (session) {
                    self.isReady = true;
                    self.isWaiting = false;
                    config.session = session;

                    if (session && session.Access && session.Access.CustomerId) {
                        $http.defaults.headers.post.mtkustomerId = session.Access.CustomerId;
                    }

                    permissionService.init(session);
                    //logger.log(session);
                    $rootScope.isAppLoaded = true;

                    self.afterInit.forEach(function(fn) {fn();});
                    self.afterInit = [];

                    $rootScope.session = session;
                    $rootScope.isDarkMenuOn = session.Preferences && session.Preferences.IsDarkMenuOn;
                    if (session && session.Access){
                        if(session.Access.SubscriptionStatus === 'TrialExpired') {
                          locationHelper.go('/');
                        }
                    }
                });
        }
        
        function hasBsb() {
            return config.session.Region.CountryCode === 'AU';
        }
    }
}());