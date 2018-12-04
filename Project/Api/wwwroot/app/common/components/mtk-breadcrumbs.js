(function () {
    angular.module('app').component('mtkBreadcrumbs', {
        templateUrl: '/app/common/components/mtk-breadcrumbs.html',
        bindings: {
            labels: '@',
            urls: '@',
            icons: '@'
        },
        controller: ['$scope', 'server', 'config', controller],
        controllerAs: 'vm'
    });

    function controller($scope, server, config) {
        var vm = this;

        vm.crumbs = [];

        vm.$onChanges = function () {
            vm.crumbs = [];
            var labels = vm.labels ? vm.labels.split(',') : [];
            var urls = vm.urls ? vm.urls.split(',') : [];
            var icons = vm.icons ? vm.icons.split(',') : [];

            for (var i = 0; i < labels.length; i++) {
                vm.crumbs.push( {
                    label: itemAt(labels, i),
                    url: itemAt(urls, i),
                    icon: itemAt(icons, i)
                });
            }
        }
    }

    function itemAt(array, i) {
        if (array && array.length > i) {
            return array[i];
        } else {
            return '';
        }
    }

})();