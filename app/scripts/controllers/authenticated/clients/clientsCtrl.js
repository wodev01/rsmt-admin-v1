'use strict';
app.controller('clientsCtrl',
    function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, clientService) {

        $scope.rightView = 'views/authenticated/clients/newClient.html';
        $scope.rightEditView = 'views/authenticated/clients/manageClient.html';

        $scope.isTabsLoad = false;
        $scope.searchFilter = '';
        $scope.clientsData = [];
        $scope.isPagingCursor = $scope.isMoreClients = false;
        $scope.selectedClientTab = 0;

        // Swapping view open function.
        $scope.fnOpenNewClientSwap = function () {
            $timeout(function () {
                $scope.rightView = '';
                $scope.$apply();
                $scope.rightView = 'views/authenticated/clients/newClient.html';
                $scope.$apply();
                $mdSidenav('newClientView').open().then(function () {
                });
            });
        };

        // Create new client.
        $scope.fnNewClientView = function () {
            $scope.isClientEditable = false;
            $scope.fnOpenNewClientSwap();
        };

        // Close new client swap-view.
        $scope.fnCloseNewClientSwap = function () {
            $mdSidenav('newClientView').close().then(function () {
            });
        };

        /*--------------- Manage Client Swapping View ---------------*/
        // Swapping view open function.
        $scope.fnOpenClientManageSwap = function () {
            $timeout(function () {
                $scope.rightEditView = '';
                $scope.$apply();
                $scope.rightEditView = 'views/authenticated/clients/manageClient.html';
                $scope.$apply();
                $mdSidenav('manageClientSwap').open().then(function () {
                    $scope.isTabsLoad = true;
                });
            });
        };

        // Swapping view close function
        $scope.fnCloseClientManageSwap = function () {
            $mdSidenav('manageClientSwap').close().then(function () {
                $scope.isTabsLoad = false;
                clientService.setClientObj({});
            });
        };
        /*--------------- End Manage Client Swapping View ---------------*/

        // Retrieving data from server
        $scope.getPagedDataAsync = function (status, filter) {
            $scope.isMsgGridShow = $scope.isClientsData = false;

            var filterObj = {};
            filterObj.status = status;
            filterObj.filter = filter;

            clientService.filterClientsData(filterObj)
                .then(function (responseObj) {
                    if (responseObj.data.length !== 0) {
                        $scope.isMsgGridShow = false;
                        $scope.isClientsData = true;
                        $scope.clientsData = responseObj.data;
                    } else {
                        $scope.isClientsData = false;
                        $scope.isMsgGridShow = true;
                    }

                    if ($scope.isClientsData && !$scope.isMsgGridShow) {
                        $scope.isPagingCursor =
                            responseObj.headers['x-paging-cursor'] ? false : true;
                    }

                }, function (error) {
                    toastr.error('Failed retrieving clients data.', 'STATUS CODE: ' + error.status);
                });
        };

        // Subscription DD change event.
        $scope.fnChangeStatus = function (selectStatus) {
            $scope.getPagedDataAsync(selectStatus, $scope.searchFilter);
        };

        // Search filter change event.
        $scope.onSearchTextChanged = function (searchFilter) {
            $scope.getPagedDataAsync($scope.selectStatus, searchFilter);
        };

        // Resetting filter to its defaults.
        function resetFilters() {
            $scope.searchFilter = '';
            $scope.selectStatus = $scope.selectStatusOptions[0].value;
            $scope.getPagedDataAsync($scope.selectStatus, $scope.searchFilter);
        }

        // Create subscription status filter DD.
        $scope.fnCreateFilters = function () {
            $scope.selectStatusOptions = [
                {name: 'Any Status', value: ''},
                {name: 'Disabled', value: 'Disabled'},
                {name: 'Active', value: 'Active'},
                {name: 'Need Payment Details', value: 'NeedPaymentDetails'},
                {name: 'Active Verify Subscriptions', value: 'ActiveVerifySubscriptions'},
                {name: 'Unconfirmed', value: 'Unconfirmed'},
                {name: 'Payment Errors', value: 'PaymentErrors'}
            ];
            resetFilters();
        };

        /*--------------- Clients Grid Options ---------------*/
        $scope.clientAction = '<div layout="row">' +
            '<md-button aria-label="open" class="md-icon-button md-accent" data-ng-click="grid.appScope.fnClientEdit(row);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-eye"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Open</md-tooltip>' +
            '</md-button></div>';

        $scope.clientsGridOptions = {
            data: 'clientsData',
            rowHeight: 50,
            multiSelect: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableVerticalScrollbar: 0,
            columnDefs: [
                {
                    field: 'created',
                    displayName: 'Created Date',
                    cellFilter: 'date:\'MM/dd/yyyy h:mm a\'',
                    minWidth: 160,
                    enableHiding: false
                },
                {field: 'partner', displayName: 'Name', minWidth: 200, enableHiding: false},
                {field: 'contactName', displayName: 'Contact Name', minWidth: 150, enableHiding: false},
                {field: 'subscriptionStatus', displayName: 'Subscription Status', minWidth: 100, enableHiding: false},
                {
                    name: 'action',
                    displayName: '',
                    cellTemplate: $scope.clientAction,
                    width: 50,
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
        /*--------------- End clients Grid Options ---------------*/

        /*--------------- Clients grid actions ---------------*/
        $scope.fnClientEdit = function (row) {
            $scope.editClientName = row.entity.partner;
            clientService.setClientObj(row.entity);
            $scope.fnOpenClientManageSwap();
        };
        /*--------------- End clients grid actions ---------------*/

        // Grid listener for data change events.
        $rootScope.$on('RefreshClientsGrid', function () {
            resetFilters();
        });

        // Load more clients functionality.
        $scope.fnLoadMoreClients = function () {
            $scope.isMoreClients = true;
            clientService.fetchMoreClients()
                .then(function (responseObj) {
                    $scope.clientsData = $scope.clientsData.concat(responseObj.data);
                    $scope.isPagingCursor = responseObj.headers['x-paging-cursor'] ? false : true;
                    $scope.isMoreClients = false;

                }, function (error) {
                    toastr.error('Failed retrieving more clients data.', 'STATUS CODE: ' + error.status);
                });
        };

        // Initialization
        $scope.fnInitClients = function () {
            $scope.fnCreateFilters();
        };

        $rootScope.rightUserSwapView = 'views/authenticated/clients/clientUserManage.html';
        $rootScope.rightLocationSwapView = 'views/authenticated/clients/clientLocationManage.html';

    });
