(function () {
    'use strict';

    angular.module('app').directive('mtkConditionRadio',  directive);

    function directive () {
            return {
                restrict: 'E',
                template: '<span  class="mtk-condition-radio">' +
                            '<a href="" ng-show="model===\' \'" class="btn btn-sm btn-light" ng-click="toggle()" ><i class="icon-ban-circle"></i></a> ' +
                            '<a href="" ng-show="model===\'N\'" class="btn btn-sm btn-danger" ng-click="toggle()">N</a> ' +
                            '<a href="" ng-show="model===\'Y\'" class="btn btn-sm btn-success" ng-click="toggle()">Y</a> ' +
                           '</span>',
                scope: {
                    model: '='
                },
                link: function (scope, element) {
                    
                    scope.toggle = function() {
                        if (!scope.model || scope.model === ' ') { //nothing or empty toggles first to YES
                            scope.model = 'Y';
                        } else if (scope.model === 'Y') { //YES toggles to NO
                            scope.model = 'N';
                        } else if (scope.model === 'N') {//NO toggles to empty
                            scope.model = ' ';
                        }
                    };

                }
            };
    }
})();
