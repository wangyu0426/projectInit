(function () {
    'use strict';
    angular.module('app').service('filterUtility', ['$http', '$q', 'server', filterUtility]);
    function filterUtility($http, $q,server) {
        var exports = {
            stripTrailingSlash: stripTrailingSlash,
            updateQueryStringParameter: updateQueryStringParameter,
            formatQueryUrl: formatQueryUrl,
            getFilter: getFilter,
            saveFilter: saveFilter
        };



        /**
         * common method to stripTrailingslash of url
         */
        function stripTrailingSlash(str) {
            if(str.substr(-1) === '/') {
                return str.substr(0, str.length - 1);
            }
            return str;
        }

        /**
         * common method to update query string parameter
         */
        function updateQueryStringParameter(uri, key, value) {
            var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";
            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            } else {
                return uri + separator + key + "=" + value;
            }
        }

        /**
         * common method to format any query url to standard query path
         */
        function formatQueryUrl(url){
            if (url.substring(0, 4).toLowerCase() === '/api') {
                url = url.replace(/\/api/gi, '');
            }

            if (url.substring(0, 3).toLowerCase() === 'api') {
                url = url.replace(/api/gi, '');
            }

            if (url.charAt(0) !== '/') {
                url = '/' + url;
            }

            return url;
        }

        /**
         * common method to get filter from server.
         * @param url convert the query url to correct format
         */
        function getFilter (url){
            var def= $q.defer();

            url = updateQueryStringParameter(stripTrailingSlash(url.split('?')[0]), 'FilterDefinition', '1');

            server.getQuietly(url)
                .success(function(data)
                {
                    def.resolve(data);
                });

            return def.promise;
        }

        /**
         * common method to save filter to server
         * @param url post url
         * @param filters filter object to save
         */
        function saveFilter(url, filters){
            var def= $q.defer();

            url = formatQueryUrl(url);
            var postUrl = stripTrailingSlash(url.split('?')[0]);

            server.post("/api/entity/filter/", {
                Url: postUrl,
                Filters: filters
            }).success(function(data)
            {
                def.resolve(data);
            });

            return def.promise;
        }

        return exports;
    }
}());