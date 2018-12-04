(function () {
    'use strict';

    angular.module('app').directive('mtkCurrency', ['textFormat', directive]);

    function directive(textFormat) {
        return {
            restrict: 'E',
            replace: true,
            require: 'ngModel',
            scope: {
                model: '=',
                onChange: '&'
            },
            template: '<input type="text" ng-model="model" ng-change="onChange({$value: model})" class="form-control currency" placeholder="{{default}}">',
            link: function (scope, element, attr, controller) {
                scope.default = textFormat.currency(0);

                controller.$parsers.push(function (value) {
                    if (attr.max && parseFloat(value) > parseFloat(attr.max)) {
                        return '';
                    }
                    return value;
                });
                controller.$parsers.push(function (value) {
                    var modelValue = formatCurrency(value).model;
                    if (typeof modelValue === 'string') {
                        return modelValue;
                    } else {
                        return modelValue.toFixed(2);
                    }
                });
                controller.$formatters.push(function (value) {
                    return formatCurrency(value).dom;
                });
                element.on('blur', function () {
                    element.val(formatCurrency(controller.$modelValue).dom);
                });
                element.on('click', function () {
                    element.select();
                });
                element.on('focus', function () {
                    element.val(formatCurrency(controller.$modelValue).model);
                });
            }
        };

        function formatCurrency(value) {
            //Note: isNaN('') results false, hence the need to parseFloat
            var value_f = parseToFloat(value);
            return {
                dom: (function () {
                    if (value_f === 0) {
                        return '';
                    } else {
                        return textFormat.currency(value);
                    }
                })(),
                model: (function () {
                    if (value_f === 0) {
                        return '';
                    } else {
                        return value_f;
                    }
                })()
            };
        } 

        function parseToFloat(value) {
            //Handle strings with dollar signs and separators
            var s, f;

            if (angular.isString(value)) {
                //TODO - more thorough localisation
                s = value.replace(/[, ]/g,''); //remove possible thousands separators - so 1,000,000 becomes 1000000
                s = s.replace(/\$/g,''); //remove dollar signs
                f = parseFloat(s);
            } else {
                f = parseFloat(value);
            }
           return isNaN(f) ? 0 : f;
        }

/*        function parseToFloat(value) {
            //Handle strings with dollar signs and separators
            var s, f;

            if (angular.isString(value)) {
                //TODO - more thorough localisation
                s = value.replace(/[, ]/g,''); //remove possible thousands separators - so 1,000,000 becomes 1000000
                s = s.replace(/\$/g,''); //remove dollar signs
                f = parseFloat(s);
            } else {
                f = parseFloat(value);
            }
            return isNaN(f) ? 0 : f;
        }*/
    }

})();