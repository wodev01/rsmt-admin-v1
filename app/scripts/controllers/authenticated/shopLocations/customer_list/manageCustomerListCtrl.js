'use strict';
app.controller('manageCustomerListCtrl',
    function ($scope, $rootScope, $q, $filter, uiGridConstants,
              toastr, shopLocationsService, shopLocationsCustomerListService) {

        var filterOption = "v.odo,v.make,v.model,v.year,v.ro_count,v.ro_avg,v.spent,v.labor_spent,v.parts_spent," +
            "v.delivered_message,v.scheduled_message,v.any_message,c.customer_type,c.company_name,c.first_seen," +
            "c.last_seen,c.postal_code,c.ro_count,c.ro_avg,c.spent,c.labor_spent,c.parts_spent,c.vehicle_count," +
            "c.delivered_message,c.scheduled_message,c.any_message,ro.closed_day,ro.marketing_source," +
            "ro.techician_name,ro.message,ro.message.status,ro.message.delivery";

        var locId = shopLocationsService.getShopLocationsObj().id ? shopLocationsService.getShopLocationsObj().id : '';

        $scope.isProcessing = false;
        $scope.customerListObj = {};

        $scope.operatorDD = [
            {label: '=', value: 'EQUALS'},
            {label: '!=', value: 'NOT_EQUALS'},
            {label: '>', value: 'GREATER_THAN'},
            {label: '<', value: 'LESS_THAN'},
            {label: '>=', value: 'GREATER_THAN_OR_EQUALS'},
            {label: '<=', value: 'LESS_THAN_OR_EQUALS'},
            {label: 'IN', value: 'IN'}
        ];

        $scope.customerListFilterOptions = $scope.expressionArr = [];
        $scope.filterObj = {};
        $scope.filter = {};
        $scope.isPreviewData = false;
        $scope.customerPreviewData = [];

        $scope.breadcrumbArr = [{name: 'Customers List'}];
        $scope.customerIndex = 0;

        $scope.customerListFilterOptions = filterOption.split(',');
        $scope.customerListFilterValues = [];
        var filteredValuesFor = ['c.first_seen', 'c.last_seen', 'c.customer_type', 'v.make', 'v.model', 'v.year',
            'c.postal_code', 'ro.marketing_source', 'ro.techician_name', 'ro.message', 'ro.message.status', 'ro.message.delivery'];

        $scope.fnGetFilteredValues = function (searchText, filterName) {
            $scope.customerListFilterValues = [];
            if (filteredValuesFor.indexOf(filterName) == -1) return false;

            var deffered = $q.defer();
            shopLocationsCustomerListService.fetchFilterValues(locId, filterName)
                .then(function (res) {
                    $scope.customerListFilterValues = searchText ?
                        $filter('filter')(res, searchText) : res;
                    deffered.resolve($scope.customerListFilterValues);
                });
            return deffered.promise;
        };

        $scope.fnConvertExpressionToJson = function (filterObj) {
            filterObj.filters = [];
            angular.forEach($scope.expressionArr, function (obj) {
                var tempObj = {
                    'name': obj.name,
                    'operator': obj.operator,
                    'value': obj.operator == 'IN' ? '(' + obj.value + ')' : obj.value
                };
                filterObj.filters.push(tempObj);
            });

        };

        $scope.fnAddExpression = function (filter) {
            var temp = angular.copy(filter);

            $scope.expressionArr.push({
                'name': temp.name,
                'operator': temp.operator,
                'value': temp.searchText
            });

            $scope.filter = {};
            $scope.expressionForm.$setPristine();
        };

        $scope.fnDeleteRow = function (index) {
            $scope.expressionArr.splice(index, 1);
        };

        $scope.fnAddExprToCustomerList = function (filterObj) {
            $scope.fnConvertExpressionToJson(filterObj);

            $scope.isProcessing = true;

            if ($scope.filterObj.id) {
                shopLocationsCustomerListService.fnUpdateCustomerList(locId, filterObj)
                    .then(function (data) {
                        $rootScope.$broadcast('refreshCustomerListGrid');
                        $scope.isProcessing = false;
                        toastr.success('List updated successfully...');

                    }, function (error) {
                        if (error.status !== 401 && error.status !== 500) {
                            toastr.error('Failed updating list.');
                        }
                        $scope.isProcessing = false;
                    });

            } else {
                shopLocationsCustomerListService.fnAddToCustomerListPreview(locId, filterObj)
                    .then(function (data) {
                        $rootScope.$broadcast('refreshCustomerListGrid');
                        $scope.isProcessing = true;
                        toastr.success('List created.');
                    }, function (error) {
                        toastr.error('Failed creating list.', 'STATUS CODE: ' + error.status);
                        $scope.isProcessing = false;
                    });
            }
        };

        $scope.fnGetPreviewValues = function (filterObj) {
            $scope.fnConvertExpressionToJson(filterObj);

            $scope.isPreviewData = true;
            $scope.isPreviewDataMsg = false;

            $scope.fnOnSelectBreadcrumb(0);

            if ($scope.gridApi && filterObj.customers_only) {
                $scope.previewListGridOptions.columnDefs[3].visible = false;
                $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            } else if ($scope.gridApi) {
                $scope.previewListGridOptions.columnDefs[3].visible = true;
                $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            }

            shopLocationsCustomerListService.fnGetPreviewValues(locId, filterObj)
                .then(function (data) {
                    $scope.customerPreviewData = data;
                    $scope.isPreviewData = false;
                    $scope.isPreviewDataMsg = true;

                }, function (error) {
                    toastr.error('Failed retrieving preview values.', 'STATUS CODE: ' + error.status);
                    $scope.isPreviewData = false;
                    $scope.isPreviewDataMsg = true;
                });
        };

        $scope.customerPreviewAction = '<div class="ui-grid-cell-contents" layout="column" layout-fill>' +
            '<md-button aria-label="open" class="md-icon-button md-accent margin-left-0"' +
            '           ng-click="grid.appScope.fnViewCustomerDetails(row,$event);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-eye"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Open</md-tooltip>' +
            '</md-button></div>';


        $scope.initPreviewListGrid = function () {
            $scope.previewListGridOptions = {
                data: 'customerPreviewData',
                rowHeight: 50,
                multiSelect: false,
                enableRowSelection: true,
                enableRowHeaderSelection: false,
                enableVerticalScrollbar: 0,
                columnDefs: [
                    {
                        name: 'action',
                        displayName: '',
                        cellTemplate: $scope.customerPreviewAction,
                        width: 50,
                        enableSorting: false,
                        enableColumnMenu: false
                    },
                    {
                        name: 'full name',
                        displayName: 'Full Name',
                        cellTemplate: '<div layout="row" class="ui-grid-cell-contents">' +
                        '{{row.entity.first_name}}&nbsp;{{row.entity.last_name}}</div>',
                        minWidth: 200,
                        enableSorting: false,
                        enableColumnMenu: false
                    },
                    {
                        name: 'fist seen, last seen',
                        displayName: 'First Seen, Last Seen',
                        cellTemplate: '<div layout="row" class="ui-grid-cell-contents">' +
                        '{{row.entity.first_seen | date: \'MM/dd/yyyy\'}},&nbsp;' +
                        '{{row.entity.last_seen | date: \'MM/dd/yyyy\'}}</div>',
                        minWidth: 200,
                        enableSorting: false,
                        enableColumnMenu: false
                    },
                    {
                        name: 'year, make, model',
                        displayName: 'Vehicle Info',
                        cellTemplate: '<div layout="row" class="ui-grid-cell-contents">' +
                        '{{row.entity.matched_vehicle.year}}&nbsp;{{row.entity.matched_vehicle.make}}' +
                        '&nbsp;{{row.entity.matched_vehicle.model}}</div>',
                        minWidth: 200,
                        visible: typeof $scope.filterObj.customers_only == 'undefined' ?
                            true : $scope.filterObj.customers_only ? false : true,
                        enableSorting: false,
                        enableColumnMenu: false
                    }
                ],
                onRegisterApi: function (gridApi) {
                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        row.isSelected = true;
                    });

                    $scope.gridApi = gridApi;
                }
            };
        };

        $scope.fnOnSelectBreadcrumb = function (customerIndex) {
            $scope.customerIndex = customerIndex;
            $scope.breadcrumbArr.splice(customerIndex + 1, $scope.breadcrumbArr.length);

            if (customerIndex == 0) delete $scope.selectedRow;
        };

        $scope.fnViewCustomerDetails = function (row, ev) {
            $scope.intGridIndex = row.rowIndex;
            $scope.customerIndex = 1;
            $scope.customer = row.entity;
            $scope.breadcrumbArr.push({name: row.entity.first_name + ' ' + row.entity.last_name});
        };

        $scope.fnViewVehicleDetails = function (obj) {
            $scope.customerIndex = 2;
            $scope.vehicleObj = obj;
            $scope.breadcrumbArr.push({
                name: obj.year + ' ' + obj.make + ' ' + obj.model
            });
        };

        $scope.setClickedRow = function (index) {
            $scope.selectedRow = index;
        };

        $scope.fnInitCustomerList = function () {
            var customerListObj = angular.copy(shopLocationsCustomerListService.getCustomerListObj());

            if (Object.keys(customerListObj).length) {
                $scope.filterObj = customerListObj;
                $scope.expressionArr = customerListObj.filters;

                $scope.fnConvertExpressionToJson($scope.filterObj);
            }

            $scope.initPreviewListGrid();
        };

    });