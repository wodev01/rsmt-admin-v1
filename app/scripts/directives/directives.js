'use strict';

app.directive("passwordVerify", function () {
    return {
        require: "ngModel",
        scope: {
            passwordVerify: '='
        },
        link: function (scope, element, attrs, ctrl) {
            scope.$watch(function () {
                var combined;

                if (scope.passwordVerify || ctrl.$viewValue) {
                    combined = scope.passwordVerify + '_' + ctrl.$viewValue;
                }
                return combined;
            }, function (value) {
                if (value) {
                    ctrl.$parsers.unshift(function (viewValue) {
                        var origin = scope.passwordVerify;
                        if (origin !== viewValue) {
                            ctrl.$setValidity("passwordVerify", false);
                            return undefined;
                        } else {
                            ctrl.$setValidity("passwordVerify", true);
                            return viewValue;
                        }
                    });
                }
            });
        }
    };
});

app.directive('pageTitle', function ($rootScope, $timeout) {
    return {
        link: function (scope, element) {
            function fnCapitalize(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

            function fnSetPageTitle(state, params){
                // Default title
                var title = 'Rlo training';
                // Create your own title pattern
                if (state.data && state.data.pageTitle) {
                    if(state.data.pageTitle === 'Settings'){
                        title = fnCapitalize(params.settingsName) + ' ' + state.data.pageTitle + ' - ' + title;
                    }else{
                        title = state.data.pageTitle + ' - ' + title;
                    }
                }
                $timeout(function () {
                    element.text(title);
                });
            }

            var $stateChangeStart = $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
                fnSetPageTitle(toState, toParams);
            });
            $rootScope.$on('$destroy', $stateChangeStart);

            var $stateChangeError = $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams) {
                fnSetPageTitle(fromState, fromParams);
            });
            $rootScope.$on('$destroy', $stateChangeError);
        }
    };
});

app.directive('locationIndicator', function () {
    return {
        restrict: 'A',
        scope: {
            obj: '='
        },
        template: '<md-tooltip ng-if="$root.isMobile === null" md-direction="top">{{msg}}</md-tooltip>',
        link: function ($scope, $element) {
            $scope.msg = '';
            $element.addClass("checked_item_");
            $scope.$watch('obj', function (val) {
                val.lastConfig = typeof val.lastConfig === 'string' ? JSON.parse(val.lastConfig) : val.lastConfig;
                if (val.lastConfig !== null) {
                    var settings = val.lastConfig.settings;
                    //sync is enabled, and we've received at least one repair order in the last 3 days
                    if (settings['carglyconnect.syncenabled'] === 'yes') {
                        $element[0].className = $element[0].className.replace(/checked_item_(.*)/, 'checked_item_green');
                        if ($scope.msg !== undefined) {
                            $scope.msg = 'Synchronization is enabled';
                        }
                    }
                    else if (settings['carglyconnect.syncenabled'] === 'no') {
                        //sync is disabled. Prompt them to enable syncing
                        $element[0].className = $element[0].className.replace(/checked_item_(.*)/, 'checked_item_yellow');
                        if ($scope.msg !== undefined) {
                            $scope.msg = 'Synchronization is disabled.';
                        }
                    }
                    if (settings['carglyconnect.lastsync'] !== '') {
                        var lastSyncDate = new Date(settings['carglyconnect.lastsync']);
                        var currentDate = new Date(Date.now());
                        var timeDiff = Math.abs(currentDate.getTime() - lastSyncDate.getTime());
                        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        //This is the timestamp of the last time a sync operation sent us any data. If its been more than a few days since we've had anything sync'd something is wrong.
                        if (diffDays > 3) {
                            $element[0].className = $element[0].className.replace(/checked_item_(.*)/, 'checked_item_red');
                            if ($scope.msg !== undefined) {
                                $scope.msg = 'Not sync\'d something is wrong.';
                            }
                        }
                    }
                }
                else if (val.lastConfig === null) {
                    $element[0].className = $element[0].className.replace(/checked_item_(.*)/, 'checked_item_gray');
                    if ($scope.msg !== undefined) {
                        $scope.msg = 'Not sync\'d something is wrong.';
                    }
                }
            });
        }
    };
});

