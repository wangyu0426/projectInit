(function() {
    "use strict";
    angular.module("app").directive('mtkAttrIframe', ['$timeout', directive]);

    function directive ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.css('width', '100%');

                element.on('load', resize);

                $timeout(resize, 500); 

                function resize() {
                    /* Set the dimensions here,
                     I think that you were trying to do something like this: */

                    var iframeWindow = element[0].contentWindow;
                    if ( iframeWindow && iframeWindow.document.body) {
                        var iFrameBody = iframeWindow.document.body;
                        var iFrameHeight = iFrameBody.scrollHeight + 15 + 'px';
                        element.css('height', iFrameHeight);

                        iFrameBody.style.cssText += 'font-size: 9pt; font-family: "Open Sans", sans-serif;';

                        $(iFrameBody).find('a').attr('target', '_blank');
                    }
                }
            }
        };
    }
})();