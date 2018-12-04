(function () {
    'use strict';


    angular.module('app').component('mtkSettingMemberImage', {
        //template: '<h1>Hello World</h1>',
        templateUrl: '/app/user/components/mtk-setting-member-image.html',
        bindings: {
            memberId: '=',
            documentType: '@',
            title: '@',
            onChangeStatus: '&'
        },
        controllerAs: 'vm',
        controller: ['$scope', '$timeout', 'ux', 'config', 'server', 'textFormat', controller]
    });

    function controller($scope, $timeout, ux, config, server, textFormat) {
        var vm = this;
        vm.uploadImage = uploadImage;
        vm.deleteImage = deleteImage;
        vm.getUploadInfo = getUploadInfo;
        vm.uploader =  server.memberUploader;
        vm.documentExists = true;


        vm.$onInit = function () {
            if (!vm.documentType) {
                vm.documentType = 'avatar';
            }

            vm.previewFile = getPreviewFileUrl();

            getMemberDocument();
        };

        function getPreviewFileUrl () {
            if (vm.documentType === 'avatar') {
                return ux.getAvatarUrl(vm.memberId, 'Original');
            }else {
                return '/api/storage/member/documents/' + vm.documentType + '/' + vm.memberId;
            }
        }

        function getMemberDocument() {
            server.get('/api/storage/member/documents/exists/' + vm.documentType + '/' + vm.memberId)
                .success(function(response) {
                    vm.documentExists = response;
                });
        }

        function uploadImage(file) {
            vm.uploader.formData =  getUploadInfo();
            vm.uploader.addToQueue(file);
        }

        function triggerChangeStatus(uploading, deleted){
            if(angular.isFunction(vm.onChangeStatus)){
                vm.onChangeStatus(
                    {
                        isUploading: uploading,
                        isDeleted: deleted
                    }
                );
            }
        }

        function getUploadInfo(){
            vm.waitingToStartUploading = true;

            return  [
                {MemberId: vm.memberId},
                {DocumentType: vm.documentType}
            ];
        }

        $scope.$on(config.events.uploadNewFile, function(ev, data) {
            //this event gets triggered for every file
            if(vm.waitingToStartUploading) {
                vm.waitingToStartUploading = false;

                vm.currentFile = data;
                vm.documentExists = true;
                triggerChangeStatus(true, false);
            }
        });

        $scope.$on(config.events.uploadFinishedItem, function(ev, data) {
            vm.documentExists = true;
            ux.refreshMemberImage();
            //because avatar image may cut to square and save, can't load original upload image as preview file
            if (vm.documentType === 'avatar') {
                vm.previewFile = getPreviewFileUrl();
            }else {
                showPreview();
            }


        });

        function deleteImage() {
            if (vm.memberId && vm.documentType) {
                var msg = 'Are you sure you want to delete this ' + vm.title + ' image?';
                ux.modal.confirm(msg,
                    function (confirmed) {
                        if (confirmed) {
                            var dtoRequest = {MemberId: vm.memberId, DocumentType: vm.documentType};

                            server.post('/api/storage/member/documents/delete', dtoRequest)
                                .success(function (res) {
                                    ux.alert.success(vm.title + ' image deleted.');

                                    vm.previewFile = null;

                                    triggerChangeStatus(false, true);

                                    releasePreviewResource();

                                    vm.documentExists = false;

                                    ux.refreshMemberImage();
                                });
                        }
                    });
            }
        }

        function releasePreviewResource(){
            // release the resource
            if(vm.previewFile && vm.previewFile.src){
                window.URL.revokeObjectURL(vm.previewFile.src);
                vm.previewFile.src = '';
            }
        }

        function showPreview() {
            releasePreviewResource();

            var reader = new FileReader();

            var fileItem = vm.uploader.queue.lastElement();
            var file = fileItem._file;
            reader.readAsDataURL(file);

            reader.onloadend = function (e) {
                if ( /.*jpg$/.test(file.type) || /.*jpeg/.test(file.type) || /.*png$/.test(file.type) ) {
                    vm.previewFile = e.target.result;
                }

                $timeout(function () {
                    $scope.$apply();
                });
            };
        }
    }
})();