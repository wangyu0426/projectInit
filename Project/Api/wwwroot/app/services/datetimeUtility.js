(function () {
    'use strict';
    angular.module('app').service('datetimeUtility', ['$locale', datetimeUtility]);
    function datetimeUtility($locale) {
        var exports = {
            updateDate: updateDate,
            formatDate: formatDate,
            CorrectDateFormat: CorrectDateFormat,
            convertShortLocaleFormat: convertShortLocaleFormat
        };

        function updateDate(value, updateDays){
            var serverFormat = 'YYYY-MM-DD';
            if (!value || value.length === 0){
                return moment().format(serverFormat);
            }

            return moment(value).add(updateDays , 'day').format(serverFormat);
        }

        function formatDate(value) {
            // Hack to convert Angular locale format to moment format. Only works for regions that show year last
            var localeFormat = $locale.DATETIME_FORMATS.shortDate.toUpperCase().replace(/\/Y+/, '/YYYY');
            var serverFormat = 'YYYY-MM-DD';
            return {
                dom: (function () {
                    var newValue = moment(value, serverFormat).format(localeFormat);
                    var emptyValue = moment('0001-01-01', serverFormat).format(localeFormat);
                    if (newValue === 'Invalid date' || newValue === emptyValue) {
                        newValue = '';
                    }
                    return newValue;
                })(),
                model: (function () {
                    //Date.parse doesn't support date format, use moment to convert correct date value first.
                    //about PME 1266, if user delete the value in input box, return empty value
                    if (!value || value.length === 0)
                        return '';

                    //get the count number of slash in enter string
                    var countOfSlash = (value.match(/\//g) || []).length;
                    //if the count slash is not equal 2
                    if ( countOfSlash !== 2)
                    {
                        //more than 1 not equal 2 means more than 2, it's invalid date
                        if (countOfSlash > 1 )
                        {
                            return ''; //invalid date

                        }else{
                            //run correct date format function to convert to locale date
                            value = CorrectDateFormat(value, countOfSlash, localeFormat);
                        }
                    }

                    value = convertShortLocaleFormat(value, localeFormat);

                    var dateValue = moment(value, localeFormat);
                    //if the date value is invalid, return empty value as deleted.
                    if (!dateValue.isValid())
                        return '';

                    var newValue = dateValue ? Date.parse(dateValue.toDate()) : Date.parse(value);
                    if (newValue !== null) {
                        return moment(newValue).format(serverFormat);
                    }
                    return '';
                })()
            };
        }

        //PME-1336, date field does not pick up month and year automatically
        //As request, when user just enter a number, system should base on locale datetime format
        //to detect it is day or month or year.  then reformat as localeFormat. (Eg. Just enter '23' and the
        //field would automatically populate with 23/05/2017)
        //And also, when user just enter two number by slash, use same way to detect date format then
        //convert to locale format (Eg. Just enter '2/5' and the field would automatically populate
        //with 2/05/2017)
        function CorrectDateFormat(value, countOfSlash, localeFormat){
            var localeShortDateFormat = $locale.DATETIME_FORMATS.shortDate.toUpperCase();
            var dateFormat;
            switch(localeShortDateFormat.substring(0,1)){
                case 'D':
                    dateFormat = (countOfSlash === 0) ? 'DD' : 'DD/M';
                    break;
                case 'M':
                    dateFormat = (countOfSlash === 0) ? 'MM' : 'M/DD';
                    break;
                case 'Y':
                    dateFormat = (countOfSlash === 0) ? 'YY' : 'YY/M';
                    break;
                default:
                    dateFormat = (countOfSlash === 0) ? 'DD' : 'DD/M';
                    break;
            }

            try{
                value = moment(value, dateFormat).format(localeFormat);
                return value;
            }
            catch(e){
                return value;
            }
        }
        function convertShortLocaleFormat(value, localeFormat){


            var localeShortDateFormat = $locale.DATETIME_FORMATS.shortDate.toUpperCase();
            var shortLocaleFormats;

            switch(localeShortDateFormat.substring(0,1)){
                case 'D':
                    shortLocaleFormats = ['DD/MM/YY','D/M/YY','D/MM/YY', 'DD/M/YY'];
                    break;
                case 'M':
                    shortLocaleFormats = ['MM/DD/YY','M/D/YY','MM/D/YY', 'M/DD/YY'];
                    break;
                case 'Y':
                    shortLocaleFormats = ['YY/MM/DD','YY/M/D','YY/MM/D', 'YY/M/DD'];
                    break;
                default:
                    shortLocaleFormats = ['DD/MM/YY','D/M/YY','D/MM/YY', 'DD/M/YY'];
                    break;
            }

            try
            {
                for(var i=0; i<=shortLocaleFormats.length; i++)
                {
                    if (moment(value, shortLocaleFormats[i]).format(shortLocaleFormats[i]) === value)
                    {
                        value = moment(value, shortLocaleFormats[i]).format(localeFormat);
                        break;
                    }
                }

                return value;
            }
            catch (e) {
                return value;
            }
        }

        return exports;
    }
}());