app.directive('multipleEmails', function () {
    var EMAIL_REGEXP = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

    var validateEmailArr = [];

    function validateAll(ctrl, validatorName, value) {
        var validity = ctrl.$isEmpty(value) || value.split(',').every(
                function (email) {
                    return EMAIL_REGEXP.test(email.trim());
                }
            );
        if (validity) {
            validateEmailArr = value ? value.split(',') : [];
            ctrl.$setValidity(validatorName, validity);
            return !isEmailDuplicate(validateEmailArr) ? value : undefined;
        }
    }

    function isEmailDuplicate(arr) {
        var sorted_arr = arr.sort();
        for (var i = 0; i < arr.length - 1; i++) {
            if (sorted_arr[i + 1] === sorted_arr[i]) {
                return true;
            }
        }
    }

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function postLink(scope, elem, attrs, modelCtrl) {
            function multipleEmailsValidator(value) {
                return validateAll(modelCtrl, 'multipleEmails', value);
            }

            modelCtrl.$formatters.push(multipleEmailsValidator);
            modelCtrl.$parsers.push(multipleEmailsValidator);
        }
    };
});

app.directive('repairOrderGrid', function ($mdDialog, shopLocationsService) {
    return {
        restrict: 'EA',
        scope: {
            locId: '=',
            vehicleId: '='
        },
        templateUrl: 'views/authenticated/shopLocations/shopLocationsRO.html',
        link: function ($scope) {
            $scope.isRODataNotNull = $scope.isROMsgShow = $scope._filteringEnabled = false;
            var _paginationPageSize = 5;

            var vehicleId = null, locId = null;
            $scope.$watch('vehicleId', function (current) {
                vehicleId = current;
                if (current) {
                    $scope.fnSetGridOptions();
                    $scope.getPagedDataAsync();
                }
            });

            $scope.$watch('locId', function (current) {
                locId = current;
                if (current) {
                    $scope.fnSetGridOptions(current);
                    $scope.getPagedDataAsync();
                }
            });

            $scope.getPagedDataAsync = function () {
                $scope.isRODataNotNull = $scope.isROMsgShow = false;

                if (locId) {
                    shopLocationsService.repairOrder(locId).then(function (data) {
                        if (data.length !== 0) {
                            $scope.isRODataNotNull = true;
                            $scope.isROMsgShow = false;
                            $scope.repairOrdersData = data;
                            var tempData = angular.copy(data);
                            $scope.filteredData = tempData.slice(0, _paginationPageSize);
                        } else {
                            $scope.isRODataNotNull = false;
                            $scope.isROMsgShow = true;
                        }
                    });
                } else if (vehicleId) {
                    shopLocationsService.customerVehiclesRO(vehicleId).then(function (data) {
                        if (data.length !== 0) {
                            $scope.isRODataNotNull = true;
                            $scope.isROMsgShow = false;
                            $scope.repairOrdersData = data;
                            var tempData = angular.copy(data);
                            $scope.filteredData = tempData.slice(0, _paginationPageSize);
                        } else {
                            $scope.isRODataNotNull = false;
                            $scope.isROMsgShow = true;
                        }
                    });
                }
            };

            $scope.fnSetGridOptions = function (id) {
                $scope.roAction = '<div class="ui-grid-cell-contents">' +
                    '<md-button aria-label="view" class="md-icon-button md-accent margin-left-0"' +
                    '           ng-click="grid.appScope.fnViewRODetails(row, $event);">' +
                    '   <md-icon md-font-set="fa fa-lg fa-fw fa-external-link"></md-icon>' +
                    '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">View</md-tooltip>' +
                    '</md-button></div>';

                var colDffArr = [];
                if (!id) {
                    $scope._intRowHeight = 80;
                    $scope._filteringEnabled = false;

                    $scope.laborTmpl = '<div class="highLight ui-grid-cell-contents overflow-auto" layout="column" ' +
                                            'layout-fill add-description arr="row.entity.labor"></div>';
                    $scope.partsTmpl = '<div class="highLight ui-grid-cell-contents overflow-auto" layout="column" ' +
                                            'layout-fill add-description arr="row.entity.parts"></div>';

                    colDffArr = [
                        {
                            name: 'action',
                            displayName: '',
                            cellTemplate: $scope.roAction,
                            minWidth: 50,
                            enableSorting: false,
                            enableColumnMenu: false
                        },
                        {
                            field: 'closed',
                            displayName: 'Closed',
                            cellFilter: 'date:\'MM/dd/yyyy h:mm a\'',
                            minWidth: 200,
                            enableSorting: false
                        },
                        {
                            field: 'inspection',
                            displayName: 'Inspection',
                            cellFilter: 'inspection',
                            minWidth: 110,
                            enableSorting: false
                        },
                        {field: 'order_number', displayName: 'RO #', minWidth: 100, enableSorting: false},
                        {
                            name: 'labor',
                            cellTemplate: $scope.laborTmpl,
                            displayName: 'Labor',
                            minWidth: 400,
                            enableSorting: false
                        },
                        {
                            name: 'part',
                            cellTemplate: $scope.partsTmpl,
                            displayName: 'Parts',
                            minWidth: 400,
                            enableSorting: false
                        },
                        {field: 'total_sold_price_cents', displayName: 'Total RO $', minWidth: 100,
                            enableSorting: false},
                        {
                            field: 'labor',
                            displayName: 'Sold',
                            cellFilter: 'sumOfValue:"sold_seconds" | toHHMMSS',
                            visible: false,
                            minWidth: 100,
                            enableSorting: false
                        },
                        {
                            field: 'labor',
                            displayName: 'Actual',
                            cellFilter: 'sumOfValue:"actual_seconds" | toHHMMSS',
                            visible: false,
                            minWidth: 100,
                            enableSorting: false
                        }
                    ];
                } else {
                    $scope._intRowHeight = 50;
                    $scope._filteringEnabled = true;

                    colDffArr = [
                        {
                            name: 'action',
                            displayName: '',
                            cellTemplate: $scope.roAction,
                            minWidth: 50,
                            enableSorting: false,
                            enableFiltering: false,
                            enableColumnMenu: false
                        },
                        {
                            field: 'closed',
                            displayName: 'Closed',
                            cellFilter: 'date:\'MM/dd/yyyy h:mm a\'',
                            minWidth: 200
                        },
                        {
                            field: 'inspection',
                            displayName: 'Inspection',
                            cellFilter: 'inspection',
                            minWidth: 110
                        },
                        {field: 'order_number', displayName: 'RO #', minWidth: 100},
                        {field: 'customer.last_name', displayName: 'Customer', minWidth: 180},
                        {
                            field: 'customer.phone_numbers',
                            displayName: 'Phone',
                            cellFilter: 'joinTelArray',
                            minWidth: 200
                        },
                        {
                            field: 'customer.email_addresses',
                            displayName: 'Email',
                            cellFilter: 'joinArray',
                            minWidth: 200
                        },
                        {field: 'customer.postal_code', displayName: 'Postal Code', minWidth: 120},
                        {field: 'vehicle.year', displayName: 'Year', minWidth: 80},
                        {field: 'vehicle.make', displayName: 'Make', minWidth: 100},
                        {field: 'vehicle.model', displayName: 'Model', minWidth: 100},
                        {
                            field: 'total_sold_price_cents',
                            displayName: 'Total RO $',
                            cellFilter: 'CentToDollar',
                            minWidth: 100
                        },
                        {
                            field: 'labor',
                            displayName: 'Sold',
                            cellFilter: 'sumOfValue:"sold_seconds" | toHHMMSS',
                            visible: false,
                            minWidth: 100
                        },
                        {
                            field: 'labor',
                            displayName: 'Actual',
                            cellFilter: 'sumOfValue:"actual_seconds" | toHHMMSS',
                            visible: false,
                            minWidth: 100
                        }
                    ];
                }

                $scope.repairOrderGridOptions = {
                    data: 'repairOrdersData',
                    rowHeight: $scope._intRowHeight,
                    enableFiltering: $scope._filteringEnabled,
                    enableGridMenu: true,
                    multiSelect: false,
                    enableRowSelection: true,
                    enableRowHeaderSelection: false,
                    enableVerticalScrollbar: 0,
                    paginationPageSize: _paginationPageSize,
                    paginationPageSizes: [5, 10, 25, 50],
                    columnDefs: colDffArr,
                    onRegisterApi: function (gridApi) {
                        $scope.gridApi = gridApi;
                        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                            row.isSelected = true;
                        });

                        gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
                            $scope.filteredData = $scope.gridApi.core.getVisibleRows($scope.gridApi.grid);
                        });
                    }
                };
            };

            $scope.fnViewRODetails = function (row, ev) {
                $scope.intGridIndex = row.rowIndex;
                $scope.fnOpenRepairOrderModal(ev, row.entity);
            };

            /*---------- Repair Order Dialog --------------------*/
            $scope.fnOpenRepairOrderModal = function (ev, repairOrder) {
                $mdDialog.show({
                    controller: 'repairOrderModalCtrl',
                    templateUrl: 'views/authenticated/shopLocations/modals/roDetailsDialog.html',
                    targetEvent: ev,
                    resolve: {
                        repairOrder: function () {
                            return repairOrder;
                        },
                        repairOrders: function () {
                            return $scope.repairOrdersData;
                        }
                    }
                });
            };
            /*---------------------- End Repair Orders -----------------------------*/
        }
    };
});

