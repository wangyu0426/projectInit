(function () {
    'use strict';
    angular.module('app').service('dateService', [dateService]);
    function dateService() {
        var dateConst = {
            formatStringForDatePicker: 'YYYY-MM-DD', // 2016-09-07
            today: 'Today',
            thisMonth: 'ThisMonth',
            lastMonth: 'LastMonth',
            custom: 'Custom'
        };
        return {
            isValid: function(fromDate, toDate) {
                return moment(toDate).diff(fromDate) >= 0;
            },
            isToday: function(fromDate, toDate){
                return moment().format(dateConst.formatStringForDatePicker) === fromDate &&
                    fromDate === toDate;
            },
            isThisMonth: function(fromDate, toDate){
                return moment().startOf('month').format(dateConst.formatStringForDatePicker) === fromDate &&
                    moment().endOf('month').format(dateConst.formatStringForDatePicker) === toDate;
            },
            isLastMonth: function(fromDate, toDate){
                return moment().subtract(1,'months').startOf('month').format(dateConst.formatStringForDatePicker) === fromDate &&
                    moment().subtract(1,'months').endOf('month').format(dateConst.formatStringForDatePicker) === toDate;
            },
            // get for date picker
            getToday: function(){
                var today =  moment().format(dateConst.formatStringForDatePicker);
                return { 'fromDate' : today, 'toDate': today };
            },
            getThisMonth: function(){
                return { 'fromDate' : moment().startOf('month').format(dateConst.formatStringForDatePicker),
                    'toDate' : moment().endOf('month').format(dateConst.formatStringForDatePicker) };
            },
            getLastMonth: function(){
                return { 'fromDate' : moment().subtract(1,'months').startOf('month').format(dateConst.formatStringForDatePicker),
                    'toDate' : moment().subtract(1,'months').endOf('month').format(dateConst.formatStringForDatePicker) };
            },
            getDateRange: function(fromDate, toDate){
                if (this.isToday(fromDate, toDate)){
                    return dateConst.today;
                } else if (this.isThisMonth(fromDate, toDate)){
                    return dateConst.thisMonth;
                } else if (this.isLastMonth(fromDate, toDate)){
                    return dateConst.lastMonth;
                } else {
                    return dateConst.custom;
                }
            }
        };
    }

})();