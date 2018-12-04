(function() {
    "use strict";
    angular.module("app").directive('mtkScrollTo', ['$timeout', directive]);

    function directive ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {

                scope.$watch(attr.mtkScrollTo, scrollToNewPosition);

                function scrollToNewPosition(newPos, oldPos) {
                    //console.log('newPos: ', newPos, 'oldPos: ', oldPos);
                    if (newPos > oldPos) {
                        handleScrollDown(element, newPos);
                    } else {
                        handleScrollUp(element, newPos);
                    }
                }

            }
        };

        function handleScrollUp(ulElement, index) {
            $timeout(function () {
                var ul = ulElement;
                var li = ulElement.find('li').eq(index - 1);
                if (li && li.position()) {
                    if (li.position().top - li.height() < 1) {
                        ul.scrollTop(li[0].offsetTop); //somehow li[0].offsetTop is different than li.offset().top
                    }
                }
            });
        }

        function handleScrollDown(ulElement, index) {
            $timeout(function () {
                var ul = ulElement;
                var li = ulElement.find('li').eq(index + 1);
                if (li && li.position()) {
                    if (ul.height() - li.position().top - li.height() < 1) {
                        ul.scrollTop(li[0].offsetTop + li.height() - ul.height()); //somehow li[0].offsetTop is different than li.offset().top
                    }
                }
            });
        }
    }
})();