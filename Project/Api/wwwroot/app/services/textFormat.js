(function () {
	'use strict';
	angular.module('app').service('textFormat', ['$filter',
		'$locale', 'config',
		createService ]);
    
    var moment = window.moment, numeral = window.numeral;

    function createService ($filter, $locale, config) {
		var localeFormat = $locale.DATETIME_FORMATS.shortDate.toUpperCase();
        var currentLocaleData = moment.localeData();
        var currencySymbol = $locale.NUMBER_FORMATS.CURRENCY_SYM;
        var eventActionTypesUntenseDict = {
            'Activated' : 'Activate',
            'Approved' : 'Approve',
            'Applied' : 'Apply',
            'Archived' : 'Archive',
            'Cancelled' : 'Cancel',
            'Completed' : 'Complete',
            'Created' : 'Create',
            'Deleted' : 'Delete',
            'Disbursed' : 'Disburse',
            'Geocoded' : 'Geocode',
            'Invoiced' : 'Invoice',
            'Paid' : 'Pay',
            'Receipted' : 'Receipt',
            'Rejected' : 'Reject',
            'Reversed' : 'Reverse',
            'Revoked' : 'Revoke',
            'Restored' : 'Restore',
            'Received' : 'Receive',
            'Leased' : 'Lease',
            'SignedIn' : 'SignIn',
            'Updated' : 'Update',
            'Unapproved' : 'Unapprove',
            'StatementReversed' : 'Reverse Statement',
            'Merged' : 'Merge',
            'SmsSent' : 'Send SMS',
            'Subscribed' : 'Subscribe',
            'JournaledFrom' : 'Journal Debit',
            'JournaledTo' : 'Journal Credit',
            'JobQuoteRequested' : 'Request Job Quote',
            'JobQuoteUpdated' : 'Update Job Quote',
            'Scheduled' : 'Schedule',
            'ReScheduled' : 'ReSchedule',
            'Inspected' : 'Inspecte',
            'Withdrawn' : 'Withdraw',
            'Changed' : 'Change',
            'RentReviewedWithNoChange' : 'Review Rent With No Change',
            'RentPaid': 'Pay Rent',
            'RentPaidInPeriod': 'Pay Rent In Period',
            'ReportFileGenerated': 'Generate Report File',
            'ReportGenerated': 'Generate Report',
            'Listed' : 'List',
            'UnderContract' : 'Under Contract',
            'DownloadedForm' : 'Download Form',
            'Scanned' : 'Scan',
            'RentMigrated' : 'Migrate Rent'
        };

		var service = {
			currency: function (value, zeroSymbol) {
				if (angular.isDefined(zeroSymbol) && (value === 0 || value === '0')) {return zeroSymbol;}
				else {return $filter('currency')(value);}
			},
            currencySymbol: currencySymbol,
            date: function (value) {
				return formatDate(value, 'shortDate');
			},
            formatDate: formatDate,
            today: function() {
              return service.dateData(new Date());
            },
			dateLong: function (value) {
                return formatDate(value, 'longDate');
			},
			dateTime: function (value) {
                return formatDate(value, 'short');
			},
			dateData: function (value) {
				if (value) {
					var dt = value instanceof Date ? value : new Date(value);
					return $filter('date')(dt, 'yyyy-MM-dd');
				} else {
					return null;
				}
			},
            dateText: function(value){
                if (value) {
                    var dt = value instanceof Date ? value : new Date(value);

                    var customerFormatter = 'd MMMM yyyy';
                    if(config.session.Region && config.session.Region.DateFormatClient) {
                        customerFormatter = config.session.Region.DateFormatClient;
                    }

                    return $filter('date')(dt, customerFormatter);
                } else {
                    return null;
                }
            },
            dateFromServer: function (value) {
                if (value) {
                    var dt  = moment(value).utc().toDate();
                    return $filter('date')(dt, 'shortDate');
                } else {
                    return null;
                }
            },
            dateAddDays: function (value, daysToAdd) {
                if (value) {
                    var dt = value instanceof Date ? value : new Date(value);
                    var mo = moment(dt);
                    mo.add('days',daysToAdd);
                    return service.dateData(mo.toDate());
                }
            },
			dateEndOfMonth: function (value) {
				return endOfMonth(value, 'yyyy-MM-dd');
			},
            daysAgo: daysAgo,
            daysAgoText: daysAgoText,
            timeAgo: timeAgo,
            timeUntil: timeUntil,
            timeFromNow: timeFromNow,
            thisPeriod: thisPeriod,

            escapeHtml: function (string) {
                var entityMap = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': '&quot;',
                    "'": '&#39;',
                    "/": '&#x2F;'
                };
                if (!string || string === null || string === undefined) {string = '';}

                return String(string).replace(/[&<>"'\/]/g, function (s) {
                    return entityMap[s];
                });
            },

            dayOfWeekByNumber: function(int) {
                return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][int];
            },
            monthByNumber: function(int) {
                return [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December'
                ][int - 1];
            },
            dayOfMonthText: function(int) {
                if (int >= 28) {
                    //return 'Last day';
                    int = 28;
                }

                return currentLocaleData.ordinal(int);
            },
            paymentMethod: function(m) {
                return m.replace('Cheque', config.session.Region.ChequeLabel);
            },

            //takes a 3 or 4 digit number represent 24 hour time,
            //return a string like "1:00 mtk"
            timeIntToString: function (value) {
                var hrs = Math.floor(value / 100), mins = value - hrs * 100;
                if (hrs > 12) {
                    return (hrs - 12) + ':' + service.padNumber(mins, 2) + ' mtk';
                } else if (hrs === 12 || hrs === '12') {
                    return hrs  + ':' + service.padNumber(mins, 2) + ' mtk';
                } else {
                    return (hrs) + ':' + service.padNumber(mins, 2) + ' am';
                }
             },

            timeIntToDateTime: function (value,day) {
                var hrs = Math.floor(value / 100), mins = value - hrs * 100;
                var m = moment(day);
                return m.seconds(0).hours(hrs).minutes(mins).toDate();

            },

            //takes string representing a time, like '9:00 mtk' and turns it into a four digit
            // int like 2100,
            timeStringToInt: function (str) {
                var m  = moment(str, 'h:mm a');
                if (!m.isValid()) {
                    m = moment(str, 'H:mm');
                }
                return m.hours() * 100 + m.minutes();
            },

            //takes a 3 or 4 digit number represent 24 hour time,
            //returns a date time string in UTC format (UTC time)
            //uses day paramter for the date part of the value, or today's date if not given
            timeIntToUTC: function (value, day) {
                var hrs = Math.floor(value / 100), mins = value - hrs * 100;
                var m = moment(day);
                return m.seconds(0).hours(hrs).minutes(mins).utc().format();
            },

            //takes a  date time string in UTC format (UTC time)
            // return 3 or 4 digit number represent 24 hour time,
            timeUTCToInt: function (value) {
                return Number(moment(value).format('Hmm'));
            },

            //moment.utc() is used to ensure that moment does not adjust the time for timezone.
            //it does NOT make the time into utc, rather it assumes that you are submitting it as utc and does no changes.
            timeString: function(value) {
                return moment(value).utc().format('h:mm a');
            },
            //moment.utc() is used to ensure that moment does not adjust the time for timezone.
            //it does NOT make the time into utc, rather it assumes that you are submitting it as utc and does no changes.
            time4Digit: function(value) {
                return moment(value).utc().format('HHmm');
            },

            isDate: function (value) {
                try {
                    var dt = new Date(value);
                    return true;
                } catch (e) {
                    return moment.isMoment(value);
                }
            },
			currentMonth: function() {
				return moment().format('MMMM');
			},
			integer: function (value) {
				return $filter('number')(value, 0);
			},
			decimal: function (value, places) {
				return $filter('number')(value, places || 1);
			},
			padNumber: function (num, size) {
				return ( Math.pow(10, size) + ~~num ).toString().substring(1);
			},
			shortNumber: shortNumber,

			initials: function (text) {
				if (text) {
					var words = text.split(' ');
					var result = '';
					words.forEach(function (word) {
						result += word.charAt(0).toUpperCase();
					});
					return result;
				} else {
					return null;
				}
			},
			mergeTemplate: function (template, obj) {
				var result = template;
				for (var prop in obj) {
					var match = '[' + prop + ']';
					if (result.indexOf(match) > -1) {
						result = result.replace(match, obj[prop]);
					}
				}
				return result;
			},
			formatPaymentMethod: function (val) {
				if (['EFT',
					'eft'].contains(val))
				{
					return 'EFT';
				}
				return val.toLowerCase() || "";
			},
            divideByThousand: function(input){
                var newValue = input > 1024 ? input /1024 : 1;
                newValue = input === 0 ? 0 : newValue;
                return $filter('number')(newValue, 0);
            },
            untense: function(input) {
			    if (input != null && eventActionTypesUntenseDict.hasOwnProperty(input)) {
			        return eventActionTypesUntenseDict[input];
                } else if (input != null && input.endsWith('ed')) { //remove ed to untense
                    return input.slice(0, -2);
                } else {
			        return input;
                }
            },
            sanitiseLinkType: function(input) {
                if (input === "MessageSchedule") {
                    return "Message";
                } else if (input === "Ownership") {
                    return "Owner";
                } else if (input === "Tenancy") {
                    return "Tenant";
                } else {
                    return input;
                }
            },
            decorateImportantWords:  decorateImportantWords,
            splitCamelCase: splitCamelCase
        };
        
		return service;
		function formatDate (value, format) {
			if (value) {
				var dt = null;
				if (value.indexOf && value.indexOf('-') >= 0) {
					dt = value instanceof Date ? value : new Date(value);
				} else if (angular.isDate(value)) {
                    dt = value;
                    //dt = moment(value, localeFormat).toDate();
                } else {
                    console.log('textFormat.js: unrecognised date')
                    return value;
                }
				var result = $filter('date')(dt, format);
				return result;
			} else {
				return null;
			}
		}

		function endOfMonth (value, format) {
			var dt = moment(new Date(value)).endOf('month');
			var result = dt.format(format.toUpperCase());
			return result;
		}


	}

    function shortNumber(value, decimals, charsBefore) {
		var ptn = !!charsBefore ? '0' + charsBefore + 'a' : '0a';
        if (decimals < 1) {ptn = 'a';}
		while (decimals > 1) {ptn = '0'+ptn; decimals --;}
        if (Math.abs(value) > 1000 && Math.abs(value) < 10000){
            return numeral(value).format('(0.' + ptn + ')');
        } else {
                return numeral(value).format('(' + ptn + ')');
        }
    }

    //Returns how long AGO the date/time in value is from NOW
    //Always assumes you are giving a date/time in the past
	function timeAgo(value) {
        if (!value) {
            return '';
        }
        if (Math.abs(moment().diff(value)) < 60000) {
            return 'a moment';
        }
		return moment(value).fromNow(true);
	}

    //Returns how far in time from now UNTIL the date/time in value
    //Always assumes you are giving a date/time in the future
    function timeUntil(value) {
        if (moment().diff(value, 'second') >= 0 ) {
            //value is actually in the past, so Moment's fromNow will return a string like "2 minutes ago" - we do not want this.
            //so instead use a time of 5 seconds in the future
            return moment().add({seconds: 5}).fromNow();
            //will return something like "in a few seconds"
        }
        return moment(value).fromNow();
    }

    function timeFromNow(value) {
        return moment(value).fromNow();
    }

    function daysAgo(value) {
        var date = moment(value);
        var nowDate = moment().startOf('day');
        return nowDate.diff(date, 'day');
    }

    function daysAgoText(dateValue) {
        var text = '';
        if(dateValue || !['','none', '0001-01-01'].contains(dateValue)) {
            var days = daysAgo(dateValue);
            if (days === 0) {
                text = 'today';
            } else if (days < 0) {
                //future
                if (days >  -2)  {
                    text = 'tomorrow';
                } else {
                    text = timeUntil(dateValue);
                }
            } else {
                //past
                text = timeAgo(dateValue);
            }
        }
        return text;
    }


    function decorateImportantWords(str, tag) {
        var allWords = 'supplier tenant owner job transaction receipt manual'.split(' '),
            txt = str + '',
            tag_start, tag_end;
        tag = tag || 'b';
        tag_start = '<' + tag + '>';
        tag_end = '</' + tag + '>';

        allWords.forEach(function(w) {
            //TODO - use regular expressions
            txt = txt.replace(w, tag_start + w + tag_end);
            txt = txt.replace(w.toTitleCase(), tag_start + w.toTitleCase() + tag_end);
        });

        return txt;

    }

    function thisPeriod(dateTimeValue) {
        var value = moment(dateTimeValue);
        var diff = moment().diff(value);
        var minutes, hours, days, weeks, months;

        if (diff < 0) { // future
            minutes = moment().diff(value, 'minutes');
            if (minutes > -5) {
                return 'next 5 minutes';
            }
            hours = moment().diff(value, 'hours');
            if (hours === -1) {
                return 'next hour';
            }
            weeks = moment().diff(value, 'weeks');
            if (weeks === -1) {
                return 'next week';
            }
            months = moment().diff(value, 'months');
            if (months === -1) {
                return 'next month';
            }
            var years = moment().diff(value, 'years');
            if (years === 0) {
                return 'this year';
            }
        } else {  // past
            minutes = moment().diff(value, 'minutes');
            if (minutes === 0) {
                return 'a moment';
            } else if (minutes < 5) {
                return 'last 5 minutes';
            }

            hours = moment().diff(value, 'hours');
            if (hours === 0) {
                return 'this hour';
            } else if (hours === 1) {
                return 'last hour';
            }

            days = moment().diff(value, 'days');
            if (days === 0) {
                return 'today';
            } else if (hours === 1) {
                return 'yesterday';
            }

            weeks = moment().diff(value, 'weeks');
            if (weeks === 0) {
                return 'this week';
            } else if (weeks === 1) {
                return 'last week';
            }

            months = moment().diff(value, 'months');
            if (months === 0) {
                return 'this month';
            } else if (months === 1) {
                return 'last month';
            }
        }
        return value.format('YYYY');
    }

    function splitCamelCase(stringValue) {
        if (stringValue) {
            return stringValue.replace(/([A-Z])/g, ' $1')
            //return stringValue.replace(/([a-z])([A-Z])/g, '$1 $2');
        } else {
            return stringValue;
        }
    }

})();
