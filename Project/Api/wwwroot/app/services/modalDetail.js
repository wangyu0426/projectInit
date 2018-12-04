(function () {
    'use strict';

    angular.module('app').factory('modalDetail', ['$rootScope', '$compile', '$timeout', 'ux', factory]);
    
    function factory($scope, $compile, $timeout, ux) {
        function _factory (includeFile) {
            var self = this;
            self.show = show;
            self.close = close;
            self.dismissable = dismissable;
            self.scope = setScope;

            self.element = null;

            var isDismissable = false;
            var data = null;

            var template = '<div><div  ng-include="\'' + includeFile + '\'"></div></div>';


            function show(extraOptions, callback) {
                var options = {
                    message: render(),
                    backdrop: isDismissable ? true: 'static'
                };
                angular.extend(options,  extraOptions);

                if (callback) {
                    options.show = false;
                    var dialog = ux.modal.dialog(options);
                    dialog.on('shown.bs.modal', callback);
                    dialog.modal('show');
                } else {
                    self.element = ux.modal.dialog(options);
                }
            }

            function close() {
                if (self.element) {
                    self.element.modal('hide');
                }
            }

            function render() {
                var modalScope = $scope.$new(false); //true means isolated
                angular.extend(modalScope, data);

                var compiled = $compile(template)(modalScope);
                //modalScope.$apply();

                return  compiled;
            }

            function dismissable() {
                isDismissable = true;
                return self;
            }

            function setScope(_data) {
                data = _data;
                return self;
            }
        }
        return _factory;
    }
})();