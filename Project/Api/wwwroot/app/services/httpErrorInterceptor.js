(function () {
    'use strict';

    var app = angular.module('app');

    app.factory('httpErrorInterceptor', ['$q', '$location', '$injector', '$rootScope', 'config', 'ux', interceptErrors]);

    function interceptErrors($q, $location, $injector, $rootScope, config, ux) {
        var logger = $injector.get('logger');
        return {
            'responseError': function (rejection) {
                $rootScope.$broadcast(config.events.ajaxDone);

                if (rejection.status === 500) {
                    console.error(JSON.stringify(rejection.data, true, 2));

                    var errorMsg = rejection.data.ResponseStatus.Message;
                    if (rejection.config && rejection.config.onAlertResponse) {
                        rejection.config.onAlertResponse('error', errorMsg);
                    } else {
                        ux.alert.error(errorMsg); // remove the (500),  from David
                    }
                } else if (rejection.data && rejection.data.ResponseStatus) {
                    if (rejection.data.ResponseStatus.ErrorCode !== 'New Message') {
                        logger.logResponse(rejection.data, null, rejection.config);
                    }
                } else if (rejection.status === 404) {
                    if (rejection.config) {
                        var url = rejection.config.url;
                        if (url.endsWith('.html')) { // Assume this is a routing error
                            var htmlErrorMsg = 'Oops, there seems to be an issue. As we continually monitor our services it is likely that we are already aware of this issue and are working to resolve it, but please contact us for an update on our progress.';
                            ux.alert.error(htmlErrorMsg, '(404)');
                            $location.path('/');
                        }
                    } else {
                        broadcastDisconnect();
                    }


                } else if (rejection.status === 401) { // Any non authorised exception, make them sign in
                    window.location = config.sessionTimeoutUrl;

                } else if (rejection.status === 403) { // Any non permission exception, report it
                    var msg = rejection.statusText || 'If you feel this is an error, try logging out and back in again or speak to your administrator.';
                    ux.alert.error(msg, 'Permission denied');
                } else {
                    broadcastDisconnect();
                }
                return $q.reject(rejection); // Always return a result
            }
        };

        function broadcastDisconnect() {
            $rootScope.$broadcast(config.events.serverDisconnected);
        }

    }

})();