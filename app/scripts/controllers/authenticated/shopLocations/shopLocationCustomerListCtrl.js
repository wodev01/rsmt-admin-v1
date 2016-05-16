'use strict';
app.controller('shopLocationCustomersListCtrl',
    function ($scope, $rootScope, $mdDialog, $mdSidenav, $window,
              toastr, shopLocationsService, shopLocationsCustomerListService) {

        $rootScope.manageCustomerListSwapView = 'views/authenticated/shopLocations/customer_list/manageCustomerList.html';

        var locId =
            shopLocationsService.getShopLocationsObj().id ?
                shopLocationsService.getShopLocationsObj().id : '';

        $scope.customerListData = [];
        $scope.isDataNotNull = $scope.isMsgShow = false;

        $scope.fnCreateNewList = function () {
            $rootScope.isNewExpression = true;
            $scope.fnOpenTemplateSwap();
        };

        /*---------- Open Customer List Swapping View----------*/
        $scope.fnOpenTemplateSwap = function () {
            setTimeout(function () {
                $rootScope.manageCustomerListSwapView = '';
                $scope.$apply();
                $rootScope.manageCustomerListSwapView = 'views/authenticated/shopLocations/customer_list/manageCustomerList.html';
                $scope.$apply();
                $mdSidenav('manageCustomerListView').open().then(function () {
                });
            });
        };

        /*---------- Close Customer List Swapping View ----------*/
        $rootScope.fnCloseManageCustomerListView = function () {
            shopLocationsCustomerListService.setCustomerListObj({});
            $mdSidenav('manageCustomerListView').close().then(function () {
            });
        };

        $scope.getPagedDataAsync = function () {
            $scope.isDataNotNull = $scope.isMsgShow = false;

            if (locId) {
                shopLocationsCustomerListService.getCustomerListData(locId)
                    .then(function (data) {
                        if (data.length !== 0) {
                            $scope.isDataNotNull = true;
                            $scope.isMsgShow = false;
                            $scope.customerListData = data;
                        } else {
                            $scope.isDataNotNull = false;
                            $scope.isMsgShow = true;
                        }

                    }, function (error) {
                        toastr.error('Failed retrieving customer list.', 'STATUS CODE: ' + error.status);
                    });
            }
        };

        $scope.$on('refreshCustomerListGrid', function () {
            $rootScope.fnCloseManageCustomerListView();
            $scope.getPagedDataAsync();
        });

        $scope.customerListAction = '<div layout="row">' +
            '<md-button aria-label="edit" class="md-icon-button md-accent" ' +
            '           ng-click="grid.appScope.fnEditCustomerList(row);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-pencil"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Edit</md-tooltip></md-button>' +
            '<md-button aria-label="download" class="md-icon-button md-accent" ' +
            '           ng-click="grid.appScope.fnExportPreviewListCSV(row, $event);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-download"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Export</md-tooltip></md-button>' +
            '<md-button aria-label="delete" class="md-icon-button md-warn" ' +
            '           ng-click="grid.appScope.fnRemoveCustomerList(row,$event);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-trash"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Delete</md-tooltip></md-button></div>';

        $scope.customerListGridOptions = {
            data: 'customerListData',
            rowHeight: 50,
            multiSelect: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableVerticalScrollbar: 0,
            columnDefs: [
                {field: 'name', displayName: 'Name', minWidth: 200, enableHiding: false},
                {
                    name: 'action',
                    displayName: '',
                    cellTemplate: $scope.customerListAction,
                    width: 150,
                    enableSorting: false,
                    enableColumnMenu: false
                }
            ]
        };

        $scope.fnEditCustomerList = function (row) {
            $rootScope.isNewExpression = false;
            shopLocationsCustomerListService.setCustomerListObj(row.entity);
            $scope.fnOpenTemplateSwap();
        };

        $scope.fnRemoveCustomerList = function (row, event) {
            var confirm = $mdDialog.confirm()
                .title('Delete')
                .content('Are you sure you want to remove?')
                .ariaLabel('Delete')
                .ok('Remove')
                .cancel('Cancel')
                .targetEvent(event);

            $mdDialog.show(confirm).then(function () {
                shopLocationsCustomerListService.fnRemoveCustomerList(locId, row.entity.id)
                    .then(function (res) {
                        toastr.success('Customer list deleted successfully...');
                        $scope.getPagedDataAsync();
                    }, function (error) {
                        toastr.error('Failed deleting customer list...', 'STATUS CODE: ' + error.status);
                    });
            }, function () {
            });
        };

        $scope.fnExportPreviewListCSV = function (row, event) {
            var downloadCSVDialogCtrl = ['$scope', function ($scope) {

                $scope.customerListId = row.entity.id;

                $scope.fnDownloadCSV = function () {
                    $scope.downloadLink = CarglyPartner.src + '/partners/api/crm/' +
                        locId + '/customer-lists/' + $scope.customerListId + '/results.csv?oauth_token='
                        + CarglyPartner.accessToken;

                    $window.open($scope.downloadLink, '_blank');

                    $scope.fnCloseDialog();
                };

                $scope.fnCloseDialog = function () {
                    $mdDialog.cancel();
                };
            }];

            $mdDialog.show({
                controller: downloadCSVDialogCtrl,
                scope: $scope,
                preserveScope: true,
                template: '<md-dialog aria-label="Download CSV Dialog">' +
                '   <md-content layout="column" layout-margin>' +
                '       <div class="md-headline"> Export CSV </div>' +
                '       <div layout-margin>This could take some time. Are you sure?</div>' +
                '       <md-dialog-actions class="padding-right-0">' +
                '           <md-button class="md-raised md-accent"' +
                '                       ng-click="fnDownloadCSV();">Download</md-button>' +
                '           <md-button class="md-raised md-warn margin-right-0"' +
                '                       ng-click="fnCloseDialog();">Cancel</md-button>' +
                '       </md-dialog-actions>' +
                '    </md-content>' +
                '</md-dialog>',
                targetEvent: event

            }).then(function (answer) {
            }, function (err) {
            });
        };

        $scope.fnInitShopLocCustomersList = function () {
            $scope.getPagedDataAsync();
        };

    });
