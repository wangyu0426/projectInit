'use strict';

/**
 * @ngdoc function
 * @name app.controller:ClassmateCtrl
 * @description
 * # ClassmateCtrl
 * Controller of the app
 */
angular.module('app')
  .controller('ClassmateCtrl',[ 'server', function (server) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    var vm = this;
    init()
    function init(){
      server.get("student").then(function(data){
        vm.mates = data.data;
      })
    }
  }]);
