'use strict';

/**
 * @ngdoc overview
 * @name app
 * @description
 * # app
 *
 * Main module of the application.
 */
angular
  .module('app', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
  
  var app = angular.module('app');
  app.filter('initials', [initialsFilter]);
  function initialsFilter () {
    return function(input) {
        if (angular.isString(input)) {
            // only return 2 char
            if (input) {
              var words = input.split(' ');
              var result = '';
              words.forEach(function (word) {
                result += word.charAt(0).toUpperCase();
              });
              return result;
            } else {
              return null;
            }
        }
    };
}

