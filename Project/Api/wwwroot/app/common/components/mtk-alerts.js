(function () {
    angular.module('app').component('mtkcAlerts', {
        templateUrl: '/app/common/components/mtk-alerts.html',
        bindings: {
            alerts: '<',
        },
        controller: [controller],
        controllerAs: 'vm'
    });

    function controller() {
    }

})();