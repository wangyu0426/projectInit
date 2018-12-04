(function () {
    'use strict';

    var controllerId = 'testGridController';
    angular.module('app').controller(controllerId, ['$scope', '$timeout', 'gridBuilder', '$http', lots]);

    function lots($scope, $timeout, gridBuilder) {

        var vm = this;
        vm.title = 'mtk-grid ';

        vm.selectedIds = [];

        vm.tableAll = new gridBuilder.TableDef("/api/entity/lots/all")
            .linkCol("Reference", null, "#/property/card/[Id]")
            .linkCol("Owner", "OwnerContactReference", "#/contact/card/[OwnerContactId]")
            .linkCol("Tenant", "TenantContactReference", "#/contact/card/[TenantContactId]")
            .custom({
                mData: "DaysInArrears",
                sTitle: "Arrears",
                sWidth: "5em",
                sClass: "col-amount",
                mRender: function (value, action, obj) {
                    if (value > 0) {
                        return "<span class='badge badge-important arrearsBadge'  data-rel='tooltip' data-original-title='In arrears by " + value + " day" + (value !== 1 ? "s" : "") + "'><b>&#45;</b>" + value + "</span>";
                    } else {
                        return "<span class='badge badge-success arrearsBadge' data-rel='tooltip'  data-original-title='Rent in advance by " + (-value) + " day" + (value !== 1 ? "s" : "") + "'><b>&#43;</b>" + (-value) + "</span>";
                    }
                }
            })
            .serverSide();

        vm.tableDetails = new gridBuilder.TableDef("/api/entity/lots/all")
            .linkCol("Reference", null, "#/property/card/[Id]")
            .linkCol("Owner", "OwnerContactReference", "#/contact/card/[OwnerContactId]")
            .linkCol("Tenant", "TenantContactReference", "#/contact/card/[TenantContactId]")
            .numberCol("Beds", "Bedrooms")
            .numberCol("Cars", "CarSpaces")
            .numberCol("Baths", "Bathrooms")
            .textCol("Period", "RentPeriod")
            .amountCol("Rent", "RentAmount")
            .serverSide();

        vm.tableArrears = new gridBuilder.TableDef("/api/entity/lots/arrears")
            .linkCol("Reference", null, "#/property/card/[Id]")
            .linkCol("Tenant", "TenantContactReference", "#/contact/card/[TenantContactId]")
            .dateCol("Paid To", "PaidTo")
            .amountCol("Part Paid", "PartPaid")
            .amountCol("Rent", "RentArrears")
            .amountCol("Invoice", "InvoiceArrears")
            .amountCol("Bond", "BondArrears")
            .amountCol("Total", "TotalArrears")
            .sort(3, "desc")   //Note we sort in DESC order because the actual values are Arrears are > 0 and aheads are < 0
            .serverSide();

        vm.tableVacancies = new gridBuilder.TableDef("/api/entity/lots/vacant")
            .linkCol("Reference", null, "#/property/card/[Id]")
            .linkCol("Owner", "OwnerContactReference", "#/contact/card/[OwnerContactId]")
            .textCol("Type", "PropertyType")
            .numberCol("Beds", "Bedrooms")
            .numberCol("Cars", "CarSpaces")
            .numberCol("Baths", "Bathrooms")
            .amountCol("Rent", "RentAmount")
            .textCol("Period", "RentPeriod")
            .dateCol("Vacating", "TenancyEnd")
            .sort(9, "asc")
            .serverSide();

        vm.tableRenewals = new gridBuilder.TableDef("/api/entity/lots/renewals")
            .linkCol("Reference", null, "#/property/card/[Id]")
            .linkCol("Owner", "OwnerContactReference", "#/contact/card/[OwnerContactId]")
            .linkCol("Tenant", "TenantContactReference", "#/contact/card/[TenantContactId]")
            .dateCol("Tenancy Start", "TenancyStart")
            .dateCol("Agreement Start", "AgreementStart")
            .dateCol("Agreement End", "AgreementEnd")
            .sort(6, "asc")
            .serverSide();

        var myEntityName = {
            name: 'Property',
            pluralName: "Properties"
        };
        vm.gridTabs = [
            {tableDef: vm.tableAll, title: "All", entityName: myEntityName},
            {tableDef: vm.tableDetails, title: "Details", entityName: myEntityName},
            {tableDef: vm.tableArrears, title: "Arrears", entityName: myEntityName},
            {tableDef: vm.tableVacancies, title: "Vacancies", entityName: myEntityName},
            {tableDef: vm.tableRenewals, title: "Renewals", entityName: myEntityName}
        ];
    }
})();
