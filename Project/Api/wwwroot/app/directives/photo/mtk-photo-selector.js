(function () {
	'use strict';
	var DIRECTIVE_ID = 'mtkPhotoSelector';
    angular.module( 'app' ).directive( DIRECTIVE_ID, [ '$rootScope', 'server', 'ux', 'config', 'photoViewerCommon','$timeout', myDirective]);

    function myDirective( $rootScope, server, ux, config, photoViewerCommon, $timeout) {
		return {
			restrict: 'E',
			replace: true,
			templateUrl: '/app/directives/photo/mtk-photo-selector.html',
			scope: {
				id: '=',
                type: '=',
                model:'=',
                isEmpty: '=?',
                hideAddBtn: '@',
                removable: '@',
                sortable:'@',
                area: '=',
                maxSelection:'@',
                emptyText:'@'
			},
			controller: ['$scope', photoController]
		};

        function photoController($scope){
            $scope.emptyText = $scope.emptyText || "Drag and drop photos here";
            $scope.remove = function ( index ) {
                $scope.model.splice( index, 1 );
            };
            
            $scope.sortableOptions = {
                animation: 150,
                handle: "li.sortable",  // Drag handle selector within list items
                draggable: "li.sortable",  // Specifies which items inside the element should be sortable
                ghostClass: "drag-placeholder",  // Class name for the drop placeholder
                onEnd: function () {
                    $timeout(updateMarkers, 10 );
                }
            };
            function updateMarkers() {
                
            }
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
                    maxSelection: function () {
                        return $scope.maxSelection ? $scope.maxSelection - $scope.model.length : Number.MAX_SAFE_INTEGER
                    },
                    selectHelper: function ( selected ) {
                        selected.forEach( function ( item ) {
                            var hasSelected = $scope.model.find( function ( s ) { return s.Id === item.Id } );
                            if ( !hasSelected && $scope.model.length < $scope.maxSelection  ) {
                                $scope.model.push(
                                    { Id: item.Id, type: item.FileType, area: 'lot' }
                                );
                            }
                        } );
                    }
                }
            };

            var myControllerFn = photoViewerCommon.createPhotoViewerController(photoConfig);

            var myController = myControllerFn($scope);

            return myController;

        }
	}

})();