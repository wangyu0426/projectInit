(function () {
    "use strict";

	angular.module( "app" ).controller( 'systemAlertController', [ '$rootScope','server', systemAlertController]);

	function systemAlertController( $rootScope,server) {
        var vm = this;
        vm.totalNotRead = 1;
        init()
        function init(){
          server.get("notification").then(function(data){
            vm.todayActivities = data.data.filter((msg)=> moment().diff( moment(msg.dateTime), 'days') === 0);
            vm.yesterdayActivities = data.data.filter((msg)=> moment().diff( moment(msg.dateTime), 'days') === 1);
            vm.earlierActivities = data.data.filter((msg)=> moment().diff( moment(msg.dateTime), 'days') > 1);
          })
        }

    }
})();