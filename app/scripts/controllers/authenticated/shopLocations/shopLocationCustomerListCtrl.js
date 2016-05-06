'use strict';
app.controller('shopLocationCustomersListCtrl',
    function ($scope, $rootScope, $mdDialog, $mdSidenav, toastr, shopLocationsService, shopLocationsCustomerListService) {

        $rootScope.manageCustomerListSwapView = 'views/authenticated/shopLocations/manageCustomerList.html';

        var locId =
            shopLocationsService.getShopLocationsObj().id ?
                shopLocationsService.getShopLocationsObj().id : '';

        $scope.customerListData = [];
        $scope.isDataNotNull = $scope.isMsgShow = false;
        $scope.isChildForm = false;

        $scope.fnCreateNewList = function () {
            $rootScope.isCustomerListName = '';
            $scope.fnOpenTemplateSwap();
        };

        /*---------- Open Customer List Swapping View----------*/
        $scope.fnOpenTemplateSwap = function () {
            setTimeout(function () {
                $rootScope.manageCustomerListSwapView = '';
                $scope.$apply();
                $rootScope.manageCustomerListSwapView = 'views/authenticated/shopLocations/manageCustomerList.html';
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
            '<md-button class="md-icon-button md-accent" ng-click="grid.appScope.fnEditCustomerList(row);">' +
            '   <md-icon md-font-set="material-icons">edit</md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Edit</md-tooltip></md-button>' +
            '<md-button class="md-icon-button md-warn" ng-click="grid.appScope.fnRemoveCustomerList(row,$event);">' +
            '   <md-icon md-font-set="material-icons">delete</md-icon>' +
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
                    width: 100,
                    enableSorting: false,
                    enableColumnMenu: false
                }
            ]
        };

        $scope.fnEditCustomerList = function (row) {
            $rootScope.isCustomerListName = row.entity.name;
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

        $scope.fnInitShopLocCustomersList = function () {
            $scope.getPagedDataAsync();
        };

    });
