
(function() {
    "use strict";
    angular.module("app").directive('mtkDownload', ['$timeout', directive]);

    function directive ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                // var downloadIfr = angular.element.find('#downloadIframe');
                var downloadIfr = element.find('#downloadIframe');
                //
                if (downloadIfr.length === 0) {
                    downloadIfr = angular.element('<iframe id="downloadIframe" style="display:none"></iframe>');
                    element.append(downloadIfr);
                }

                var iframeContentWindow = downloadIfr[0].contentWindow || downloadIfr[0];
                //
                function setIframeAndDownload(url) {
                    if (_.isEmpty(url) || _.isEmpty(iframeContentWindow)) { return; }
                    iframeContentWindow.location = url;
                }
                //
                element.bind('click', function() {
                    scope.onHandleClick();
                });
                //
                // // parse url
                scope.onHandleClick = function() {
                    var url;
                    if (angular.isDefined(attrs.mtkDownload)) {
                        url = attrs.mtkDownload;
                    } else if (_.isEmpty(url) && angular.isDefined(attrs.href)) {
                        url = attrs.href;
                    }
                    setIframeAndDownload(url);
                };

                scope.$on('$destroy', function() {
                    if(angular.isDefined(downloadIfr.remove)) {
                        downloadIfr.remove();
                    }
                });
            }
        };
    }
})();