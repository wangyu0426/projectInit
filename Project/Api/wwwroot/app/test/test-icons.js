(function () {
    'use strict';
    var CONTROLLER_ID = 'testIcons';
    angular.module('app').controller(CONTROLLER_ID, ['$timeout', viewmodel]);
    function viewmodel ($timeout) {
        var vm = this;

        var milliseconds = 1;
        $timeout(doIt, milliseconds);

        function doIt() {
            var allRules = [];
            var sSheetList = document.styleSheets;
            for (var sSheet = 0; sSheet < sSheetList.length; sSheet++) {
                var styleSheet = document.styleSheets[sSheet];
                var ruleList = null;
                try{
                    ruleList = styleSheet != null ? document.styleSheets[sSheet].cssRules : null;
                } catch(e) {
                    
                }

                if (!ruleList) continue;
                for (var rule = 0; rule < ruleList.length; rule++) {
                    var rl = ruleList[rule].selectorText;
                    if (/^\.icon/.test(rl) && rl.length < 40) {
                        allRules.unshift(rl);
                    }
                }
            }
            var bd = $('#icon_box'), row, colsPerRow = 4;
            allRules.forEach(function (rl,i) {
                var clean = rl.replace(".", "").replace("::before", "").replace("::after", "").replace(":before", "").replace(":after", "");

                if (i%colsPerRow === 0 ){
                    row = $('<div class="row"/>');
                    bd.append(row);
                }
                row.append("<div class='box col-xs-" + parseInt(12/colsPerRow) + "'><i class='" + clean + " icon-3x'></i> &nbsp; " + clean + "&nbsp;<i class='" + clean + "'></i></div>");
            });

        }



    }
})();
