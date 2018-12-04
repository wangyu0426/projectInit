(function () {
    'use strict';
    var DIRECTIVE_ID = 'mtkActivityFeed';
    angular.module('app').directive(DIRECTIVE_ID, ['server', 'config', activityFeed]);

    function activityFeed(server, config) {

        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/app/directives/common/mtk-activity-feed.html',
            scope: {
                type: '@entityType',
                id: '=entityId',
                noSearch: '=noSearch',
                noComment: '=noComment'
            },
            link: function (scope, containerElement, attrs, ctrl) {
                containerElement.bind('scroll', function () {
                    console.log('in scroll');
                });
            },
            controller: ['$scope', 'textFormat', function ($scope, textFormat) {
                var apiPath = 'entity/eventlog';
                var init = true;
                $scope.limit = config.pageSize;
                $scope.activities = []; //array will be set when data is populated
                $scope.searchText = '';
                $scope.newCommentText = null;
                $scope.save = saveComment;
                $scope.cancel = cancelComment;
                $scope.userInitials = textFormat.initials(config.session.Name);
                $scope.newEntryKeyHandler = newEntryKeyHandler;
                $scope.increaseLimit = increaseLimit;
                $scope.$watch('id', refreshData);
                //$scope.$on(config.events.refreshData, refreshData);

                $scope.$on('affected:lot', eventRefresh);
                $scope.$on('affected:job', eventRefresh);
                $scope.$on('affected:tenancy', eventRefresh);
                $scope.$on('affected:ownership', eventRefresh);
                $scope.$on('affected:inspection', eventRefresh);

                function increaseLimit() {
                    $scope.limit += config.pageSize;
                }

                function eventRefresh(scope, eventLog) {
                    // MemberId is too much
                    // var ids = [ eventLog.LinkId, eventLog.LotId, eventLog.ContactId, eventLog.RegardingId, eventLog.MemberId ];
                    var ids = [ eventLog.LinkId, eventLog.LotId, eventLog.ContactId, eventLog.RegardingId ];

                    if (ids.contains($scope.id)) {
                        refresh();
                    }
                }

                function refreshData(n, o) {
                    // only refresh if the new value is different
                    if (n !== o) {
                        refresh();
                    }
                }

                // initialise
                refresh();

                function refresh() {
                    if ($scope.id) {

                        var url = apiPath;
                        if ($scope.type === 'contact' || $scope.type === 'lot' || $scope.type === 'member') {
                            url += '/' + $scope.type + '/' + $scope.id + '?Level=1';
                            if ($scope.type === 'member') {
                                url += '&Limit=1000';
                            }
                        } else {
                            url += '/' + $scope.id + '?Level=1';
                        }

                        server
                            .getQuietly(url)
                            .success(function (activities) {
                                activities.forEach(function (log) {
                                   setLink(log);
                                });
                                $scope.activities = activities;
                                init = false;
                            });
                    }
                }

                function saveComment() {
                    if ($scope.type && $scope.id && $scope.newCommentText) {
                        var comment = {
                            EntityId: $scope.id,
                            Type: $scope.type,
                            Text: $scope.newCommentText
                        };

                        server
                            .post(apiPath + '/comment', comment)
                            .success(function () {
                                $scope.newCommentText = null;
                                refresh();
                            });
                    }
                }

                function cancelComment() {
                    $scope.newCommentText = null;
                }

                function setLink(eventLog) {
                    if (eventLog.LinkType === 'Tenancy') {
                        eventLog.linkText = eventLog.ContactReference || 'Tenant';
                    } else if (eventLog.LinkType === 'Ownership') {
                        eventLog.linkText = eventLog.ContactReference || 'Owner';
                    } else if (eventLog.LinkType === 'Inspection') {
                        eventLog.linkText = 'Inspection';
                        eventLog.linkUrl = '#/inspection/card/' + eventLog.LinkId;

                    } else if (eventLog.LinkType === 'Task') {
                        eventLog.linkText = 'Task';
                        eventLog.linkUrl = '#/task/card/' + eventLog.LinkId;
                    } else if (eventLog.LinkType === 'Job') {
                        eventLog.linkText = eventLog.LinkReference || 'Job';
                        eventLog.linkUrl = '#/jobtask/card/' + eventLog.LinkId;
                    }
                }

                function newEntryKeyHandler(e) {
                    if (e.which === 13) { //ENTER
                        saveComment();
                    }
                    if (e.which === 27) { //ESCAPE
                        cancelComment();
                    }
                }
            }]
        };


    }

})();