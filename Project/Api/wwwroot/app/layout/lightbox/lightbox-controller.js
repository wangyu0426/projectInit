(function () {
    "use strict";

    angular.module('app').controller('lightboxController', ['$scope', '$timeout', 'ux', myController]);
    function myController($scope, $timeout, ux) {
        //properties on scope are the values passed from the callee, like list, selectedIndex

        var ctrl = this;
        ctrl.moveBy = moveBy;
        ctrl.moveTo = moveTo;
        ctrl.isImage = isImage;
        ctrl.isPDF = isPDF;

        ctrl.isLoading = true;

        ctrl.list = $scope.list;

        ctrl.isDeleteAllowed = !!$scope.deleteHelper;
        ctrl.deleteCurrentPhoto = deleteCurrentPhoto;

        $scope.selectedIndex = $scope.selectedIndex || 0;

        if ($scope.selectedIndex < 0) {
            $scope.selectedIndex = 0;
        }

        ctrl.isReorderingAllowed = !!$scope.reorderHelper;
        ctrl.isReordering = false;
        ctrl.enableReordering = enableReordering;
        ctrl.saveReordering = saveReordering;
        ctrl.cancelReordering = cancelReordering;
        ctrl.sortableOptions = {
            animation: 150,
            handle: "li",  // Drag handle selector within list items
            draggable: "li",  // Specifies which items inside the element should be sortable
            ghostClass: "drag-placeholder"  // Class name for the drop placeholder
        };


        init();

        //////

        function init() {
            addKeyboardHandling();
            destroyScopeOnClose();
            refresh();
        }

        ////////////////////

        function refresh() {
            ctrl.isLoading = true;
            ctrl.currentPhoto = null;
            var temp = $scope.list[$scope.selectedIndex];
            if (temp.FileType === 'PDF') {
                ctrl.currentPhoto = temp;
                ctrl.isLoading = false;
            } else {
                //Preloading the image allows us to show the loading spinner only whilst the image is loading.
                //As the lightbox handles pictures of all different sizes, there isn't anywhere that the loading in spinner can be placed
                //such that we can guarantee it will be hidden when the image loads. Eg if it is in the center, and the screen is big, but the photo is small, it will still be visible.
                //If it is placed at the top center and the picture is landscape, it will be visible. If it is placed in the top corner and the picture is portrait it will be visible, etc.
                ux.preloadImage(temp.bigSrc, function() {
                    $timeout(function() {
                        //console.log(temp);
                        ctrl.currentPhoto = temp;
                        ctrl.isLoading = false;
                    });
                });
            }
        }

        function moveBy(direction) {
            $scope.selectedIndex += direction;
            if ($scope.selectedIndex >= $scope.list.length) {
                $scope.selectedIndex = 0;
            }
            if ($scope.selectedIndex < 0) {
                $scope.selectedIndex = $scope.list.length - 1;
            }
            refresh();
        }

        function moveTo(newIndex) {
            $scope.selectedIndex = newIndex;
            refresh();
        }

        function deleteCurrentPhoto() {
            deletePhoto(ctrl.currentPhoto);
        }

        function deletePhoto(deleteMe) {

            $scope.deleteHelper(deleteMe, function () {
                $scope.list.remove(deleteMe);
                if ($scope.list.length) {
                    moveBy(0); //will load next photo and handle if the selectedIndex is now > length
                } else {
                    //that was the last photo, the list is empty
                    forceClose();
                }

            });
        }


        function addKeyboardHandling() {
            $(window).on('keydown.lightbox.arrows', function (ev) {
                if (ev.which == 37 || //left arrow
                    ev.which == 38 || //up arrow
                    ev.which == 33) { //page up
                    moveBy(-1);
                    $scope.$apply(); //keyboard doesn't trigger a $apply automatically
                }
                if (ev.which == 39 || //right arrow
                    ev.which == 40 || //down arrow
                    ev.which == 34) { //page down
                    moveBy(+1);
                    $scope.$apply(); //keyboard doesn't trigger a $apply automatically
                }

            });

            $(window).on('keydown.lightbox.esc', function (ev) {
                if (ev.which == 27) { //escape
                    forceClose();
                }
            });

            //remove these handlers when the modal is closed
            $('.bootbox.modal.lightbox-modal').on('hidden.bs.modal', function () {
                $(window).off('keydown.lightbox.arrows keydown.lightbox.esc');
            });
        }

        function destroyScopeOnClose() {
            $('.bootbox.modal.lightbox-modal').on('hidden.bs.modal', function () {
                $scope.$destroy();
            });
        }

        function forceClose() {
            //use the bootstrap javascript to hide the modal, so that any callbacks tied to the close event still fire
            $('.bootbox.modal.lightbox-modal').modal('hide');
        }

        function isPDF(doc) {
            return doc && doc.FileType === 'PDF';
        }

        function isImage(doc) {
            var filetypes = 'JPEG PNG GIF JPG'.split(' ');
            return doc && filetypes.contains(doc.FileType);
        }


        //////// Reordering///////

        function enableReordering() {
            ctrl.isReordering = true;
            ctrl.originalList = ctrl.list.clone();
        }

        function saveReordering() {
            var reorderedIds =ctrl.list.map(
                function(item){
                    return item.Id;
                }
            );

            $scope.reorderHelper(reorderedIds, function () {
                ctrl.isReordering = false;
                refresh();
            });
        }
        function cancelReordering() {
            ctrl.list = ctrl.originalList;
            ctrl.isReordering = false;
        }


    }

})();