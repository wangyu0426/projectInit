(function () {
    'use strict';

    angular.module('app').directive('mtkInteger', ['textFormat', directive]);

    function directive(textFormat) {
        return {
            restrict: 'E',
            replace: true,
            require: 'ngModel',
            scope: {
                model: '=',
                noformat: '@',
                min:'<',
                max:'<'
            },
            template: '<input type="text" ng-model="model" class="form-control integer">',
            link: function (scope, element, attrs, ctrl) {

                var _shouldFormat = shouldFormat();

                if (!attrs.placeholder) {
                    element.attr('placeholder','0');
                }

                ctrl.$parsers.push(function (value) {
                    if (value === '-') {
                        return value;
                    }
                    return formatText( value, scope.min, scope.max).model;
                });

                ctrl.$formatters.push(function (value) {
                    if (_shouldFormat) {
                        return formatText( value, scope.min, scope.max).dom;
                    } else {
                        return formatText( value, scope.min, scope.max).model;
                    }
                });

                element.on('blur', function () {
                    if (_shouldFormat) {
                        element.val( formatText( ctrl.$modelValue, scope.min, scope.max).dom);
                    } else {
                        element.val( formatText( ctrl.$modelValue, scope.min, scope.max).model);
                    }
                });

                element.on('click', function () {
                    element.select();
                });

                element.on('focus', function () {
                    element.val( formatText( ctrl.$modelValue, scope.min, scope.max).model);
                });

                function shouldFormat() {
                    if (scope.noformat) {
                        return scope.noformat.toLowerCase() !== 'true';
                    } else {
                        return true;
                    }
                }
            }
        };

        function formatText(value, min, max) {
            //Note: isNaN('') results false, hence the need to parseInt
            var value_i = isNaN( parseInt( value ) ) ? 0 : parseInt( value );
            if ( value_i > max || value_i < min ) {
                value_i = 0;
            }
            return {
                dom: (function () {
                    if (value_i === 0) {
                        return '';
                    } else {
                        return textFormat.integer(value);
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