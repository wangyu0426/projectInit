(function () {
    'use strict';

    var app = angular.module('app');

    app.factory('httpResponseInterceptor', ['$rootScope', 'config', responseInterceptor]);

    function responseInterceptor ($rootScope, config) {
        return {
            response: function (response) {
                broadcastReconnected();
                return response;
            }
        };

        function broadcastReconnected() {
            //$rootScope.$broadcast(config.events.ajaxDone);  Don't it here since the "posted" logical
            $rootScope.$broadcast(config.events.serverReconnected);
        }
    }
})();