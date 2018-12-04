(function () {
	'use strict';
	angular.module('app').service('routeHistory', ['$rootScope', '$location', createService]);

    function createService ($rootScope, $location) {
        var service = {
            init: init,
            ignoreList: [],
            history: []
        };

        service.ignoreList = [
            /\/receipt\/tenant-search/i
        ];

        return service;

        // FUNCTION //

		function init() {
            $rootScope.$on('$routeChangeSuccess', function() {
                var url = $location.$$url;
                if (service.history.length === 0 || url !== service.history[0]) {
                    if (!anyAllRegEx(url, service.ignoreList) ) {
                        service.history.unshift(url); //need to use the url command so that the querystring is included
                    }
                }
            });

            $rootScope.routeBackEnabled = function () {
                return service.history.length >= 2;
            };
            $rootScope.routeBack = function (defaultUrl, backSteps) {
                if(backSteps && backSteps > 1){
                    while(backSteps > 1){
                        service.history.shift();
                        backSteps--;
                    }
                }
                service.history.shift();
                var url =  service.history.shift() || defaultUrl;
                if (url) {
                    //$location.path(url);
                    $location.url(url); //need to use the url command so that the querystring is included
                } else {
                    // Navigate to parent folder
                    var pattern = /[\/](\w+)[\/]/;
                    var matches = pattern.exec($location.$$path);
                    if (matches) {
                        $location.path(matches[1]);
                    }
                }
            };

            $rootScope.updateCurrentUrlOfHistory = function (newUrl) {
                if(service.history.length > 0){
                    service.history.shift();
                }
                service.history.unshift(newUrl);
            };

            $rootScope.reportLink = function (reportUrl, isUsePdfWriter) {
                var linkUrl =  '/app/open/report.html?r=' + encodeURIComponent(reportUrl);
                if(isUsePdfWriter){
                    linkUrl += '&UsePDfWriter=true';
                }
                return linkUrl;
            };

            $rootScope.reportPdfLink = function (reportUrl) {
                return '/app/open/report.html?onlyPdf=true&r=' + encodeURIComponent(reportUrl);
            };

            $rootScope.reportFileLink = function (fileKey) {
                return '/portal/index.html?FileKey=' + fileKey;
            };
		}

        function anyAllRegEx(value, expresions) {
            for(var i = 0; i < expresions.length; i++) {
                if (expresions[i].test(value)) {
                    return true;
                }
            }
            return false;
        }
	}
}());