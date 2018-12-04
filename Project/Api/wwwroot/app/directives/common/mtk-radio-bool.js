(function () {
    'use strict';

    //This is a wrapper for handle false/true situations : angular framework could not work by normal radio.
    angular.module('app')
        .directive('mtkRadioBool', ["server", "$filter", "logger", 'keyEvent', function (server, $filter, logger, keyEvent) {
            return {
                restrict: 'E',
                template: '<mtk-radio model="realModel" source="source" ng-disabled="ngDisabled()"/>',
                scope: {
                    labelTrue: '@',
                    labelFalse: '@',
                    model: '=model',
                    ngDisabled: '&',
                    falseFirst: '@'
                },
                link: function (scope, element, attrs) {
                    init();

                    scope.$watch('model', function (newValue) {
                        if (!angular.isUndefined(newValue) && newValue !== null) {
                            scope.realModel = newValue.toString();
                        }
                    });
                    scope.$watch('realModel', function (newValue) {
                        if (!angular.isUndefined(newValue) && newValue !== null) {
                            scope.model = scope.realModel === 'true';
                        }
                    });

                    function init() {
                        var labelTrue = angular.isUndefined(attrs.labelTrue) ? 'Yes' : attrs.labelTrue;
                        var labelFalse = angular.isUndefined(attrs.labelFalse) ? 'No' : attrs.labelFalse;
                        scope.source = [{
                                Id: 'true',
                                Name: labelTrue
                            },
                            {
                                Id: 'false',
                                Name: labelFalse
                            }
                        ];

                        if (scope.falseFirst) {
                            scope.source.reverse();
                        }
                    }
                }
            };
        }]);
})();