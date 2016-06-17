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

    $scope.clientFormsGridOptions = {
        data: 'clientFormsDetails',
        rowHeight: 50,
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
