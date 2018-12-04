(function () {
    'use strict';

    var app = angular.module('app', [
        // Angular modules 
        'ngAnimate',        // animations
        'ngRoute',          // routing
        'ui.select',        // UI select (ex: labels, messages)
        'ngSanitize',       // sanitizes html bindings (ex: sidebar.js)
        'ngCookies',

        // 3rd Party Modules
        'ui.bootstrap',     // ui-bootstrap (needed for dropdown menus) (ex: carousel, pagination, dialog)

        'ui.select',     // angular-ui selector, for multi-selection

        // Loading Bar causes exceptions on post errors
        'angular-loading-bar', //Automatic loading bar when $http call

        'angularFileUpload',

        'easypiechart',
        //'ngTouch',
        'ng-sortable',
        'mp.colorPicker',
        'ngTagsInput',
        'chart.js',
        'ds.objectDiff',
        'froala',
        'webcam',
        'cfp.hotkeys'
    ]);

    // Handle routing errors and success events
    app.run( [ '$route', '$rootScope', '$http','$cookies', 'dtoFactory', 'ux', 'routeHistory', 'session', 'config', 'locationHelper', run]);

    function run( $route, $rootScope, $http, $cookies, dtoFactory, ux, routeHistory, session,  config, locationHelper) {

       $rootScope.location = locationHelper;
       $rootScope.isSettingsView = false;
       $rootScope.modalResult = null;
       $rootScope.isDarkMenuOn = false;

        session.init();

        ux.init();
        routeHistory.init();

        moment.locale('en-au');        
        $rootScope.$on("$routeChangeSuccess", function(event, next, current) {
            $rootScope.isSettingsView = false;
         });
    }

})();