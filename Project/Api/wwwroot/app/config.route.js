(function () {
    'use strict';

    var app = angular.module('app');

    app.config(['$routeProvider', '$httpProvider', appConfig]);  // Not just routing config
    function appConfig($routeProvider, $httpProvider) {

        var isGuidRexEx = /[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/i;

        var resolvers = {
            session: {
                session: getSession
            }
        };

        $httpProvider.interceptors.push('httpErrorInterceptor');
        //$httpProvider.interceptors.push('httpRequestInterceptor');
        $httpProvider.interceptors.push('httpResponseInterceptor');

        // Dynamic routing based on a strict simple set of rules
        // eg: /properties -> /properties/properties.html
        // eg: /properties/new  - redirect to edit

        $routeProvider
        .when('/', {
                resolve: resolvers.session,
                templateUrl: function (rp) {
                    return '/app/defaultRedirect.html';
                }
            }
        ).when('/s=0', {            // Work around for a sign in redirect issue
                resolve: resolvers.session,
                redirectTo: '/'
            }
        ).when('/:section', {
                resolve: resolvers.session,
                templateUrl: function (rp) {
                    if (!rp.section) {
                        rp.section = '/reports';
                    }
                    return '/app/' + rp.section + '/' + rp.section + '-list.html';
                }
            }
        )// eg: /properties/new  - redirect to edit
            .when('/:section/new', {
                resolve: resolvers.session,
                templateUrl: function (rp) {
                    return '/app/' + rp.section + '/' + rp.section + '-edit.html';
                }
            }
        )// eg: /properties/arrears
            .when('/:section/:page', {
                resolve: resolvers.session,
                templateUrl: function (rp) {
                    return '/app/' + rp.section + '/' + rp.section + '-' + rp.page + '.html';
                }
            }
        )// eg: /property/card/id  or /setting/chartaccount/list
            .when('/:section/:parent/new', {
                resolve: resolvers.session,
                templateUrl: function (rp) {
                    return '/app/' + rp.section + '/' + rp.parent + '/' + rp.parent + '-edit.html';
                }
            }
        ).when('/:section/:page/:id', {
                resolve: resolvers.session,
                templateUrl: function (rp) {
                    if (isGuidRexEx.test(rp.id)|| !isNaN(rp.id)  ) {
                        return '/app/' + rp.section + '/' + rp.section + '-' + rp.page + '.html';
                    } else {
                        var parent = rp.page;  // Angular doesn't yet support regex in routes
                        var page = rp.id;
                        rp.id = null;
                        rp.parent = parent;
                        rp.page = page;
                        return '/app/' + rp.section + '/' + rp.parent + '/' + rp.parent + '-' + rp.page + '.html';
                    }
                }
            }
        ).when('/:section/:parent/:page/:id', {
                // eg: /properties/tenants/manage/id  - note: in this convention, property id is always last
                resolve: resolvers.session,
                templateUrl: function (rp) {
                    return '/app/' + rp.section + '/' + rp.parent + '/' + rp.parent + '-' + rp.page + '.html';
                }
            }
        ).otherwise({
                resolve: resolvers.session,
                redirectTo: '/'
            }
        );
    }

    getSession.$inject = ['$rootScope', 'locationHelper', '$q', 'config', 'session', '$route'];

    function getSession($rootScope, locationHelper, $q, config, session, $route) {
        locationHelper.closePreviousModals();
        var deferred = $q.defer();

        if (config.session) {
            if (config.session.Access != null && 
                config.session.Access.SubscriptionStatus === 'TrialExpired' &&
                !($route.current &&
                  $route.current.params &&
                  $route.current.params.section === 'user')) {
                locationHelper.subscribe();
                deferred.reject();
                return deferred;
            } else  {
                return deferred.resolve();
            }
        } else {
            if (session.isWaiting) {
                session.afterInit.push(deferred.resolve);
                return deferred.promise;
            } else {
                return session.init();
            }
        }
    }

})();