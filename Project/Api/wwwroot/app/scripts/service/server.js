(function () {
    'use strict';

    var myApp = angular.module('app');

    myApp.service('server', ['$rootScope', '$http', '$timeout', '$q', serverService]);

    function serverService ($rootScope, $http, $timeout, $q) {
        var server = this;
        server.get = getFn;
        server.getQuietly = getQuietlyFn;

        server.post = postAsyncFnV2;
        server.postAndForget = postFn;
        server.delete = deleteFn;

        function errorHandle(err){
            console.log(err)
        }
        function getQuietlyFn(url, onAlertResponse) {
            return getFn(url, true, onAlertResponse);
        }

        function getFn(url) {

            var newUrl = getUrl(url);

            return $http.get(newUrl, {});
        }

        function deleteFn(url, obj) {
            var newUrl = getUrl(url);

            return $http.delete(newUrl, {params: obj})
                .error(errorHandle);
        }

        function postFn(url, obj) {

            var newUrl = getUrl(url);

            return $http.post(newUrl, obj)
                .error(errorHandle);
        }

        function postAsyncFnV2(url, obj, onAlertResponse) {
            $rootScope.$broadcast('server:posted');

            var newUrl = getUrl(url);

            // Wrap the polling in a standard promise
            var deferred = $q.defer();

            var _ignoreLoadingBar;
            if (obj) {
                _ignoreLoadingBar = obj.ignoreLoadingBar;
            }

            $http.post(newUrl, obj, { 
                    ignoreLoadingBar: _ignoreLoadingBar,
                    onAlertResponse : onAlertResponse
                })
                .error(function (data, status) {
                    errorHandle(data, status);
                    var message = '';
                    if (data && data.ResponseStatus && data.ResponseStatus.Message) {
                        message = data.ResponseStatus.Message;
                    } else {
                        message = data;
                    }
                    deferred.reject(message);
                })
                .success(function (response) {
                    if (response.ResponseStatus && response.ResponseStatus.ErrorCode === 'posted') {
                        //pollPostingStatus(response.TrackingIds, deferred);
                        waitForEvent(response.TrackingIds, deferred);
                    } else {
                        deferred.resolve(response);
                        $rootScope.$broadcast(ajaxDoneEv);
                    }
                });

            // Fake a httpPromise success
            var promise = deferred.promise;

            promise.success = function (success, failure) {
                return promise.then(success, failure);
            };
            return promise;
        }

        function waitForEvent(trackingIds, deferred) {
            var trackingId = trackingIds[0];

            if (window.EventSource) {

                var key = 'async-response:' + trackingId.toLowerCase();
                unsubscribeEvent = $rootScope.$on(key, function (event, response) {
                    $timeout.cancel(waitHandle);  
                
                    if (response.ResponseStatus) {
                        deferred.resolve(response);
                    } else {
                        deferred.reject(response);
                    }
                    $rootScope.$broadcast(ajaxDoneEv);
                });
            } else {
            }
        }

        function getUrl(url) {
            var newUrl = url;
            if (!newUrl.match("^/")) {
                newUrl = 'https://localhost:44335/api/' + newUrl;
            }
            return newUrl;
        }
    }
}());
