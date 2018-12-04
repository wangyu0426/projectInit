(function () {
    'use strict';

    angular.module('app').controller('testMigrateTimestamps', ['$scope', 'server', 'ux', controller]);

    function controller($scope, server, ux) {
        var vm = this;
        vm.runMigrate = runMigrate;
        vm.nothingToUpdate = nothingToUpdate;
        vm.limit = 1000;
        vm.isRunning = false;
        vm.lotsMigrateDone = false;
        vm.isFinished = isFinished;
        vm.lotsMigrated = 0;
        vm.contactsMigrated = 0;
        vm.areasMigrated = 0;
        vm.inspectionReportsMigrated = 0;
        vm.inspectionsMigrated = 0;
        vm.jobtasksMigrated = 0;
        vm.ownershipsMigrated = 0;
        vm.saleAgreementsMigrated = 0;
        vm.tenanciesMigrated = 0;
        vm.tasksMigrated = 0;

        function runMigrate() {
            if (vm.isRunning) {
                ux.alert.warning('Migrate is already in progress');
            }
            vm.isRunning = true;
            if (vm.migrateLot) {
                migrateLots();
            }

            if (vm.migrateContact) {
                migrateContacts();
            }

            if (vm.migrateInspection) {
                migrateInspections();
            }

            if (vm.migrateJob) {
                migrateJobTasks();
            }

            if (vm.migrateOwnership) {
                migrateOwnerships();
            }

            if (vm.migrateSaleAgreement) {
                migrateSaleAgreements();
            }

            if (vm.migrateTenancy) {
                migrateTenancies();
            }

            if (vm.migrateTask) {
                migrateTasks();
            }
        }

        function migrateLots() {
            server
                .getQuietly('entity/lots/populate-timestamps?limit=' + vm.limit)
                .success(
                    function (response) {
                        vm.lotsMigrate = response;
                        $scope.$broadcast('lotsMigrateDone');
                    }
                );
        }

        $scope.$on('lotsMigrateDone', function() {
            vm.lotsMigrated += vm.lotsMigrate.Migrated;
            if (!nothingToUpdate(vm.lotsMigrate)) {
                migrateLots();
            }
            vm.isRunning = false;
        });

        function migrateContacts() {
            server
                .getQuietly('entity/contacts/populate-timestamps?limit=' + vm.limit)
                .success(
                    function (response) {
                        vm.contactsMigrate = response;
                        $scope.$broadcast('contactsMigrateDone');
                    }
                );
        }

        $scope.$on('contactsMigrateDone', function() {
            vm.contactsMigrated += vm.contactsMigrate.Migrated;
            if (!nothingToUpdate(vm.contactsMigrate)) {
                migrateContacts();
            }
            vm.isRunning = false;
        });

        function migrateInspectionReportAreas() {
            server
                .getQuietly('entity/inspection-report-areas/populate-timestamps?limit=' + vm.limit)
                .success(
                    function (response) {
                        vm.areasMigrate = response;
                        $scope.$broadcast('inspectionReportAreasMigrateDone');
                    }
                );
        }

        $scope.$on('inspectionReportAreasMigrateDone', function() {
            vm.areasMigrated += vm.areasMigrate.Migrated;
            if (!nothingToUpdate(vm.areasMigrate)) {
                migrateInspectionReportAreas();
            }
            vm.isRunning = false;
        });

        function migrateInspectionReports() {
            server
                .getQuietly('entity/inspection-reports/populate-timestamps?limit=' + vm.limit)
                .success(
                    function (response) {
                        vm.inspectionReportsMigrate = response;
                        $scope.$broadcast('inspectionReportsMigrateDone');
                    }
                );
        }

        $scope.$on('inspectionReportsMigrateDone', function() {
            vm.inspectionReportsMigrated += vm.inspectionReportsMigrate.Migrated;
            if (!nothingToUpdate(vm.inspectionReportsMigrate)) {
                migrateInspectionReports();
            } else {
                migrateInspectionReportAreas();
            }
            vm.isRunning = false;
        });

        function migrateInspections() {
            server
                .getQuietly('entity/inspections/populate-timestamps?limit=' + vm.limit)
                .success(
                    function (response) {
                        vm.inspectionsMigrate = response;
                        $scope.$broadcast('inspectionsMigrateDone');
                    }
                );
        }

        $scope.$on('inspectionsMigrateDone', function() {
            vm.inspectionsMigrated += vm.inspectionsMigrate.Migrated;
            if (!nothingToUpdate(vm.inspectionsMigrate)) {
                migrateInspections();
            } else {
                migrateInspectionReports();
            }
            vm.isRunning = false;
        });

        function migrateJobTasks() {
            server
                .getQuietly('entity/jobtasks/populate-timestamps?limit=' + vm.limit)
                .success(
                    function (response) {
                        vm.jobtasksMigrate = response;
                        $scope.$broadcast('jobtasksMigrateDone');
                    }
                );
        }

        $scope.$on('jobtasksMigrateDone', function() {
            vm.jobtasksMigrated += vm.jobtasksMigrate.Migrated;
            if (!nothingToUpdate(vm.jobtasksMigrate)) {
                migrateJobTasks();
            }
            vm.isRunning = false;
        });

        function migrateOwnerships() {
            server
                .getQuietly('entity/ownerships/populate-timestamps?limit=' + vm.limit)
                .success(
                    function (response) {
                        vm.ownershipsMigrate = response;
                        $scope.$broadcast('ownershipsMigrateDone');
                    }
                );
        }

        $scope.$on('ownershipsMigrateDone', function() {
            vm.ownershipsMigrated += vm.ownershipsMigrate.Migrated;
            if (!nothingToUpdate(vm.ownershipsMigrate)) {
                migrateOwnerships();
            }
            vm.isRunning = false;
        });

        function migrateSaleAgreements() {
            server
                .getQuietly('entity/sale-agreements/populate-timestamps?limit=' + vm.limit)
                .success(
                    function (response) {
                        vm.saleAgreementsMigrate = response;
                        $scope.$broadcast('saleAgreementsMigrateDone');
                    }
                );
        }

        $scope.$on('saleAgreementsMigrateDone', function() {
            vm.saleAgreementsMigrated += vm.saleAgreementsMigrate.Migrated;
            if (!nothingToUpdate(vm.saleAgreementsMigrate)) {
                migrateSaleAgreements();
            }
            vm.isRunning = false;
        });

        function migrateTasks() {
            server
                .getQuietly('entity/tasks/populate-timestamps?limit=' + vm.limit)
                .success(
                    function (response) {
                        vm.tasksMigrate = response;
                        $scope.$broadcast('tasksMigrateDone');
                    }
                );
        }

        $scope.$on('tasksMigrateDone', function() {
            vm.tasksMigrated += vm.tasksMigrate.Migrated;
            if (!nothingToUpdate(vm.tasksMigrate)) {
                migrateTasks();
            }else {
                vm.isRunning = false;
            }
        });

        function migrateTenancies() {
            server
                .getQuietly('entity/tenancies/populate-timestamps?limit=' + vm.limit)
                .success(
                    function (response) {
                        vm.tenanciesMigrate = response;
                        $scope.$broadcast('tenanciesMigrateDone');
                    }
                );
        }

        $scope.$on('tenanciesMigrateDone', function() {
            vm.tenanciesMigrated += vm.tenanciesMigrate.Migrated;
            if (!nothingToUpdate(vm.tenanciesMigrate)) {
                migrateTenancies();
            }
            vm.isRunning = false;
        });

        function isFinished() {
            return (!vm.migrateLot && nothingToUpdate(vm.lotsMigrate)) &&
                (!vm.migrateContact || nothingToUpdate(vm.contactsMigrate)) &&
                 (!vm.migrateInspection || nothingToUpdate(vm.areasMigrate)) &&
                 (!vm.migrateInspection || nothingToUpdate(vm.inspectionReportsMigrate)) &&
                 (!vm.migrateInspection || nothingToUpdate(vm.inspectionsMigrate)) &&
                 (!vm.migrateJob || nothingToUpdate(vm.jobtasksMigrate)) &&
                 (!vm.migrateOwnership || nothingToUpdate(vm.ownershipsMigrate)) &&
                 (!vm.migrateSaleAgreement || nothingToUpdate(vm.saleAgreementsMigrate)) &&
                (!vm.migrateTasks || nothingToUpdate(vm.tasksMigrate)) &&
                (!vm.migrateTenancy || nothingToUpdate(vm.tenanciesMigrated));
        }

        function nothingToUpdate(obj) {
            if (!obj) {
                return false;
            }
            return obj.ResponseStatus.Message.startsWith("Nothing to update");
        }
    }
})();