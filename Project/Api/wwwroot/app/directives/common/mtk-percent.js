(function () {
    'use strict';

    angular.module('app').directive('mtkPercent', ['textFormat', directive]);

    function directive(textFormat) {
        return {
            restrict: 'E',
            replace: true,
            require: 'ngModel',
            scope: {
                model: '='

            },
            template: '<input type="text" ng-model="model" class="form-control decimal" placeholder="0.00%">',
            link: function (scope, element, attrs, ctrl) {

                ctrl.$parsers.push(function (value) {
                    return formatText(value).model;
                });

                ctrl.$formatters.push(function (value) {
                        return formatText(value).dom;
                });

                element.on('blur', function () {
                    element.val(formatText(ctrl.$modelValue).dom);
                });

                element.on('click', function () {
                    element.select();
                });

                element.on('focus', function () {
                    element.val(formatText(ctrl.$modelValue).model);
                });
            }
        };

        function formatText(value) {
            var decimalPlaces = 2;
            var roundingBase = Math.pow(10,decimalPlaces), value_i;

            if (value === undefined) {
                return '';
            }

            value = value.toString();
            if (value.indexOf('%') === (value.length - 1)) {
                value = value.substr(0, value.length - 1);
            }
            if (isNaN(value)) {
                value_i = 0;
            } else {
                value_i = parseFloat(value * roundingBase) / roundingBase;
            }

            return {
                dom: (function () {
                    if (value_i === 0) {
                        return '';
                    } else {
                        return textFormat.decimal(value, decimalPlaces) +'%';
                    }
                })(),
                model: (function () {
                    if (value_i === 0) {
                        return '';
                    } else {
                        return value_i;
                    }
                })()
            };
        }
    }
})();