app.directive('addDescription', function () {
    return {
        restrict: 'A',
        scope: {
            arr: '='
        },
        link: function (scope, iElement) {
            var html = '';
            angular.forEach(scope.arr, function (objVal) {
                html += '<div style="white-space: normal; line-height: normal;" layout-margin>'
                                                                    + objVal.description + '</div>';
            });
            iElement.append(html);
        }
    };
});

app.directive('recommendedGrid', function ($mdDialog, $timeout, shopLocationsService) {
    return {
        restrict: 'EA',
        scope: {
            locId: '=',
            vehicleId: '='
        },
        templateUrl: 'views/authenticated/shopLocations/shopLocationsRS.html',
        link: function ($scope) {
            $scope.isRSDataNotNull = $scope.isRSMsgShow = $scope._filteringEnabled = false;
            $scope.isProcessing = true;
            $scope.drpObj;
            var _paginationPageSize = 5;

            var vehicleId = null, locId = null;
            $scope.$watch('vehicleId', function (current) {
                vehicleId = current;
                if (current) {
                    $scope.fnSetGridOptions(current);
                    $scope.getPagedDataAsync();
                }
            });

            $scope.$watch('locId', function (current) {
                locId = current;
                if (current) {
                    $scope.fnSetGridOptions();
                    $scope.getPagedDataAsync();
                }
            });

            $scope.fnRefreshDom = function () {
                $timeout(function () {
                    $scope.$apply();
                });
            };

            $scope.fnToggleDateRange = function () {
                if ($scope.isProcessing) {
                    $('.comiseo-daterangepicker-triggerbutton.ui-button').css('cursor', 'wait');
                    $('.comiseo-daterangepicker-triggerbutton.ui-button').attr('disabled', 'true');
                } else {
                    $('.comiseo-daterangepicker-triggerbutton.ui-button').css('cursor', '');
                    $('.comiseo-daterangepicker-triggerbutton.ui-button').removeAttr('disabled');
                }
            };

            $scope.fnToggleDateRange();

            $scope.fnInit = function () {
                $timeout(function () {
                    $scope.isProcessing = false;
                    $('#rs-grid #pickDateRange').daterangepicker({
                        datepickerOptions: {
                            numberOfMonths: 2,
                            maxDate: null
                        },
                        initialText: 'Select Date Period...',
                        presetRanges: [],
                        onChange: function () {
                            $scope.drpObj = $('#rs-grid #pickDateRange').daterangepicker('getRange');
                            if (!$scope.isRSDataNotNull && $scope.isRSMsgShow) {
                                $scope.isRSDataNotNull = $scope.isRSMsgShow = false;
                            } else if (!$scope.isRSMsgShow) {
                                $scope.isProcessing = true;
                            }

                            $scope.recommendedServiceGridOptions.paginationCurrentPage = 1;
                            $scope.fnToggleDateRange();
                            $scope.fnRefreshDom();
                            $scope.getPagedDataAsync();
                        }
                    });

                    $('.comiseo-daterangepicker-triggerbutton.ui-button').css('cursor', 'wait');
                    $('.comiseo-daterangepicker-triggerbutton.ui-button').attr('disabled', 'true');

                    /*--- Date-range picker has same class for Clear, Cancel btns ---*/
                    $('.comiseo-daterangepicker-buttonpanel .ui-priority-secondary:first').click(function () {
                        if ($scope.drpObj) {
                            if (!$scope.isRSDataNotNull && $scope.isRSMsgShow) {
                                $scope.isRSDataNotNull = $scope.isRSMsgShow = false;
                            } else if (!$scope.isRSMsgShow) {
                                $scope.isProcessing = true;
                            }

                            $scope.recommendedServiceGridOptions.paginationCurrentPage = 1;
                            $scope.fnToggleDateRange();
                            $scope.fnRefreshDom();
                            $scope.drpObj = '';
                            $scope.getPagedDataAsync();
                        }
                    });

                }, 100);
            };

            $scope.getPagedDataAsync = function () {
                if (locId) {
                    shopLocationsService.recommendedService(locId).then(function (data) {
                        if ($scope.drpObj) {
                            data = data.filter(function (obj) {
                                var date = moment(obj.recommended_date);
                                var startDate = $scope.drpObj.start;
                                var endDate = $scope.drpObj.end;

                                if (date.isBefore(endDate) && date.isAfter(startDate)
                                    || (date.isSame(startDate, 'day') || date.isSame(endDate, 'day'))) {
                                    return obj;
                                }
                            });
                        }

                        if (data.length !== 0) {
                            $scope.isRSDataNotNull = true;
                            $scope.isRSMsgShow = false;
                            $scope.recommendedServicesData = data;
                            var tempData = angular.copy(data);
                            if ($scope.gridApi) {
                                $scope.filteredData = $scope.gridApi.core.getVisibleRows($scope.gridApi.grid);
                            } else {
                                $scope.filteredData = tempData.slice(0, _paginationPageSize);
                            }
                            $scope.isProcessing = false;
                            $scope.fnToggleDateRange();
                            $scope.fnRefreshDom();
                        } else {
                            $scope.isRSDataNotNull = false;
                            $scope.isRSMsgShow = true;
                            $scope.isProcessing = false;
                            $scope.fnToggleDateRange();
                            $scope.fnRefreshDom();
                        }
                    });
                } else if (vehicleId) {
                    shopLocationsService.customerVehiclesRS(vehicleId).then(function (data) {
                        if (data.length !== 0) {
                            $scope.isRSDataNotNull = true;
                            $scope.isRSMsgShow = false;
                            $scope.recommendedServicesData = data;
                            var tempData = angular.copy(data);
                            $scope.filteredData = tempData.slice(0, _paginationPageSize);
                        } else {
                            $scope.isRSDataNotNull = false;
                            $scope.isRSMsgShow = true;
                        }
                    });
                }
            };

            $scope.fnExportCSV = function () {
                var btnExportElem = angular.element('#rs-grid #btn-export-csv');
                $scope.gridApi.exporter.csvExport('all', 'all', btnExportElem);
            };

            $scope.fnSetGridOptions = function (id) {
                var colDffArr = [{field: 'text', displayName: 'Service', minWidth: 200, enableHiding: false},
                    {
                        field: 'recommended_date',
                        displayName: 'Date',
                        cellFilter: 'date:\'MM/dd/yyyy h:mm a\'',
                        minWidth: 200, enableHiding: false
                    },
                    {
                        field: 'due_date',
                        displayName: 'Due Date',
                        cellFilter: 'date:\'MM/dd/yyyy h:mm a\'',
                        minWidth: 200, enableHiding: false
                    },
                    {field: 'recommendation_type', displayName: 'Type', minWidth: 100, enableHiding: false}
                ];
                $scope.tooltip = '<div class="grid-tooltip" add-tooltip obj="row" ' +
                    'row-index="grid.renderContainers.body.visibleRowCache.indexOf(row);"></div>';
                if (!id) {
                    $scope._filteringEnabled = false;
                    colDffArr.unshift({
                        name: 'tooltip',
                        cellTemplate: $scope.tooltip,
                        displayName: 'Recent Labor',
                        minWidth: 50,
                        width: 120,
                        enableSorting: false,
                        enableFiltering: false,
                        enableColumnMenu: false
                    });
                    colDffArr.push(
                        {
                            field: 'customer.first_name', displayName: 'Customer Name',
                            cellTemplate: '<div class="ui-grid-cell-contents">' +
                            '{{row.getProperty(col.field)}} {{row.entity.customer.last_name}}</div>',
                            minWidth: 220,
                            enableHiding: false
                        },
                        {
                            field: 'customer.phone_numbers', displayName: 'Phone Numbers',
                            cellFilter: 'joinArray', minWidth: 150,
                            enableHiding: false
                        }
                    );
                } else {
                    $scope._filteringEnabled = true;
                }

                $scope.recommendedServiceGridOptions = {
                    data: 'recommendedServicesData',
                    rowHeight: 50,
                    multiSelect: false,
                    enableFiltering: $scope._filteringEnabled,
                    enablePaginationControls: true,
                    enableRowSelection: true,
                    enableRowHeaderSelection: false,
                    exporterSuppressColumns: ['tooltip'],
                    enableVerticalScrollbar: 0,
                    paginationPageSize: _paginationPageSize,
                    paginationPageSizes: [5, 10, 25, 50],
                    columnDefs: colDffArr,
                    onRegisterApi: function (gridApi) {
                        $scope.gridApi = gridApi;
                        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                            row.isSelected = true;
                        });

                        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                            $scope.filteredData = $scope.gridApi.core.getVisibleRows($scope.gridApi.grid);
                        });
                    }
                };
            };
        }
    };
});

