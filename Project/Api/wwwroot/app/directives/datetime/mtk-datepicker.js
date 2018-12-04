(function () {
    'use strict';

    angular.module('app').directive('mtkDatepickerInput', ['$locale','keyEvent', 'datetimeUtility', input]);
    angular.module('app').directive('mtkDatepicker', ['$locale', '$timeout', directive]);

    function input($locale, keyEvent, datetimeUtility) {
        return {
            restrict: 'E',
            replace: true,
            require: 'ngModel',
            scope: {
                model: '=',
                validate: '<'
            },
            template: '<input type="text" ng-model="model" class="form-control date-picker" ng-keydown="handle($event)">',
            link: function (scope, element, attr, ctrl) {
                ctrl.$parsers.push(function (value) {
                    return datetimeUtility.formatDate(value).model;
                });

                ctrl.$formatters.push(function (value) {
                    return datetimeUtility.formatDate(value).dom;
                });

                scope.handle = function (e) {
                    var code = e.which || e.keyCode;

                    if (code === keyEvent.KEY_RETURN) {
                        e.preventDefault();
                        element.val(datetimeUtility.formatDate(scope.model).dom);
                    }else if (code === keyEvent.KEY_DASH || code === keyEvent.KEY_SUBTRACT || code === keyEvent.KEY_DOWN) {
                        // user enter '-' key or down arrow key to go back a day
                        e.preventDefault();
                        scope.model = datetimeUtility.updateDate(scope.model, -1);
                        element.val(datetimeUtility.formatDate(scope.model).dom);
                    }else if (code === keyEvent.KEY_ADD || code === keyEvent.KEY_UP) {
                        // user enter '-' key or up arrow key to go back a day
                        e.preventDefault();
                        scope.model = datetimeUtility.updateDate(scope.model, +1);
                        element.val(datetimeUtility.formatDate(scope.model).dom);
                    }
                };

                element.on( 'blur', function () {
                    if ( scope.validate( scope.model ) ) {
                        element.val( datetimeUtility.formatDate( scope.model ).dom );
                    }
                    else {
                        element.val( '' );
                    }
                } );
            }
        };
    }

    function directive($locale, $timeout) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                model: '=',
                ngDisabled: '&',
                startDate:'@',
                endDate: '@',
                beforeShowDay: '<'
            },
            templateUrl: '/app/directives/datetime/mtk-datepicker.html',
            link: function (scope, element,attr) {
                // var localeFormat = $locale.DATETIME_FORMATS.shortDate.toUpperCase();
                var localeFormat = $locale.DATETIME_FORMATS.shortDate.toUpperCase().replace(/\/Y$/, '/YYYY');

                var serverFormat = 'YYYY-MM-DD';

                var $s = scope;

                $s.type = { calendar: 1, input: 2 };
                $s.typeInUse = $s.type.input;
                $s.validate = validate;
                var startDate = $s.startDate ? moment($s.startDate, serverFormat).format(localeFormat) : $s.startDate;
                var endDate = $s.endDate ? moment($s.endDate, serverFormat).format(localeFormat) :$s.endDate ;
                var calendar = element.find('input[name="calendar"]');
                var button = element.find('button');
                
                attr.$observe('startDate', function(newVal) {
                    if(newVal){
                        calendar.datepicker('setStartDate', moment($s.startDate, serverFormat).format(localeFormat));
                    }                    
                });
                attr.$observe('endDate', function(newVal) {
                    if(newVal){
                        calendar.datepicker('setEndDate', moment($s.endDate, serverFormat).format(localeFormat));
                    }                    
                });
                
                calendar.datepicker({
                    autoclose: true,
                    todayHighlight: true,
                    format: localeFormat.toLowerCase(),
                    startDate: startDate,
                    endDate: endDate,
                    beforeShowDay: $s.beforeShowDay                   
                }).on('changeDate', function (e) {
                    $timeout(function(){
                        $s.$apply(function () {
                            $s.model = moment(e.date).format(serverFormat);  //might need moment.parseZone() here -- see: http://momentjs.com/docs/#/parsing/parse-zone/
                        });
                    });
                }).on('hide', function () {
                    $s.$apply(function () {
                        $s.typeInUse = $s.type.input;
                    });
                })

                button.on('click', function () {
                    calendar.val('');

                    if ($s.model && $s.model.length > 0 && validate($s.model)) {
                        calendar.val(moment($s.model, serverFormat).format(localeFormat));
                    }

                    $s.$apply(function () {
                        $s.typeInUse = $s.type.calendar;
                    });

                    $timeout(function () {
                        if ($s.model && $s.model.length > 0) {
                            calendar.datepicker('update');
                        }
                    });
                    $timeout(function () {
                        calendar.focus();
                    }, 10);//the delay of 10ms is necessary and enough in most cases
                });

                $s.$on('$destroy', function() {
                    calendar.datepicker('remove');
                });

                function validate( date ) {
                    return ( !$s.startDate || moment( date ) >= moment( $s.startDate ) )
                        && ( !$s.endDate || moment( date ) <= moment( $s.endDate ) )
                        && ( !$s.beforeShowDay || $s.beforeShowDay( date ) );
                }
            }
        };
    }
})();