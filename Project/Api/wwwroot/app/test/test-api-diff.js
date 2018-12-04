(function () {
    angular.module("app")
        .controller("apidiffController", ['$rootScope', '$scope','$timeout', '$filter','$http', '$window', 'mtkAlert', '$exceptionHandler', 'ObjectDiff',  'server',
            function ($rootScope, $scope, $timeout, $filter, $http, $window,mtkAlert, $exceptionHandler, ObjectDiff, server) {
            var vm = this;

            vm.errors = [];
            vm.warnings = [];
            vm.infos =[];
            vm.unmatchDiffs = [];
            vm.show = false;

            // vm.path1 = 'https://raw.githubusercontent.com/swagger-api/swagger-spec/master/examples/v2.0/json/petstore-minimal.json';
            // vm.path2 = 'https://raw.githubusercontent.com/swagger-api/swagger-spec/master/examples/v2.0/json/petstore-expanded.json';
            // vm.path1 = 'http://127.0.0.1:8080/stage-fm.json';
            // vm.path2 = 'http://127.0.0.1:8080/live-fm.json';
            //vm.path1 = 'http://127.0.0.1:8080/metadata1.json';
            //vm.path2 = 'http://127.0.0.1:8080/metadata2.json';
            // vm.path1 = 'https://uat-app.propertyme.com/api/types/metadata.json';
            // vm.path2 = 'https://app.propertyme.com/api/types/metadata.json';
            vm.path1 = 'https://app.propertyme.com/api/types/metadata.json';
            vm.path2 = 'https://stage.propertyme.com/api/types/metadata.json';
            vm.getObjects = getObjects;
            vm.object1 = {};
            vm.object2 = {};
            vm.diffValue = null;
            vm.diffTypeValueChanges = null;
            vm.diffOperationValueChanges = null;
            vm.objectOneJsonView = null;
            vm.objectTwoJsonView = null;
            vm.object1Previews = [];
            vm.object2Previews = [];


            vm.object1TypeIndex = {};
            vm.object2TypeIndex = {};
            vm.object1TypeIndexResult = {};
            vm.object2TypeIndexResult = {};
            vm.object1OperationIndex = {};
            vm.object2OperationIndex = {};
            vm.object1OperationIndexResult = {};
            vm.object2OperationIndexResult = {};
            vm.object1Types = [];
            vm.object2Types = [];
            vm.object1TypeIndexResultView = null;
            vm.object2TypeIndexResultView = null;
            vm.object1OperationIndexResultView = null;
            vm.object2OperationIndexResultView = null;




            //Get the both old and new Json object by https.get  (the json file could be in local or internet)
            function getObjects(){
                if (vm.path1.length === 0 ||
                    vm.path2.length ===0)
                {
                    $rootScope.$emit('mtk.footerAlert', {type:'error', msg: 'Please enter the correct API path', title: 'Error'});
                }else
                {
                    $http.get(vm.path1)
                        .then(function(res){
                            vm.object1 = res.data;
                            $http.get(vm.path2)
                                .then(function(res){
                                    vm.object2 = res.data;
                                    //runFullObjectDiff();
                                    runJsonDiffPatch();
                                });
                        }).catch(function(data){
                        $rootScope.$emit('mtk.footerAlert', {type:'error', msg: data, title: 'Error'});

                    });
                }
            }


            //the update run Json Diff Patch method
            function runJsonDiffPatch(){
                    var jsondiffpatch = $window.jsondiffpatch;
                    var jsonDiff = jsondiffpatch.create({
                        objectHash: function(obj) {
                            if (typeof obj._id !== 'undefined') {
                                return obj._id;
                            }
                            if (typeof obj.id !== 'undefined') {
                                return obj._id;
                            }
                            if (typeof obj.name !== 'undefined') {
                                return obj.name;
                            }
                            return JSON.stringify(obj);
                        },
                        arrays: {
                            detectMove: true,
                            includeValueOnMove: false
                        },
                        textDiff: {
                            minLength: 60
                        }
                    });


                    vm.object1TypeIndex = buildObjectTypeIndex(vm.object1);
                    vm.object2TypeIndex = buildObjectTypeIndex(vm.object2);

                    cleanIndexDuplicateType();
                    vm.diffTypeValueChanges = jsondiffpatch.diff(vm.object1TypeIndexResult, vm.object2TypeIndexResult);


                    vm.object1OperationIndex = buildObjectOperationIndex(vm.object1);
                    vm.object2OperationIndex = buildObjectOperationIndex(vm.object2);

                    cleanIndexDuplicateOperation();
                    vm.object1OperationIndexResultView = ObjectDiff.objToJsonView(vm.object1OperationIndexResult);
                    vm.object2OperationIndexResultView = ObjectDiff.objToJsonView(vm.object2OperationIndexResult);
                    reMatchOperationIndex();
                    updateMatchOperationIndex();
                    vm.diffOperationValueChanges = jsondiffpatch.diff(vm.object1OperationIndexResult, vm.object2OperationIndexResult);


                    vm.diffTypeValueChangesView = jsondiffpatch.formatters.html.format(vm.diffTypeValueChanges);

                    vm.diffOperationValueChangesView = jsondiffpatch.formatters.html.format(vm.diffOperationValueChanges);

                    vm.show = true;

                }


            //the old Angular Object diff method
            function runFullObjectDiff(){
                vm.object1TypeIndex = buildObjectTypeIndex(vm.object1);
                vm.object2TypeIndex = buildObjectTypeIndex(vm.object2);

                cleanIndexDuplicateType();
                vm.object1TypeIndexResultView = ObjectDiff.objToJsonView(vm.object1TypeIndexResult);
                vm.object2TypeIndexResultView = ObjectDiff.objToJsonView(vm.object2TypeIndexResult);
                var typeDiff = ObjectDiff.diff(vm.object1TypeIndexResult, vm.object2TypeIndexResult);
                vm.diffTypeValueChanges = ObjectDiff.toJsonDiffView(typeDiff);


                document.getElementById("oldtypecontent").innerHTML = JSON.stringify(vm.object1TypeIndexResult, undefined, 2);
                document.getElementById("newtypecontent").innerHTML = JSON.stringify(vm.object2TypeIndexResult, undefined, 2);



                vm.object1OperationIndex = buildObjectOperationIndex(vm.object1);
                vm.object2OperationIndex = buildObjectOperationIndex(vm.object2);

                cleanIndexDuplicateOperation();
                vm.object1OperationIndexResultView = ObjectDiff.objToJsonView(vm.object1OperationIndexResult);
                vm.object2OperationIndexResultView = ObjectDiff.objToJsonView(vm.object2OperationIndexResult);
                reMatchOperationIndex();
                updateMatchOperationIndex();
                var operationsDiff = ObjectDiff.diff(vm.object1OperationIndexResult, vm.object2OperationIndexResult);
                vm.diffOperationValueChanges = ObjectDiff.toJsonDiffView(operationsDiff);

                vm.show = true;
            }

            //retrive the type node from webapi json file and build index
            function buildObjectTypeIndex (object){
                if(!object)
                {
                    return {};
                }

                var retObject = {baseUrl:'', types:[]};

                if (object.Config){
                    retObject.baseUrl = object.Config.BaseUrl;
                }

                if (object.Types){
                    var types = [];

                    angular.forEach(object.Types, function(type, index){
                       var newType = {
                           name: type.Name
                       };

                        types.push(newType);

                    });

                    retObject.types = $filter('orderBy')(types, 'name');
                }

                return retObject;
            }

            //remove the duplicate type objects
            function cleanIndexDuplicateType (){
                var types1 = vm.object1TypeIndex.types.filter(function(val){

                    return !vm.object2TypeIndex.types.some(function(val2){
                        return val2.name === val.name;
                    });

                });

                var types2 = vm.object2TypeIndex.types.filter(function(val){
                   return !vm.object1TypeIndex.types.some(function(val2){
                        return val2.name === val.name;
                    });
                });

                vm.object1TypeIndexResult = {
                        baseUrl: vm.object1TypeIndex.baseUrl,
                        types: $filter('orderBy')(types1, 'name')
                };

                vm.object2TypeIndexResult = {
                    baseUrl: vm.object2TypeIndex.baseUrl,
                    types: $filter('orderBy')(types2, 'name')
                };

            }

            //retrive the object node from webapi json file and build index
            function buildObjectOperationIndex (object){
                if(!object)
                {
                    return {};
                }

                var retObject = {baseUrl:'', operations:[]};

                if (object.Config){
                    retObject.baseUrl = object.Config.BaseUrl;
                }

                if (object.Operations){
                    var operations = [];

                    angular.forEach(object.Operations, function(operation, index){
                        var newOperation = {
                            namespace: operation.Request.Namespace,
                            routes: operation.Request.Routes && operation.Request.Routes.length > 0 ? buildRoutePaths : null,
                            actions: operation.Actions && operation.Actions.length > 0 ? operation.Actions[0] : null,
                            request: operation.Request ? operation.Request.Name : null,
                            requestProperties: createRequestProperties(operation.Request),
                            response: operation.Response ? operation.Response.Name : null
                        };

                        operations.push(newOperation);

                    });

                    retObject.operations = $filter('orderBy')(operations, 'request');
                }

                return retObject;
            }

            function buildRoutePaths(routes) {
                var routePaths = [];
                angular.forEach(routes, function(route){
                   if (route.Path) {
                       routePaths.push(route.Path);
                   }
                });

                return $filter('orderBy')(routePaths);
            }

            //internal method to create simple request rroperties to Json format by request object
            function createRequestProperties(request){
                if (!request || !request.Properties || request.Properties.length === 0)
                    return [];

                var newProperties = [];

                angular.forEach(request.Properties, function(property, index){
                    var newProperty = {
                        name: property.Name,
                        type: property.Type
                    };

                    newProperties.push(newProperty);
                });

                return $filter('orderBy')(newProperties, 'name');
            }

            //remove the duplicate operation objects
            function cleanIndexDuplicateOperation (){
                var operations1 = vm.object1OperationIndex.operations.filter(function(val){
                    return !vm.object2OperationIndex.operations.some(
                        function(val2) {
                            return val2.namespace === val.namespace &&
                                JSON.stringify(val2.routes) === JSON.stringify(val.routes) &&
                                val2.actions === val.actions &&
                                val2.request === val.request &&
                                JSON.stringify(val2.requestProperties) === JSON.stringify(val.requestProperties) &&
                                val2.response === val.response;
                        });
                });

                var operations2 = vm.object2OperationIndex.operations.filter(function(val){
                    return !vm.object1OperationIndex.operations.some(
                        function(val2) {
                            return val2.namespace === val.namespace &&
                                JSON.stringify(val2.routes) === JSON.stringify(val.routes) &&
                                val2.actions === val.actions &&
                                val2.request === val.request &&
                                JSON.stringify(val2.requestProperties) === JSON.stringify(val.requestProperties) &&
                                val2.response === val.response;
                        });
                });

                vm.object1OperationIndexResult = {
                    baseUrl: vm.object1OperationIndex.baseUrl,
                    operations: $filter('orderBy')(operations1, 'request')
                };

                vm.object2OperationIndexResult = {
                    baseUrl: vm.object2OperationIndex.baseUrl,
                    operations: $filter('orderBy')(operations2, 'request')
                };

            }

            //rematch both old/new operation index, insert the empty object to each
            function reMatchOperationIndex(){


                var matchedOperations1 =JSON.parse(JSON.stringify(vm.object1OperationIndexResult.operations))  ;
                var matchedOperations2 = JSON.parse(JSON.stringify(vm.object2OperationIndexResult.operations));

                angular.forEach(vm.object1OperationIndexResult.operations, function(op){
                   var exists = vm.object2OperationIndexResult.operations.some(function(op2){
                       return op.request === op2.request;
                   });

                   if (!exists){
                       var emptyOp = {

                           request: op.request + '(no found in new)'
                       };

                       matchedOperations2.push(emptyOp);
                   }

                });


                angular.forEach(vm.object2OperationIndexResult.operations, function(op){
                    var exists = vm.object1OperationIndexResult.operations.some(function(op2){
                        return op.request === op2.request;
                    });

                    if (!exists){
                        var emptyOp = {
                            request: op.request + '(no found in old)'
                        };

                        matchedOperations1.push(emptyOp);
                    }
                });


                vm.object1OperationIndexResult.operations = $filter('orderBy')(matchedOperations1, 'request');
                vm.object2OperationIndexResult.operations = $filter('orderBy')(matchedOperations2, 'request');


            }

            //update the matched operation index,
            // insert flat "updated" in operation which with same request but different properties
            function updateMatchOperationIndex(){

                angular.forEach(vm.object1OperationIndexResult.operations, function(op){
                    var op2s = vm.object2OperationIndexResult.operations.find(function(operation){
                        return op.request === operation.request &&
                            JSON.stringify(op.requestProperties) != JSON.stringify(operation.requestProperties) ;
                    });

                    if (op2s && op2s.lenght > 0){
                        op.request += ' (updated)';

                        //update requestProperties
                        updateMatchOperationRequestProperties(op, op2s[0]);
                    }


                });

            }

            function updateMatchOperationRequestProperties(operation1, operation2){
                var matchedRequestProperties1 = JSON.parse(JSON.stringify(operation1.requestProperties));
                var matchedRequestProperties2 = JSON.parse(JSON.stringify(operation2.requestProperties));

                angular.forEach(operation1.requestProperties, function(pro){
                   var exists = operation2.requestProperties.some(function (pro2){
                      return pro.name === pro2.name;
                   });

                   if (!exists){
                       var emptyProperty = {
                           name: pro.name + ' (no found in new)',
                           type: pro.type
                       };

                       matchedRequestProperties2.push(emptyProperty);
                   }
                });

                angular.forEach(operation2.requestProperties, function(pro){
                    var exists = operation1.requestProperties.some(function (pro2){
                        return pro.name === pro2.name;
                    });

                    if (!exists){
                        var emptyProperty = {
                            name: pro.name + ' (no found in old)',
                            type: pro.type
                        };

                        matchedRequestProperties1.push(emptyProperty);
                    }
                });

                operation1.requestProperties = $filter('orderBy')(matchedRequestProperties1, 'name');
                operation2.requestProperties = $filter('orderBy')(matchedRequestProperties2, 'name');
            }
        }
        ])
        .directive('scrollTo', function ($location, $anchorScroll) {
            return function(scope, element, attrs) {

                element.bind('click', function(event) {
                    event.stopPropagation();
                    var off = scope.$on('$locationChangeStart', function(ev) {
                        off();
                        ev.preventDefault();
                    });
                    var location = attrs.scrollTo;
                    $location.hash(location);
                    $anchorScroll();
                });

            };
        });
})();