(function () {
    'use strict';

    angular.module('app').directive('mtkAutofocus', ['$timeout', mtkAutofocusDirective]);
    angular.module('app').directive('mtkFocus', ['$timeout', mtkFocusDirective]);

    function mtkAutofocusDirective ($timeout) {
        return {
            restrict: 'A',
            replace: false,
            link: function (scope, element, attrs) {
                debugLog("watching: " + attrs['mtkAutofocus']);

                scope.$watch(attrs['mtkAutofocus'], function (value) {
                    debugLog("watch changed");
                    var isEnabled = true;
                    var enableBinding = attrs['mtkAutofocusEnabled'];
                    if (enableBinding) {
                        isEnabled = scope.$eval(enableBinding);
                        debugLog("value: " + value);
                        debugLog("enableBinding: " + enableBinding + "=" + isEnabled);
                    }
                    if (isEnabled) {
                        $timeout(function () {
                            setTheFocus(element, attrs['mtkAutofocus']);
                        }
                        );
                    }
                }
                );
            }
        };
    }

    function mtkFocusDirective ($timeout) {
        return {
            restrict: 'A',
            replace: false,
            link: function (scope, element, attrs) {
                scope.$watch(attrs['mtkFocus'], function update(isFocus) {
                    if (isFocus) {
                        $timeout(function () {
                            setTheFocus(element);
                        });
                    }

                    //set it back to false, to enable next time focus
                    scope.$eval(attrs['mtkFocus'] + ' = false;');
                });
            }
        };
    }


    //// common functions to share

    function setTheFocus(element, bindingText) {
        var elem = null;
        //enable focus for buttons
        if (element[0].nodeName === 'INPUT' || element[0].nodeName === 'BUTTON' || element[0].nodeName === 'A' || element[0].nodeName === 'TEXTAREA') {
            elem = element[0];
        } else {
            var inputs = element.find('input:visible');
            if (inputs && inputs.length > 0) {
                elem = inputs[0];
            }
        }
        if (elem) {
            debugLog('setting focus');
            elem.focus();
        }
    }

    function debugLog(msg) {
        //console.log('mtkAutofocus: ' + msg);
    }
})();