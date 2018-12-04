(function () {
    'use strict';
    angular.module('app').directive('mtkBreadcrumbs', ['textFormat', myDirective]);

    function myDirective(textFormat) {
        return {
            restrict: 'E', replace: true, templateUrl: '/app/directives/common/mtk-breadcrumbs.html', scope: {
                data: '='
            }, link: function (scope, element, attr) {

                scope.$watch('data', function (newVal) {
                    if (newVal) {
                        scope.crumbs = [];

                        var lot = scope.data.lot, contact = scope.data.contact, folio = scope.data.folio;
                        var jobTask = scope.data.jobTask, inspectionTask = scope.data.inspectionTask, task = scope.data.task;

                        if (lot && lot.id) {
                            build('#/property/card/' + lot.id, lot.reference, 'icon-home');
                        }

                        if (contact && contact.id) {
                            build('#/contact/card/' + contact.id, contact.reference, 'icon-user');
                        }

                        if (folio && folio.id) {
                            if (folio.type && folio.type.toLowerCase() === 'tenant') {
                                build('#/folio/tenant/' + folio.id, folio.reference, 'icon-usd');
                            } else {
                                build('#/folio/transactions/' + folio.id, folio.reference, 'icon-usd');
                            }
                        }

                        if (jobTask && jobTask.id) {
                            build('#/jobtask/card/' + jobTask.id, jobTask.label, 'icon-wrench');
                        }
                        if (inspectionTask && inspectionTask.id) {
                            build('#/inspection/card/' + inspectionTask.id, inspectionTask.label, 'icon-vf-signup');
                        }
                        if (task && task.id) {
                            build('#/task/card/' + task.id, task.label, 'icon-list');
                        }
                    }

                });

                function build(href, label, icon) {
                    scope.crumbs.push({
                        href: href, label: label, icon: icon
                    });
                }

            }
        };
    }
})();