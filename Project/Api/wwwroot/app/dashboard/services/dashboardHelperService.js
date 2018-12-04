(function () {
    'use strict';
    angular.module('app').service('dashboardHelperService', [ 'server', dashboardHelperService]);
    function dashboardHelperService(server) {
       
        return {
            isWidgetPercent: isWidgetPercent,
            getWidgetIcon: getWidgetIcon,
            getWidgetHref: getWidgetHref,
            getWidgetUnit: getWidgetUnit,
            fixZeros: fixZeros,
            hideUnNeededValues: hideUnNeededValues,
            getWidgetCompliment: getWidgetCompliment,
            getDescriptorClause: getDescriptorClause,
            getFeatureLabel: getFeatureLabel,
            getFeatureNumber: getFeatureNumber
        };

        //////////

        function isWidgetPercent(widget) {
            if (['Task', 'Job', 'Inspection', 'Sales', 'Reconciliation', 'BankFileTransaction'].contains(widget.Type) ||
                (['Renewals', 'Rent Reviews'].contains(widget.Label))){
                return false;
            }
            return true;
        }

        function getWidgetIcon(widget) {
            var  shape = '';
            switch (widget.label) {                
                case 'Seek':
                    shape = 'money';
                    break; 
                case 'Train':
                    shape = 'money';
                    break; 
                    
                case 'Save':
                    shape = 'money';
                    break;
                default:
                    shape = '';
            }
            return shape ? ' icon-' + shape : null;
        }

        function getWidgetHref(widgetType) {
            var url = '';
            switch (widgetType) {                
                case 'UnprocessedTransactions':
                    url = '#/transaction/process';
                    break;
                default:
                    url = '';
            }
            return url;
        }

        function getWidgetUnit(widget) {
            switch (widget.Label) {
                case 'Rent Arrears':
                case 'Invoice Arrears':
                case "Renewals":
                case 'Vacancies':
                    return 'property';
                case '':
                    return 'item';
                default:
                    return widget.Label;
            }
        }

        function hideUnNeededValues(widget) {
            if (widget.Values[0].Label === 'Total') {
                widget.Values.splice(0, 1); // remove total
            }
        }

        function getWidgetCompliment(widget) {
            if (widget.Values.some(function (item) {
                    return item.Percent > 0 || item.Amount > 0 || item.Quantity > 0;
                })) {
                //at least one has a value
                return null;
            } else {
                //all are empty, show a complement
                return '';
            }
        }

        function fixZeros(widget) {
            if (widget.isPercent) {
                widget.Values.forEach(function (val) {
                    val.Percent = Number(val.Percent);
                    val.Quantity = Number(val.Quantity);
                });
            }

        }

        function getDescriptorClause(widget) {
            switch (widget.Label) {
                case 'Rent Arrears':
                    return 'are in rent arrears';

                case 'Vacancies':
                    return 'are vacant';

            }

        }

        function getFeatureLabel(widget) {
            switch (widget.Label) {
                case 'Rent Reviews':
                    return 'rent review' + ( widget.featureNumber !== 1 ? 's' : '' )+' due this week';
                case 'Invoice Arrears':
                    return 'of properties have invoice arrears';
                case 'Jobs':
                    return 'job'+(widget.featureNumber !== 1 ? 's' : '') + '  in progress';
                case 'Inspection Tasks':
                    return 'current inspection task'+ (widget.featureNumber !== 1 ? 's' : '');
                case 'Inspection Planning':
                    return 'due in next 30 days';
                case 'Tasks':
                    return 'task'+ (widget.featureNumber !== 1 ? 's' : '') + ' to do';
                case 'Renewals':
                    return 'upcoming renewal'+ (widget.featureNumber !== 1 ? 's' : '');
                case 'BankFileTransaction':
                    return 'bank transaction'+ (widget.featureNumber !== 1 ? 's' : '') + ' to process';
            }
            return widget.Label;
        }

        function getFeatureNumber(widget, mainValue) {
            if (widget.isPercent) {
                return mainValue.Percent;
            }
            switch (widget.Label) {
                case 'Jobs':
                case 'Inspection Tasks':
                case 'Inspection Planning':
                case 'Tasks':
                case 'Rent Reviews':
                case 'unprocessed items':
                    return mainValue.Quantity;
                case 'Renewals':
                    return widget.Values.reduce(function (prevVal, elem, index, arr) { return prevVal + elem.Quantity;}, 0);

            }
            return mainValue.Percent;
        }

    }
}());