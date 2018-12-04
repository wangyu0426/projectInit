(function () {
    'use strict';
    angular.module('app').directive('mtkFormFooter', ['$window', '$rootScope', 'logger', 'config', createDirective]);

    function createDirective($window, $rootScope, logger, config) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            templateUrl: '/app/directives/common/mtk-form-footer.html',
            scope: {
                onSave: '&',
                onValidate: '&?',
                onCancel: '&',
                isDisabled:'=',
                showCancel: '=?',
                saveLabel: '=?',
                saveIcon: '=?'
            },
            link: function (scope, element, attr) {
                scope.myCancel = function () {
                    //$window.history.back();
                    $rootScope.routeBack();
                    logger.logWarning('Cancel clicked', 'mtk-form');
                };

                if (!angular.isUndefined(attr.onCancel)) {
                    scope.myCancel = scope.onCancel;
                }

                if (!scope.saveLabel) {
                    scope.saveLabel = "Save";
                }

                if (!scope.saveIcon) {
                    scope.saveIcon = 'icon-save';
                }

                if (scope.showCancel === undefined) {
                    scope.showCancel = true;
                }

                scope.internalSave = function(event) {
                    if ($(event.target.form).hasClass('ng-invalid')) {
                        //this will still trigger browser validation
                        event.stopPropagation();
                        return;
                    }

                    if (scope.onValidate) {
                        var isValid = scope.onValidate();
                        if (!_.isUndefined(isValid) && _.isEqual(false, isValid)) {
                            event.preventDefault();
                            return;
                        }
                    }

                    scope.onSave({
                        stop : function() {
                            event.preventDefault();
                    }});
                };
            }
        };
    }
})();