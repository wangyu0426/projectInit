(function(){
    'use strict';
    angular.module('app')
        .directive('mtkColourPicker',[function() {
            return {
                restrict: 'E',
                scope: {
                    model: '=',
                    buttonText: '@',
                    callback: '&',
                    // make two-way data binding optional
                    // isShow: '=',
                    isShow: '=?',
                    isPreview: '@'
                },
                templateUrl: '/app/directives/common/mtk-colour-picker.html',
                compile: function (scope, el, attrs) {
                    // set this variable early on compile func.
                    scope.isShow = false;

                    // return link function
                    return function (scope, el, attrs) {
                        scope.toggle = function () {
                            scope.isShow = !scope.isShow;
                            scope.callback();   // call parent callback
                        };
                        scope.getStyle = function () {
                            if (scope.isPreview && scope.isPreview.toLowerCase() === 'true') {
                                return {'background': scope.model};
                            } else {
                                return {};
                            }
                        };
                    };
                }
            };
        }]);


})();