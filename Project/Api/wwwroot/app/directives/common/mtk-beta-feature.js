(function () {
    'use strict';
    angular.module('app').directive('mtkBetaFeature', ['config', '$compile', mtkBetaFeature]);

    function mtkBetaFeature(config, $compile) {
        return {
            restrict: 'A',
            replace: false,
            transclude: false,
            require: '?^mtkTab',
            link: function(scope, element, attrs, tab) {
                if (tab) {
                        tab.betaFeature();
                } else {
                    var betaSpan = angular.element('<span style="vertical-align: top; font-size: xx-small; margin-left: 2px;">beta</span>');
                    betaSpan.appendTo(element);
                    $compile(betaSpan)(scope);
                }
            }
        };
    }
})();