app.directive('addTooltip', function ($filter, $rootScope) {
    return {
        restrict: 'A',
        scope: {
            obj: '=',
            rowIndex: '='
        },
        templateUrl: 'views/authenticated/shopLocations/tooltip.html',
        link: function (scope, iElement) {
            scope.recRepairArr = scope.obj.entity.recent_repair_orders;
            scope.recent_repair_orders_obj = scope.recRepairArr[0];

            scope.position = scope.obj.entity.recent_repair_orders.indexOf(scope.recent_repair_orders_obj);
            scope.fnMove = function (direction) {
                scope.position += direction;
                scope.recent_repair_orders_obj = scope.recRepairArr[scope.position];
            };

            scope.fnClose = function (e) {
                e.stopPropagation();
                angular.element(ul).removeClass('add-display-block');
                angular.element(ul).parent().removeClass('top-arrow bottom-arrow');
                angular.element('#rs-grid').css('padding-bottom', '');
                angular.element('#rs-grid .ui-grid-viewport').css('overflow', '');
                angular.element('#rs-grid .ui-grid-viewport').css('overflow-x', 'auto');
                angular.element('#rs-grid .ui-grid-viewport').css('overflow-y', 'hidden');
            };

            var ul = '#view_ul' + scope.rowIndex;
            iElement.blur(function () {
                angular.element(ul).removeClass('add-display-block');
            });

            if ($rootScope.isMobile) {
                iElement.click(function () {
                    if (!angular.element(ul).hasClass('add-display-block')) {
                        scope.fnShowTooltip();
                    }
                });
            }

            scope.fnShowTooltip = function () {
                angular.element(ul).addClass('add-display-block');
                if (scope.rowIndex > 6) {
                    angular.element(ul).css('margin-top', '-350px');
                    angular.element('.grid-tooltip .has-sub ul').css('bottom', '0px');
                    angular.element(ul).parent().removeClass('top-arrow');
                    angular.element(ul).parent().addClass('bottom-arrow');
                    angular.element('#rs-grid').css('padding-bottom', '');
                } else {
                    angular.element('#rs-grid .ui-grid-viewport').css('overflow-x', ''); // For IE
                    angular.element('#rs-grid .ui-grid-viewport').css('overflow-y', ''); // For IE
                    angular.element('#rs-grid .ui-grid-viewport').css('overflow', 'visible');
                    angular.element('.grid-tooltip .has-sub ul').css('bottom', '');
                    angular.element(ul).css('margin-top', '0px');
                    angular.element(ul).parent().removeClass('bottom-arrow');
                    angular.element(ul).parent().addClass('top-arrow');
                    angular.element('#rs-grid').css('padding-bottom', '340px');
                }
            };

            iElement.hover(function () {
                scope.fnShowTooltip();
            }, function (event) {
                scope.fnClose(event);
            });

            angular.forEach(scope.obj.entity.recent_labor, function (objVal) {
                angular.element('#table' + scope.obj.rowIndex).append('<tr><td>' + objVal.repair_order
                    + '</td><td>' + $filter('date')(objVal.closed, 'M/d/yyyy h:mm a')
                    + '</td><td>' + objVal.description + '</td></tr>');
            });
        }
    };
});

