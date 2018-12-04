(function () {
    'use strict';
    angular.module('app').service('mtkCachingService', ['$rootScope', service]);

    function service($rootScope) {
        var that = this;

        var caches = {};
        var invalidations = {};

        that.cache = function(cacheKey, cacheValue, maxAge) {
            var expiresAt = new Date().getTime() + (maxAge || 600) * 1000; // Max age default to 10 minutes (in ms)

            if (_.isEmpty(cacheKey) || _.isEmpty(cacheValue)) {
                return;
            }

            caches[cacheKey] = { 
                value: cacheValue, 
                expiresAt: expiresAt 
            };
            //console.log('[mtkCachingService] accepted cacheKey: ' + cacheKey, cacheValue);
        };

        that.cacheWithAutoExpire = function(cacheKey, cacheValue, affectedBy, maxAge) {
            that.cache(cacheKey, cacheValue, maxAge);
            that.invalidateCacheWhen(cacheKey, affectedBy);
        };

        that.get = function(cacheKey) {
            var now = new Date().getTime();
            if (cacheKey in caches) {
                //console.log('[mtkCachingService] cache hit: ' + cacheKey);
                if (caches[cacheKey].expiresAt > now) {
                    return caches[cacheKey].value;
                } else {
                    delete caches[cacheKey];
                }
            }
            //console.log('[mtkCachingService] cache miss: ' + cacheKey);
            return undefined;
        };

        that.remove = function(cacheKey) {
            if (cacheKey in caches) {
                delete caches[cacheKey];
                //console.log('[mtkCachingService] deleted cacheKey: ' + cacheKey);
            }
        };

        that.invalidateCacheWhen = function(cacheKey, affectedBy) {
            if (!_.isEmpty(affectedBy) && _.isArray(affectedBy)) {
                if (!_.contains(_.keys(invalidations), cacheKey)) {
                    invalidations[cacheKey] = [];
                }

                affectedBy.forEach(function(el) {
                    var event = 'affected:' + el.toLowerCase();
                    if (!_.contains(invalidations[cacheKey], event)) {
                        invalidations[cacheKey].push(event);
                        //console.log('[mtkCachingService] registered invalidation: ', event, cacheKey);

                        $rootScope.$on(event, function() {
                            //console.log('[mtkCachingService] deleted cacheKey: ' + cacheKey + ' due to ' + event);
                            that.remove(cacheKey);
                        });
                    }
                });
            }
        };

        // expire cache for labeltemplate
        $rootScope.$on('affected:labeltemplate', expireCache);

        function expireCache(event) {
            var newCaches = {};
            for (var property in caches) {
                if (caches.hasOwnProperty(property) && !property.startsWith('/api/common/labels/template')) {
                    newCaches[property] = caches[property];
                }
            }

            caches = newCaches;
        }
    }
})();