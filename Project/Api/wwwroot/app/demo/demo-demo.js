(function () {
    'use strict';

    var controllerId = 'demoController';
    angular.module('app').controller(controllerId, ['$routeParams', 'server', '$timeout', 'ux', 'modalDetail', '$scope', lots]);

    function lots($routeParams, server, $timeout, ux, modalDetail, $scope) {
        var apiPath = 'api/v1/usage' ;


        var vm = this;
        vm.pageTitle = 'Demo';
        //vm.selectedTab = $routeParams.tab;
        vm.selectedIds = [];
        vm.config = {}
        vm.isProcessingFaceData = false;
        vm.isProcessedFaceData = false;
        vm.isTrackedFace = false;
        vm.facesData = [];
        vm.numOfRequiredImgs = 10;
        vm.reset = reset;
        vm.seekFace = seekFace;
        vm.trainSvm = trainSvm;
        vm.create = create;

        $scope.onError = function (err) {};
        $scope.onStream = function (stream) {};
        $scope.onSuccess = function () {
            vm.htmlWebcam = document.querySelector('.webcam-live');
            var tracker = new tracking.ObjectTracker('face');  
            tracker.setInitialScale(5.0);
            tracker.setStepSize(2);
            tracker.setEdgesDensity(0.1);
            tracking.track('.webcam-live', tracker, { camera: true });
            tracker.on('track', onTracking);
            vm.trackerTask = tracking.track('.webcam-live', tracker, { camera: true });
            vm.trackerTask.run();
        };
        init();
        function init(){
            vm.canvas = document.getElementById('canvas');
            vm.context = canvas.getContext('2d');
        }

        function reset(){
            vm.isProcessingFaceData = false;
            vm.isProcessedFaceData = false;
            vm.isTrackedFace = false;
            vm.facesData = [];
            vm.visitor={};
        }

        function processDection(){
           
        }
        function onTracking(event){
            if (!vm.isProcessingFaceData) {
                vm.context.clearRect(0, 0, canvas.width, canvas.height);
                if (event.data != null && event.data.length > 0) {    
                    // has face data that meet the
                    vm.isTrackedFace = true;
                    // trigger callback function when gathering enough face data
                    event.data.forEach(processData);
                    $timeout(function(){                            
                        vm.context.clearRect(0, 0, canvas.width, canvas.height);
                    })                    
                }
            }
        }
        function seekFace(){
            if(vm.facesData.length>0){
                server.post("/api/v1/face/seek/", { Images: [vm.facesData[0].base64Image.replace("data:image/png;base64,", "")]})
                .success(function(response){
                    vm.visitor = response.result;
                })
            }
            else{
                
                ux.alert.warning("No picture captured, please capture at least one picture to continue.");
            }
        }
        function trainSvm(){
            server.post("/api/v1/face/train/")
        }

        function create(){
            if(vm.visitor.id){
                ux.alert.warning("Visitor Found, Please reset to create new");
            } else {
                var bodyData = [];
                vm.facesData.forEach(function(data){
                    bodyData.push(data.base64Image.replace("data:image/png;base64,", ""))    
                });
                server.post("/api/v1/face/save/", { images: bodyData})
                    .success(function(response){
                        if(!vm.visitor || !vm.visitor.id){
                            vm.visitor.id = response.visitorId
                            server.put("/api/v1/visitor/", { visitor:vm.visitor})
                            .success(function(){
                                ux.alert.info("Visitor successfully saved");
                            });
                        } 
                    });
            }
            
        }

        function processData(faceRect, index) {
            vm.context.strokeStyle = '#a64ceb';
            vm.context.strokeRect(faceRect.x, faceRect.y/2, faceRect.width, faceRect.height);
            vm.context.font = '11px Helvetica';
            vm.context.fillStyle = "#fff";
            vm.context.lineWidth = 3;
            vm.context.fillText("Face  " + (index + 1), faceRect.x + faceRect.width, faceRect.y/2);
    
            if (vm.facesData.length < vm.numOfRequiredImgs) {
                //var ratioMultiplicator = Math.round((640 * 480) / (320 * 244), 2);
                var canvasCaptureImg = document.createElement("canvas");
                canvasCaptureImg.width = vm.htmlWebcam.width;
                canvasCaptureImg.height = vm.htmlWebcam.height;
                var tempCanvas = canvasCaptureImg.getContext("2d");
                tempCanvas.drawImage(
                    vm.htmlWebcam,
                    0,0,
                    vm.htmlWebcam.width,
                    vm.htmlWebcam.height
                );
                var faceData = {
                    base64Image: canvasCaptureImg.toDataURL("image/png"),
                    trackingRect: {
                    offsetX: faceRect.x,
                    offsetY: faceRect.y,
                    width: faceRect.width,
                    height: faceRect.height
                    }
                }
                vm.facesData.push(faceData);    
                $scope.$apply();
                
            }
        }
    }
})();