app.directive('jsonText', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: 'ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModelCtrl) {

            var lastValid;

            // push() if faster than unshift(), and avail. in IE8 and earlier (unshift isn't)
            ngModelCtrl.$parsers.push(fromUser);
            ngModelCtrl.$formatters.push(toUser);

            // clear any invalid changes on blur
            element.bind('blur', function () {
                element.val(toUser(scope.$eval(attrs.ngModel)));
                ngModelCtrl.$render();
            });

            // $watch(attrs.ngModel) wouldn't work if this directive created a new scope;
            // see http://stackoverflow.com/questions/14693052/watch-ngmodel-from-inside-directive-using-isolate-scope how to do it then
            scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                lastValid = lastValid || newValue;

                if (newValue != oldValue) {
                    ngModelCtrl.$setViewValue(toUser(newValue));

                    // TODO avoid this causing the focus of the input to be lost..
                    //ngModelCtrl.$render();
                }
            }, true); // MUST use objectEquality (true) here, for some reason..

            function fromUser(text) {
                // Beware: trim() is not available in old browsers
                if (!text || text.trim() === '') {
                    return {};
                } else {
                    try {
                        lastValid = angular.fromJson(text);
                        ngModelCtrl.$setValidity('invalidJson', true);
                    } catch (e) {
                        ngModelCtrl.$setValidity('invalidJson', false);
                    }
                    return lastValid;
                }
            }

            function toUser(object) {
                // better than JSON.stringify(), because it formats + filters $$hashKey etc.
                return angular.toJson(object, true);
            }
        }
    };
});