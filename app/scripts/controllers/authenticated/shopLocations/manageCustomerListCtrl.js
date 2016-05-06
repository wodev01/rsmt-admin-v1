'use strict';
app.controller('manageCustomerListCtrl',
    function ($scope, $rootScope, $q, $filter, toastr, shopLocationsService, shopLocationsCustomerListService) {

        var filterOption = "v.odo,v.make,v.model,v.year,v.ro_count,v.ro_avg,v.spent,v.labor_spent,v.parts_spent," +
            "v.delivered_message,v.scheduled_message,v.any_message,c.customer_type,c.company_name,c.first_seen," +
            "c.last_seen,c.postal_code,c.ro_count,c.ro_avg,c.spent,c.labor_spent,c.parts_spent,c.vehicle_count," +
            "c.delivered_message,c.scheduled_message,c.any_message,ro.closed_day,ro.marketing_source,ro.techician_name";

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
        $scope.filterObj = {}, $scope.filter = {};

        $scope.customerListFilterOptions = filterOption.split(',');
        $scope.customerListFilterValues = [];
        var filteredValuesFor = ['c.first_seen', 'c.last_seen', 'c.customer_type', 'v.make', 'v.model', 'v.year',
            'c.postal_code', 'ro.marketing_source', 'ro.techician_name'];

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

        $scope.fnConvertExpressionToJson = function (customerListName) {
            $scope.filterObj.name = customerListName;
            $scope.filterObj.customers_only = true;

            $scope.filterObj.filters = [];
            angular.forEach($scope.expressionArr, function (obj) {
                var tempObj = {
                    'name': obj.name,
                    'operator': obj.operator,
                    'value': obj.operator == 'IN' ? '(' + obj.value + ')' : obj.value
                };
                $scope.filterObj.filters.push(tempObj);
            });

        };

        $scope.fnAddExpression = function (filter) {
            console.log('called');
            var temp = angular.copy(filter);

            $scope.expressionArr.push({
                'name': temp.name,
                'operator': temp.operator,
                'value': temp.searchText
            });

            $scope.filter = {};
        };

        $scope.fnDeleteRow = function (customerListName, index) {
            $scope.expressionArr.splice(index, 1);
            $scope.fnConvertExpressionToJson(customerListName);
        };

        $scope.fnAddExprToCustomerList = function (customerListName) {
            $scope.fnConvertExpressionToJson(customerListName);

            $scope.isProcessing = true;

            if ($rootScope.isCustomerListName) {
                shopLocationsCustomerListService.fnUpdateCustomerList(locId, $scope.filterObj)
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
                shopLocationsCustomerListService.fnAddToCustomerListPreview(locId, $scope.filterObj)
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

        $scope.fnSetPreviewValues = function (customerListName) {
            $scope.fnConvertExpressionToJson(customerListName);

            $scope.isProcessing = true;
            shopLocationsCustomerListService.fnSetPreviewValues(locId, $scope.filterObj)
                .then(function (data) {
                    $rootScope.$broadcast('refreshCustomerListGrid');
                    $scope.isProcessing = true;
                }, function (error) {
                    toastr.error('Failed setting preview values.', 'STATUS CODE: ' + error.status);
                    $scope.isProcessing = false;
                });
        };

        $scope.fnInit = function () {
            var customerListObj = angular.copy(shopLocationsCustomerListService.getCustomerListObj());

            if (Object.keys(customerListObj).length) {
                $scope.filterObj.id = customerListObj.id;
                $scope.customerListName = customerListObj.name;

                $scope.expressionArr = customerListObj.filters;

                $scope.fnConvertExpressionToJson($scope.customerListName);
            }
        };

    });