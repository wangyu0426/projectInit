(function () {
    'use strict';
    angular.module('app').service('lightboxService', ['modalDetail',  myService]);
    function myService(modalDetail) {

        var modal;

        return {
            show: show,
            showList:showList
        };

        function show(listOfPhotos, selectedIndex, deleteHelper, reorderHelper) {
            var scope = {
                    list: listOfPhotos,
                    selectedIndex: selectedIndex,
                    deleteHelper: deleteHelper,
                    reorderHelper: reorderHelper

                },
                modalOptions = {
                    className: 'lightbox-modal'
                };

            modal = new modalDetail('/app/layout/lightbox/lightbox-alt.html');
            modal.dismissable()
                 .scope(scope)
                 .show(modalOptions);

            return modal;
        }
        function showList( listOfPhotos, selectHelper, maxSelection ) {
            var scope = {
                list: listOfPhotos,
                selectHelper: selectHelper,
                maxSelection: maxSelection
            },
                modalOptions = {
                    className: 'lightbox-modal'
                };

            modal = new modalDetail( '/app/layout/lightbox/lightbox-list.html' );
            modal.dismissable()
                .scope( scope )
                .show( modalOptions );

            return modal;
        }

    }
})();