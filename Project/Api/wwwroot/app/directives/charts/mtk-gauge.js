(function () {
    angular.module('app').directive('mtkGauge', [ '$rootScope', 'config', directive]);

    var uniqueId = 0;

	// debug stuff
	/*
	new JustGage({
		id: 'gauge1',
		value: 7,
		min: 1,
		max: 20,
		title: 'title',
		label: 'label',
		showMinMax: false,
		gaugeWidthScale: 1.5,
		//levelColors: mtkColours.DangerToSuccess_3,
		levelColors: mtkColours.SuccessToSuccess_3,
		levelColorsGradient: false
	})
*/
    function directive($rootScope,config) {
        return {
            restrict: 'E',
            replace:true,
            template:'<div class=" just-gage-container"></div>', 
            scope: {
                value: '=',

                max: '=',
                min: '=',
                title: '@',
                label: '@'
            },
            link: link
        };

        function link(scope, element) {

            //set a unique id
            scope.uniqueId  = 'gauge' + uniqueId++;
            element.attr('id', scope.uniqueId);
            scope.$watch('value',refresh);

            var cleanup = $rootScope.$on(config.events.refreshData, refresh);
            scope.$on('$destroy', cleanup);

            function refresh() {
                g.refresh(scope.value);
            }

            var g = new JustGage({
                    id: scope.uniqueId,
                    value: Number(scope.value),
                    min: 0,//Number(scope.min),
                    max: 100,//Number(scope.max),
                    title:  ' ' ,
                    label: ' ',
					hideValue: (element.attr('hide-value') !== undefined),
                    minLabelTxt: ' ',
                    maxLabelTxt: ' ',
                    gaugeWidthScale: 0.80,
                    symbol:'%',
                    shadowOpacity: 0.25,
                    shadowSize: 3,
                    levelColors: mtkColours.WarningDanger,
                    gaugeColor: mtkColours.lighten(mtkColours.Success, 30),
                    donut:true,
                    noGradient: true,
                    relativeGaugeSize: true
                });

        }
    }
})();