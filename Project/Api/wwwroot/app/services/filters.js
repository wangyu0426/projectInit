(function () {
	'use strict';
    var app = angular.module('app');

    app.filter('padNumber', ['textFormat', padNumberFilter]);
    app.filter('shortNumber',['textFormat', shortNumberFilter]);
    app.filter('decorateImportantWords', ['textFormat', decorateImportantWordsFilter]);
    app.filter('accountSummary', ['textFormat', contactAccountSummary]);

    app.filter('dateFromTo',  ['$filter', dateFromTo]);

	app.filter('timeAgo', ['textFormat', timeAgoFilter]);
	app.filter('dateTime', ['textFormat', dateTimeFilter]);
	app.filter('timeUntil', ['textFormat', timeUntilFilter]);
    app.filter('daysFromNow', ['textFormat', daysFromNowFilter]);
    app.filter('timeFromNow', ['textFormat', timeFromNowFilter]);
    app.filter('timeString', ['textFormat', timeStringFilter] );
    app.filter('time4Digit', ['textFormat', time4DigitFilter] );
    app.filter('patternNumber', ['$filter', patternNumber]);
    //app.filter('timeIntToString', ['textFormat', timeIntToStringFilter] );
    //app.filter('timeStringToInt', ['textFormat', timeStringToIntFilter] );

    app.filter('propsFilter', propsFilter);
    app.filter('truncate', truncateFilter);
    app.filter('titlecase', titleCaseFilter);
    app.filter('spaceFileName', spaceFileName);
    app.filter('spaceCamelCase', spaceCamelCaseFilter);
    app.filter('divideByThousand', divideByThousand);
    app.filter('firstLetterUpperCase', firstLetterUpperCaseFilter);
    app.filter('mergeFieldGroupSearchFields',mergeFieldGroupSearchFields);
    app.filter('trustHTML', ['$sce', trustHTMLFilter]);

    // It used to fix the angularjs $routeParams issue, see https://github.com/angular/angular.js/issues/10479
    app.filter('encodeURIComponent',function() {
        return window.encodeURIComponent;
    });

    app.filter('initials', ['textFormat', initialsFilter]);
    app.filter('untense', ['textFormat', untenseFilter]);
    app.filter('sanitiseLinkType', ['textFormat', sanitiseLinkTypeFilter]);

    app.filter( 'strReplace', strReplace );
    
    app.filter('cut', function () {
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                    //Also remove . and , so its gives a cleaner result.
                    if (value.charAt(lastspace-1) == '.' || value.charAt(lastspace-1) == ',') {
                        lastspace = lastspace - 1;
                    }
                    value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        };
    });

    /**
     * AngularJS default filter with the following expression:
     * "person in people | filter: {name: $select.search, age: $select.search}"
     * performs an AND between 'name: $select.search' and 'age: $select.search'.
     * This is to perform an OR.
     * (from: angular-ui ui-select library : AngularJS-native version of Select2 and Selectize)
     * http://angular-ui.github.io/ui-select/#examples
     */
    function propsFilter() {
        return function(items, props) {
            var out = [];

            if (angular.isArray(items)) {
                var keys = Object.keys(props);

                items.forEach(function(item) {
                    var itemMatches = false;

                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        };
    }

    function divideByThousand(textFormat){
        return function(input){
            return textFormat.divideByThousand(input);
        };
    }

    function shortNumberFilter(textFormat) {
		return function(input, decimals) {
			return textFormat.shortNumber(input, decimals);
		};
    }
    
    function untenseFilter(textFormat) {
		return function(input) {
			return textFormat.untense(input);
		};
	}

    function sanitiseLinkTypeFilter(textFormat) {
		return function(input) {
			return textFormat.sanitiseLinkType(input);
		};
    }
    
    function spaceCamelCaseFilter() {
        return function(input, allLower) {
            if (!input) {
                return '';
            } else if (allLower) {
                return input.fromCamelCaseToSentence().toLowerCase();
            } else {
                return input.fromCamelCaseToSentence();
            }

        };
    }

	function timeAgoFilter(textFormat) {
		return function(input) {
			return textFormat.timeAgo(input);
		};
	}

    function timeFromNowFilter(textFormat) {
        return function(input) {
            return textFormat.timeFromNow(input);
        };
    }

	function dateTimeFilter(textFormat) {
		return function(input) {
			return textFormat.dateTime(input);
		};
	}

    function timeUntilFilter(textFormat) {
        return function(input) {
            return textFormat.timeUntil(input);
        };
    }

    function daysFromNowFilter(textFormat) {
        return function(input) {
            var dFrom = -1 * textFormat.daysAgo(input);
            if (dFrom === 0) {return 'today';}
            if (dFrom === 1) {return 'tomorrow';}
            return 'in ' + dFrom + ' days';
        };
    }

    function decorateImportantWordsFilter(textFormat) {
        return function(str, tag) {
            return textFormat.decorateImportantWords(str, tag);
        };
    }

    function titleCaseFilter() {
        return function(str) {
            if (!str) {
                return undefined;
            }
            return str.toTitleCase();
        };
    }

    function firstLetterUpperCaseFilter() {
        return function(str) {
            if (!str) {
                return undefined;
            }
            return str.firstLetterUpperCase();
        };
    }

    //searches the groups of merge fields for fields that contain param
    //the groups are in the form of
    // {'Agent' : array of fields for agent, 'Owner': array of fields for owner}
    //returns a new object like
    //{'Agent' : array of fields for agent}
    //if ANY of the fields under 'array of fields for agent' contain param.
    //It does not filter the array of fields, only filters the groups
    function mergeFieldGroupSearchFields () {
        return function (groups, param) {
            var filtered = {};
            if (!param) {
                return groups;
            }

            for (var g in groups) {
                if (test(groups[g])) {
                    filtered[g] = groups[g];
                }
            }
            return filtered;

            function test(fields) {
                return fields.some(function(field) {
                    return (!!field) ? field.Code.toLowerCase().contains(param.toLowerCase()) : false;});
            }
        };
   }

    function trustHTMLFilter ($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    }

    //function timeStringToIntFilter(textFormat) {
    //    return function(str) {
    //        return textFormat.timeStringToInt(str);
    //    };
    //}
    //
    //function timeIntToStringFilter(textFormat) {
    //    return function(value) {
    //        return textFormat.timeIntToString(value);
    //    };
    //}


    function timeStringFilter(textFormat) {
        return function(value) {
            return textFormat.timeString(value);
        };
    }
    function time4DigitFilter(textFormat) {
        return function(value) {
            return textFormat.time4Digit(value);
        };
    }

	function spaceFileName() {
		return function(value, chunksize) {
			var s = '', v = value;
			while (v.length > 0) {
				s += v.substr(0, chunksize) + ' ';
				v = v.substr(chunksize);
			}
			return s;
		};
	}

    function padNumberFilter(textFormat) {
        return function(value, size) {
            return textFormat.padNumber(value, size);
        };
    }

    function truncateFilter() {
        return function  (text, length, end) {
            if(text === undefined || text === null){
                return text;
            }

            if (isNaN(length)) {
                length = 10;
            }
            if (end === undefined) {
                end = "...";
            }
            if (text.length <= length || text.length - end.length <= length) {
                return text;
            } else {
                return String(text).substring(0, length - end.length) + end;
            }
        };
    }

    function initialsFilter (textFormat) {
        return function(input) {
            if (angular.isString(input)) {
                // only return 2 char
                return textFormat.initials(input).substr(0,2) || '';
            }
        };
    }

    function contactAccountSummary(textFormat) {
        return function summary (accounts) {
            if (!accounts || accounts.length === 0) {
                return '';
            } else if (accounts.length > 1) {
                var result = 'split (';
                accounts.forEach(function (acc, i) {
                    if (acc.Value > 0) {
                        result += textFormat.currency(acc.Value);
                    } else {
                        result += acc.Percentage + '%';
                    }
                    if (i < accounts.length-1) {
                        result += ', ';
                    }
                });
                result += ')';
                return result;
            } else {
                return textFormat.paymentMethod(accounts[0].PaymentMethod);
            }
        };
    }

	function dateFromTo($filter) {
		return function fromTo (start, end) {
			//usage: {{ start | dateFromTo : end }}
			var	noStart = (!start || start === '0001-01-01'),
				noEnd = (!end || end === '0001-01-01'),
				render = $filter('date');
            if (noStart) {
                return '';
            } else if (noEnd) {
                return 'from ' + render(start);
            } else {
                return 'from ' + render(start) + ' to ' + render(end);
            }
		};

	}

	function patternNumber($filter) {

        return function(value, pattern) {
            /* jshint ignore:start */
            return new Number(value).numberFormat(pattern);
            /* jshint ignore:end */
        };
    }
    function strReplace( input, from, to ) {
        input = input || '';
        from = from || '';
        to = to || '';
        return input.replace( new RegExp( from, 'g' ), to );
    };

})();
