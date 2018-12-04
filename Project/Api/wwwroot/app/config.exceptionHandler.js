// Include in index.html so that app level exceptions are handled.
// Exclude from testRunner.html which should run exactly what it wants to run
(function () {
    'use strict';
    
    var app = angular.module('app');

    // Configure by setting an optional string value for appErrorPrefix.
    // Accessible via config.appErrorPrefix (via config value).

    app.config(['$provide', function ($provide) {
        $provide.decorator('$exceptionHandler',
            ['$delegate', 'config', 'logger', extendExceptionHandler]);
    }]);
    
    // Extend the $exceptionHandler service to also display a toast.
    function extendExceptionHandler($delegate, config, logger) {
        var appErrorPrefix = config.appErrorPrefix;
        return function (exception, cause) {
            $delegate(exception, cause);
            var msg = exception.message || exception;
            if (appErrorPrefix && msg.indexOf(appErrorPrefix) < 0) {
                msg = appErrorPrefix + ' ' + msg;
            }

            logger.log(msg);  // No need to display these errors on screen to the user
        };
    }
})();