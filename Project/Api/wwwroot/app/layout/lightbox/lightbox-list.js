(function () {
    "use strict";

    angular.module('app').controller('lightboxListController', ['$scope', '$timeout', 'ux', myController]);
    function myController($scope, $timeout, ux) {
        //properties on scope are the values passed from the callee, like list, selectedIndex

        var ctrl = this;
        ctrl.moveBy = moveBy;
        ctrl.moveTo = moveTo;
        ctrl.isImage = isImage;
        ctrl.isPDF = isPDF;

        ctrl.isLoading = true;

        ctrl.list = $scope.list;

        ctrl.save = save;
        ctrl.selected = [];
        ctrl.select = select;

        init();

        //////

        function init() {
            destroyScopeOnClose();
            refresh();
            ctrl.maxSelection = $scope.maxSelection ? $scope.maxSelection() : Number.MAX_SAFE_INTEGER;
        }

        ////////////////////
        function select( index ) {

            if ( !ctrl.list[ index ].selected ) {
                if ( ctrl.selected.length < ctrl.maxSelection )
                {
                    ctrl.list[ index ].selected = true;
                    ctrl.selected.push( ctrl.list[ index ] );
                    assignOverlay();
                } 
            } else {
                ctrl.list[ index ].selected = false;
                ctrl.selected.splice(ctrl.selected.indexOf( ctrl.list[ index ] ),1);
                assignOverlay();
            }
        }
        function assignOverlay() {
            ctrl.selected.forEach( function ( sel, index ) {
                sel.overlay = (index + 1);
            } );
        }

        function save() {
            $scope.selectHelper( ctrl.selected );
            forceClose();
        }

        function refresh() {
            ctrl.isLoading = true;
            ctrl.currentPhoto = null;
            var temp = $scope.list[0];
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


        function destroyScopeOnClose() {
            $( '.bootbox.modal.lightbox-modal' ).on( 'hidden.bs.modal', function () {
                $scope.$destroy();
            } );
        }

        function forceClose() {
            //use the bootstrap javascript to hide the modal, so that any callbacks tied to the close event still fire
            $( '.bootbox.modal.lightbox-modal' ).modal( 'hide' );
        }


        function isPDF(doc) {
            return doc && doc.FileType === 'PDF';
        }

        function isImage(doc) {
            var filetypes = 'JPEG PNG GIF JPG'.split(' ');
            return doc && filetypes.contains(doc.FileType);
        }



    }

})();