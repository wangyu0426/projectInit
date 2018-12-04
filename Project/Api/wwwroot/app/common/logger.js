(function () {
    'use strict';

    angular.module('app').factory('logger', ['$log', logger]);

    function logger($log) {
        var service = {
            getLogFn: getLogFn,
            log: log,
            logError: logError,
            logSuccess: logSuccess,
            logWarning: logWarning,
            logResponse: logResponse
        };

        return service;

        function logResponse(response, title, httpConfig) {
            var allowed = ["Success", "Error", "Warn", "Info"];
            var status = response.ResponseStatus;
            var statusType = (allowed.indexOf(status.ErrorCode) > 0) ? response.ErrorCode.toLowerCase() : "error";

            if (httpConfig) {
                var onAlertResponse = httpConfig.onAlertResponse;
            }

            logAndShow(status.Message, title || "", null, true, statusType, onAlertResponse);
        }

        function getLogFn(moduleId, fnName) {
            fnName = fnName || 'log';
            switch (fnName.toLowerCase()) { // convert aliases
                case 'success':
                    fnName = 'logSuccess';
                    break;
                case 'error':
                    fnName = 'logError';
                    break;
                case 'warn':
                    fnName = 'logWarning';
                    break;
                case 'warning':
                    fnName = 'logWarning';
                    break;
            }

            var logFn = service[fnName] || service.log;
            return function (msg, data, showToast) {
                logFn(msg, data, moduleId, (showToast === undefined) ? true : showToast);
            };
        }

        function log(message, data, source, showToast) {
            logAndShow(message, data, source, showToast, 'info');
        }

        function logWarning(message, data, source, showToast) {
            logAndShow(message, data, source, showToast, 'warning');
        }

        function logSuccess(message, data, source, showToast) {
            logAndShow(message, data, source, showToast, 'success');
        }

        function logError(message, data, source, showToast) {
            logAndShow(message, data, source, showToast, 'error');
        }

        function logAndShow(message, data, source, showToast, toastType, onAlertResponse) {
            var write = (toastType === 'error') ? $log.error : $log.log;
            source = source ? '[' + source + '] ' : '';
            write(source, message, data || "");
            if (showToast) {
                if (onAlertResponse) {
                    onAlertResponse(toastType, message);
                } else {
                    if (toastType === 'error') {
                        toastr.error(message);
                    } else if (toastType === 'warning') {
                        toastr.warning(message);
                    } else if (toastType === 'success') {
                        toastr.success(message);
                    } else {
                        toastr.info(message);
                    }
                }
            }
        }     
    }
})
();