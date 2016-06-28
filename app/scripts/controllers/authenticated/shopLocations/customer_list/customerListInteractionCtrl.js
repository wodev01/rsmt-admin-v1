'use strict';
app.controller('customerListInteractionCtrl',
    function ($scope, $timeout, $mdDialog, shopLocationsService, shopLocationsCustomerListService,
              customerListInteractionService, encodeParamService) {
        var locId =
            shopLocationsService.getShopLocationsObj().id ?
                shopLocationsService.getShopLocationsObj().id : '';

        var customerListId = shopLocationsCustomerListService.getCustomerListObj().id ?
            shopLocationsCustomerListService.getCustomerListObj().id : '';

        $scope._intRowHeight = 80;
        $scope.isMsgGridShow = $scope.isMoreCustomerListInteractions = false;

        $scope.isCustomerListInteractionData = false;
        $scope.customerListInteractionData = [];
        $scope.filter = {};

        $scope.customerId = '';

        $scope.isPagingData = true;
        $scope.isProcessing = true;
        $scope.dateRangeObj = {};

        $scope.pagingOptions = {
            pageSize: 20,
            currentPage: 1
        };

        $scope.filter = {
            'page_num': $scope.pagingOptions.currentPage,
            'page_size': $scope.pagingOptions.pageSize,
            'status': '',
            'deliveryType': ''
        };

        $scope.fnChangeFilter = function (filter) {
            $scope.filter.page_num = 1;
            $scope.isPagingData = true;
            $scope.getPagedDataAsync(filter);
        };

        function fnGetDateRange(dateRangeObj) {
            $scope.filter['from'] = dateRangeObj && dateRangeObj.start ? moment(dateRangeObj.start).format('YYYY-MM-DD') : '';
            $scope.filter['to'] = dateRangeObj && dateRangeObj.end ? moment(dateRangeObj.end).format('YYYY-MM-DD') : '';
            $scope.fnChangeFilter($scope.filter);
        }

        $scope.fnToggleDateRange = function (isProcessing) {
            $scope.isProcessing = isProcessing;
            if (isProcessing) {
                $timeout(function () {
                    $('.comiseo-daterangepicker-triggerbutton.ui-button').css('cursor', 'wait');
                    $('.comiseo-daterangepicker-triggerbutton.ui-button').attr('disabled', 'true');
                });
            } else {
                $('.comiseo-daterangepicker-triggerbutton.ui-button').css('cursor', '');
                $('.comiseo-daterangepicker-triggerbutton.ui-button').removeAttr('disabled');
            }
        };

        $scope.getPagedDataAsync = function (paramsObj) {
            $scope.isCustomerListInteractionData = $scope.isMsgGridShow = false;
            $scope.fnToggleDateRange(true);

            customerListInteractionService.fetchCustomerListInteraction(locId, customerListId, paramsObj)
                .then(function (data) {
                    if (data.length !== 0) {
                        $scope.isMsgGridShow = false;
                        $scope.isCustomerListInteractionData = true;
                        $scope.customerListInteractionData = data;

                        $scope.fnToggleDateRange(false);
                    } else {
                        $scope.isMsgGridShow = true;
                        $scope.isCustomerListInteractionData = false;

                        $scope.fnToggleDateRange(false);
                    }
                }, function (error) {
                    toastr.error('Failed retrieving more client-list interaction', 'STATUS CODE: ' + error.status);
                    $scope.fnToggleDateRange(false);
                });
        };

        $scope.nameTmpl = '<div class="ui-grid-cell-contents">'
            + '{{row.entity.customer.first_name}}&nbsp;{{ row.entity.customer.last_name}}</div>';

        $scope.infoTmpl = '<div class="overflow-auto" layout="row" layout-padding layout-fill>'
            + '<div class="padding-0">'
            + '     <div> Email: {{row.entity.customer.email_addresses | joinArray}} </div>'
            + '     <div> Phone: {{row.entity.customer.phone_numbers | tel | joinTelArray}} </div>'
            + '     <div> Address: {{row.entity.customer.address1}} </div>'
            + '</div></div>';

        $scope.customerListInteractionGridOptions = {
            data: 'customerListInteractionData',
            rowHeight: $scope._intRowHeight,
            multiSelect: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableVerticalScrollbar: 0,
            columnDefs: [
                {
                    field: 'due_date', displayName: 'Due Date',
                    cellFilter: 'date:\'MM/dd/yyyy h:mm a\'', minWidth: 160, enableHiding: false
                },
                {
                    name: 'customer name',
                    cellTemplate: $scope.nameTmpl,
                    displayName: 'Customer Name',
                    minWidth: 180,
                    enableHiding: false
                },
                {
                    name: 'customer info',
                    cellTemplate: $scope.infoTmpl,
                    displayName: 'Customer Info',
                    minWidth: 250,
                    enableHiding: false
                },
                {field: 'delivery_type', displayName: 'Delivery', minWidth: 80, enableHiding: false},
                {field: 'status', displayName: 'Status', minWidth: 100, enableHiding: false}
            ],
            onRegisterApi: function (gridApi) {
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    row.isSelected = true;
                });
            }
        };

        $scope.fnRefreshGrid = function (dateRangeObj) {
            fnGetDateRange(dateRangeObj);
        };

        $scope.fnDownloadClientListInteractionCSV = function (event) {
            var DialogController = ['$scope', '$window', 'locationId', 'customerListId', 'filterObj', 'pageSize',
                function ($scope, $window, locationId, customerListId, filterObj, pageSize) {
                    var filter = angular.copy(filterObj);
                    filter.page_num = 1;
                    filter.page_size = pageSize;

                    $scope.fnDownload = function () {
                        if (CarglyPartner) {
                            filter.oauth_token = CarglyPartner.accessToken;
                            $mdDialog.hide();

                            $scope.downloadLink = CarglyPartner.src + '/partners/api/crm/' +
                                locationId + '/customer-lists/' +
                                customerListId + '/interactions.csv' +
                                encodeParamService.getEncodedParams(filter);

                            $window.open($scope.downloadLink, '_blank');
                        }
                    };

                    $scope.fnHide = function () {
                        $mdDialog.hide();
                    };
                }];

            $mdDialog.show({
                locals: {locationId: locId, customerListId: customerListId, filterObj: $scope.filter, pageSize: $scope.customerListInteractionData.length},
                controller: DialogController,
                template: '<md-dialog aria-label="Download Client-list Interaction CSV Dialog">' +
                '  <md-dialog-content class="layout-padding">' +
                '      <div class="md-title"> Download Client List Interaction CSV </div>' +
                '      <p class="margin-0">This could take some time. Are you sure..?</p>' +
                '  </md-content>' +
                '  <md-dialog-actions>' +
                '       <md-button aria-label="download" ' +
                '           class="md-raised md-accent" ng-click="fnDownload();">Download</md-button>' +
                '       <md-button aria-label="cancel" class="md-warn md-raised" ' +
                '                                       ng-click="fnHide();">Cancel</md-button>' +
                '  </md-dialog-actions>' +
                '</md-dialog>',
                targetEvent: event
            }).then(function () {
                },
                function (err) {
                });
        };

        $scope.fnLoadMoreCustomerListInteractions = function () {
            if (!$scope.isMoreCustomerListInteractions) {
                $scope.filter.page_num += 1;
                $scope.isMoreCustomerListInteractions = true;
                $scope.isPagingData = true;

                $scope.fnToggleDateRange(true);

                customerListInteractionService.fetchCustomerListInteraction(locId, customerListId, $scope.filter)
                    .then(function (data) {
                        if (data.length != 0) {
                            $scope.customerListInteractionData = $scope.customerListInteractionData.concat(data);
                            $scope.isMoreCustomerListInteractions = false;
                            $scope.fnToggleDateRange(false);
                        } else {
                            $scope.isMoreCustomerListInteractions = $scope.isPagingData = false;
                            $scope.fnToggleDateRange(false);
                        }
                    }, function (error) {
                        toastr.error('Failed retrieving more client-list interaction', 'STATUS CODE: ' + error.status);
                        $scope.fnToggleDateRange(false);
                    });
            }
        };

        $scope.fnInitCustomerListInteraction = function () {
            $scope.getPagedDataAsync($scope.filter)
        };

    });