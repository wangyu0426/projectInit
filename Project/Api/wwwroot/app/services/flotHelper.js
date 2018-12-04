(function () {
    'use strict';

    angular.module('app').service('flotHelper', ['$timeout', '$window', service]);

    function service( $timeout, $window) {

        var self = this;

        self.plotAfterWaitingForDOM = plotAfterWaitingForDOM;

        ////////////////////////

        //Flot Js's plot function uses the on-screen dimensions of the placeholder to calculate the size of the graph
        //So we have to wait until after the DOM has rendered

        function plotAfterWaitingForDOM(placeholder, dataset, options, waitTime) {
            var tries = 0, maxTries = 40, isDone = false;
            function inner(placeholder, dataset, options, waitTime){
                waitTime = waitTime || 5;
                $timeout(function() {
                    if (!isDone && checkWidth()) {
                        //console.log("Plotting after " + tries + ' tries, last waitTime:' + waitTime);
                        $.plot(placeholder, dataset, options);
                        isDone = true;


                    } else {
                        tries ++;
                        if (tries < maxTries) {
                            inner(placeholder, dataset, options, waitTime + waitTime); //increase the waitTime fibonacci style
                        } else {
                            console.log("Couldn't plot graph - DOM took too long to load.");
                        }
                    }
                }, waitTime);
            }

            //Use recursion
            inner(placeholder, dataset, options, waitTime);

            function checkWidth() {
                //this returns true only when the DOM element has been rendered and has a width
                return parseInt($window.getComputedStyle(placeholder[0]).width) > 0;
            }
        }

        ///////

        return self;

    }
})();