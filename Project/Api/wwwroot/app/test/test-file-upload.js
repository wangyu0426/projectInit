(function () {
	'use strict';
	var controllerId = 'testFileUpload';
	angular.module('app').controller(controllerId, ['$scope', '$timeout', '$sce', 'server', viewmodel]);

	function viewmodel ($scope, $timeout, $sce, server) {

		//see http://nervgh.github.io/pages/angular-file-upload/examples/simple/
		var vm = this;
		vm.photoPreviews = [];
		vm.pdfPreviews = [];

		vm.fileTypes = {

		};

		vm.onFileSelect = uploadFiles;

		//var uploader =  new FileUploader({
		//	url: '/api/test/upload'
		//});

		// Strict Contextual Escaping (SCE) is a mode in which AngularJS requires bindings in certain contexts to result in a value that is marked as safe to use for that context.
		vm.trustSrc = function(src) {
			return $sce.trustAsResourceUrl(src);
		};

		var uploader = server.uploader;

		function loadPreviewItems() {
			vm.previewPhotos = [];
			vm.previewPdfs = [];

			uploader.queue.forEach(function (fileItem, i) {

				var reader = new FileReader();

				var file = fileItem._file;
				reader.readAsDataURL(file);

				reader.onloadend = function () {

					if (/.*[png|jpeg]$/.test(file.type)) {
						vm.previewPhotos.push(reader.result);
					} else if (/.*pdf$/.test(file.type)) {
						vm.previewPdfs.push(reader.result);
					}

					$timeout(function () {
						$scope.$apply();
					});
				};
			});

		}

		// FILTERS
		uploader.filters.push({
			name: 'customFilter',
			fn: function(item /*{File|FileLikeObject}*/, options) {
				return this.queue.length < 10;
			}
		});

		// CALLBACKS

		uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
			console.info('onWhenAddingFileFailed', item, filter, options);
		};
		uploader.onAfterAddingFile = function(fileItem) {
			//var t = fileItem.file.type
			//vm.fileTypes[t]

			loadPreviewItems();

			console.info('onAfterAddingFile', fileItem);
		};
		uploader.onAfterAddingAll = function(addedFileItems) {
			console.info('onAfterAddingAll', addedFileItems);
		};
		uploader.onBeforeUploadItem = function(item) {
			console.info('onBeforeUploadItem', item);
		};
		uploader.onProgressItem = function(fileItem, progress) {
			console.info('onProgressItem', fileItem, progress);
		};
		uploader.onProgressAll = function(progress) {
			console.info('onProgressAll', progress);
		};
		uploader.onSuccessItem = function(fileItem, response, status, headers) {
			console.info('onSuccessItem', fileItem, response, status, headers);
		};
		uploader.onErrorItem = function(fileItem, response, status, headers) {
			console.info('onErrorItem', fileItem, response, status, headers);
		};
		uploader.onCancelItem = function(fileItem, response, status, headers) {
			console.info('onCancelItem', fileItem, response, status, headers);
		};
		uploader.onCompleteItem = function(fileItem, response, status, headers) {
			console.info('onCompleteItem', fileItem, response, status, headers);
		};
		uploader.onCompleteAll = function() {
			console.info('onCompleteAll');
		};

		console.info('uploader', uploader);

		vm.uploader = uploader;

		function uploadFiles(files) {
			console.log('upload');
			console.log(files);

			var dto = {
				EntityType: "testtype"
			};

			// For some reason must be nested object
			uploader.formData = {
				obj: dto
			};

		    uploader.addToQueue(files);
		}
	}
})();
