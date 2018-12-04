(function () {
    'use strict';

    angular.module('app').directive('mtkTimePicker', ['lookupAdaptor', 'textFormat', directive]);

    function directive(lookupAdaptor, textFormat) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                model: '=',//1-2359
                minHour: '@',//0-23
                maxHour: '@',//0-23
                interval: '@' //1-30
            },
            link: link,
            template: '<div class="date-picker-container restrict-lookup-width"><mtk-lookup source="source.lookup" model="model"></mtk-lookup></div>'
        };

        function link(scope) {
            var list = source(scope.minHour, scope.maxHour, scope.interval);
            scope.source = new lookupAdaptor(list, function (item) {
                return {
                    id: item.twenty_four,
                    label: item.twelve,
                    template: item.twelve,
                    filter: item.filter
                };
            });
        }

        function source(minHour, maxHour, interval) {
            if (typeof(minHour) === 'undefined' || !between0And23(minHour)) {
                minHour = 7;
            }
            if (typeof(maxHour) === 'undefined' || !between0And23(maxHour)) {
                maxHour = 23;
            }
            if (typeof(interval) === 'undefined' || !between1And30(interval)) {
                interval = 30;
            }

            function between0And23(value) {
                return value >= 0 && value <= 23;
            }

            function between1And30(value) {
                return value >= 1 && value <= 30;
            }

            function am_mtk(hour) {
                if (hour < 12) {
                    return 'am';
                } return 'pm';
            }

            var timeIntervals = [];

            for(var hour = minHour; hour <= maxHour; hour++) {
                for(var iteration = 0; iteration < parseInt(60 / interval); iteration++) {
                    var _hour12 = hour > 12 ? hour - 12 : hour;
                    var _hour24 = hour;
                    var _minute = textFormat.padNumber(iteration * interval, 2);
                    var _am_pm = am_pm(hour);
                    timeIntervals.push({
                        "twenty_four": textFormat.padNumber(_hour24, 2).toString() + _minute.toString(),
                        "twelve": _hour12 + ':' + _minute + ' ' + _am_pm,
                        "filter": _hour12 + ' ' + _hour24 + ' ' + _minute + ' ' + _am_pm
                    });
                }
            }

            return timeIntervals;
        }
    }
})();