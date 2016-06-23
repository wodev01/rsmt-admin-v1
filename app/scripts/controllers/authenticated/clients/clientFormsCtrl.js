'use strict';
app.controller('clientFormsCtrl', function ($scope, clientService, clientFormService, $mdDialog){
    var activityType = 'WEB_FORM';

    $scope.isFormsDetails = false;
    $scope.clientFormsGridShowMsg = false;

    $scope.clientFormsDetails = [];
    $scope.client = clientService.getClientObj().id ? clientService.getClientObj() : {};
    var partnerId = $scope.client.id;

    $scope.getPagedDataAsync = function () {
        $scope.isFormsDetails = false;
        $scope.clientFormsGridShowMsg = false;

        clientFormService.fetchFormsDetails(partnerId, activityType)
            .then(function (data) {
                if (data.length !== 0) {
                    $scope.clientFormsGridShowMsg = false;
                    $scope.isFormsDetails = true;
                    $scope.clientFormsDetails = data;
                } else {
                    $scope.clientFormsGridShowMsg = true;
                    $scope.isFormsDetails = false;
                }
            }, function (error) {
                toastr.error('Failed retrieving client forms data.', 'STATUS CODE: ' + error.status);
            })
    };

    $scope.clientFormsAction = '<div class="ui-grid-cell-contents padding-left-0">' +
        '<md-button class="md-icon-button md-accent" aria-label="View" ' +
        '           ng-click="grid.appScope.fnOpenClientForm(row, $event);">' +
        '   <md-icon md-font-set="fa fa-lg fa-fw fa-external-link"></md-icon>' +
        '   <md-tooltip ng-if="$root.isMobile == null" md-direction="top">View</md-tooltip>' +
        '</md-button></div>';

    var customerTemplate = '<div style="padding: 15px 5px;line-height: 1.4em;overflow-y: auto; height: inherit;display: block;" ng-if="row.entity.session.customer" layout="column">' +
        '<div layout="row" flex>'+
                '<label style="font-weight: 500;">Name :&nbsp;</label>' +
                '<label flex>{{row.entity.session.customer.first_name}}&nbsp;{{row.entity.session.customer.last_name}}</label>' +
        '</div>'+
        '<div layout="row" flex>'+
            '<label style="font-weight: 500;">Phone :&nbsp;</label>' +
            '<label flex>{{row.entity.session.customer.phone_numbers | joinArray}}</label>' +
        '</div>'+
        '<div layout="row" flex>'+
            '<label style="font-weight: 500;">Email :&nbsp;</label>' +
            '<label flex>{{row.entity.session.customer.email_addresses | joinArray}}</label>' +
        '</div>'+
        '<div layout="row" flex>'+
            '<label style="font-weight: 500;">Vehicle :&nbsp;</label>' +
            '<label>{{row.entity.session.vehicle.year}}</label>'+
            '<label>&nbsp;{{row.entity.session.vehicle.make}}</label>'+
            '<label>&nbsp;{{row.entity.session.vehicle.model}}</label>' +
        '</div>'+
   '</div>' +
   '<div style="line-height: 3em;padding: 5px;" ng-if="!row.entity.session.customer">Anonymous</div>';

    $scope.clientFormsGridOptions = {
        data: 'clientFormsDetails',
        rowHeight: 100,
        multiSelect: false,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        enableVerticalScrollbar: 0,
        columnDefs: [
            {
                name: 'action',
                displayName: '',
                cellTemplate: $scope.clientFormsAction,
                width: 50,
                minWidth: 50,
                enableSorting: false,
                enableColumnMenu: false,
                enableColumnResize: false
            },
            {
                field: 'occurred', displayName: 'Date',
                cellFilter: 'date:\'MM/dd/yyyy h:mm a\'', width: 150, minWidth: 150, enableHiding: false
            },
            {
                field: 'form_name',
                displayName: 'Form Name',
                width: 150,
                minWidth: 150,
                enableHiding: false
            },
            {
                field: 'customer',
                displayName: 'Customer',
                cellTemplate : customerTemplate,
                width: 300,
                minWidth: 300,
                enableHiding: false
            },
            {
                field: 'source',
                cellTooltip: true,
                displayName: 'Source',
                minWidth: 700,
                enableHiding: false,
                enableSorting: false,
                enableColumnMenu: false
            }
        ],
        onRegisterApi: function (gridApi) {
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                row.isSelected = true;
            });
        }
    };

    $scope.fnOpenClientFormsModal = function (obj, ev) {
        $mdDialog.show({
            controller: 'clientFormsDataCtrl',
            templateUrl: 'views/authenticated/clients/modals/clientFormsData.html',
            targetEvent: ev,
            resolve: {
                clientFormDataObj: function () {
                    return obj;
                }
            }
        });
    };

    $scope.fnOpenClientForm = function (row, event) {
        $scope.fnOpenClientFormsModal(row.entity, event);
    };

    $scope.fnInitClientForms = function () {
        $scope.getPagedDataAsync();
    };
});
