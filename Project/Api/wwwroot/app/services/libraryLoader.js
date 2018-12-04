(function () {
    'use strict';
    angular.module( 'app' ).service( 'libraryLoader', [ '$rootScope', '$window', '$cookies', '$timeout', '$q','ux', 'logger','$http', myService]);
    function myService( $rootScope, $window, $cookies, $timeout, $q, ux, logger, $http) {
        //var deferred = $q.defer();
        var self = {            
			Stripe: {
				deferred: $q.defer(),
				isLoaded: false,
				isWaiting: false,
				load: function () {
                    if ( window.Stripe ) return self.Stripe.deferred.promise;
                    // bing defined function "define" on global scope, it will clash with stripe's "define" function.
                    // Therefore, we temporarily store bing's "define function" when stripe loading, and restore it after its load.
                    // - stripe's "define" function, stripe will clean it after its load.
                    // - if bing is not loaded, nothing will be stored
                    // - the same comment in bing loader as well.
                    // - bing function name list " define, require".
                    var bingDefine;
                    if ( "function" == typeof define ) {
                        bingDefine = define;
                        define = undefined;
                    }
					return loadScriptFromWeb(
							'https://js.stripe.com/v2/',
						'Stripe'
                    ).then( function () {
                        if ( "function" == typeof bingDefine ) {
                            define = bingDefine;                            
                        }
                    } );
				}
			}
        };

        return self;

        function loadScriptFromWeb(url, libName, callbackParam, onError) {

            if (self[libName].isWaiting || self[libName].isLoaded) {
                return self[libName].deferred.promise;
            }

            // Use global document since Angular's $document is weak
            var script = document.createElement('script');
            var callbackName = libName + 'Callback';
            script.src = url;
            if (callbackParam) {
                script.src += '&' + callbackParam + '=' + callbackName ;
            }

            // Script loaded callback, send resolve
            $window[callbackName] = function () {
                logger.log(libName + ' loaded');
                self[libName].deferred.resolve();
                self[libName].isLoaded = true;
                self[libName].isWaiting = false;
            };
            self[libName].isWaiting = true;

			if (!callbackParam) {
				script.onload = $window[callbackName];
			}

            script.onerror = function(){
                var errorInfo = 'The internet isn\'t available.';
                logger.log(errorInfo);

                self[libName].deferred.reject(errorInfo);
            };

			document.body.appendChild(script);
			return self[libName].deferred.promise;

        }

    }
}());