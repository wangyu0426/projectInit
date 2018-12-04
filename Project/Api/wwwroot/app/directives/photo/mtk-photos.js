(function () {
	'use strict';
	var DIRECTIVE_ID = 'mtkPhotos';
	angular.module('app').directive(DIRECTIVE_ID, ['$rootScope','server', 'ux', 'config', 'photoViewerCommon', myDirective]);

	function myDirective($rootScope, server, ux, config, photoViewerCommon) {
		return {
			restrict: 'E',
			replace: true,
			templateUrl: '/app/directives/photo/mtk-photos.html',
			scope: {
				id: '=',
				type: '=',
				isEmpty: '=?',
                area: '=',
                emptyText:'@'
			},
			controller: ['$scope', photoController]
		};

        function photoController($scope){
            $scope.emptyText = $scope.emptyText || "Drag and drop photos here";
            //Used in the 'Agent' app
            var photoConfig = {
                getQueryUrl:  function (scope) {
                    var url = '/api/storage/documents/query?DocumentType=Photo&' + scope.type + 'Id=' + scope.id;
                    if (angular.isDefined(scope.area)) {
                        url += '&DocumentArea=' + scope.area;
                    }
                    return url;
                },
                getPhotoUrl: function () {
                    return '/api/storage/images/';
                },
                lightbox: {
                    deleteHelper: function (photoToDelete, callback) {
                        console.log('mtk-photo delete function');

                        server.post('/api/storage/documents/delete', {Ids: [photoToDelete.Id]}).success(function (response) {
                            ux.alert.success((photoToDelete.FileName || 'File ') + ' deleted.');
                            $rootScope.$broadcast(config.events.refreshData);
                            callback(response);
                        });
                    },
                    reorderHelper: function (reorderedIds, callback) {
                        var url = 'storage/documents/reorder';

                        var dtoRequest = {
                            OrderedDocumentstorageIds: reorderedIds
                        };

                        if ($scope.type === 'Lot') {
                            dtoRequest.LotId = $scope.id;
                        } else if ($scope.type === 'JobTask') {
                            dtoRequest.JobTaskId = $scope.id;
                        }

                        server.post(url, dtoRequest)
                            .success(function(response){
                                ux.alert.success('Photos re-ordered');
                                $rootScope.$broadcast(config.events.refreshData);
                                callback(response);
                            });

                        // Property images only version
                        //if($scope.id){
                        //    var url = 'entity/lots/' + $scope.id + '/images/reorder';
                        //    server.post(url, dtoRequest)
                        //        .success(function(response){
                        //            ux.alert.success('Photos re-ordered');
                        //            $rootScope.$broadcast(config.events.refreshData);
                        //            callback(response);
                        //        });
                        //}
                    }
                }
            };

            var myControllerFn = photoViewerCommon.createPhotoViewerController(photoConfig);

            var myController = myControllerFn($scope);

            return myController;

        }
	}

})();