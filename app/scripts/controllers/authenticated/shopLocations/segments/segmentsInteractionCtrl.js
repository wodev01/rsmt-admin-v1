'use strict';
app.controller('segmentsInteractionCtrl',
    function ($scope, $filter, cookieName, $cookies, $mdDialog, $window, $timeout,
              encodeParamService, shopLocationsService, segmentInteractionService, shopLocationSegmentService) {

        var locId =
            shopLocationsService.getShopLocationsObj().id ?
                shopLocationsService.getShopLocationsObj().id : '';

        $scope.segment = undefined;
        $scope.segment = shopLocationSegmentService.getShopLocSegmentObj().id
            ? shopLocationSegmentService.getShopLocSegmentObj() : undefined;

        $scope._intRowHeight = 80;

        $scope.subSegmentId = '';
        $scope.isSegmentInteractionData = false;
        $scope.isMsgGridShow = $scope.isMoreSegmentInteractions = false;
        $scope.segmentInteractionData = $scope.filter = {};
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
            $scope.isSegmentInteractionData = $scope.isMsgGridShow = false;
            $scope.fnToggleDateRange(true);

            segmentInteractionService.fetchSegmentInteraction(locId, $scope.segment.id, paramsObj)
                .then(function (data) {
                    if (data.length !== 0) {
                        $scope.isMsgGridShow = false;
                        $scope.isSegmentInteractionData = true;
                        $scope.segmentInteractionData = data;

                        $scope.fnToggleDateRange(false);
                    } else {
                        $scope.isMsgGridShow = true;
                        $scope.isSegmentInteractionData = false;

                        $scope.fnToggleDateRange(false);
                    }
                }, function (error) {
                    toastr.error('Failed retrieving more segment interaction', 'STATUS CODE: ' + error.status);
                    $scope.fnToggleDateRange(false);
                });
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
        };

        $scope.nameTmpl = '<div class="ui-grid-cell-contents">'
            + '{{row.entity.customer.first_name}}&nbsp;{{ row.entity.customer.last_name}}</div>';

        $scope.infoTmpl = '<div class="overflow-auto" layout="row" layout-padding layout-fill>'
            + '<div class="padding-0">'
            + '     <div> Email: {{row.entity.customer.email_addresses | joinArray}} </div>'
            + '     <div> Phone: {{row.entity.customer.phone_numbers | tel | joinTelArray}} </div>'
            + '     <div> Address: {{row.entity.customer.address1}} </div>'
            + '</div></div>';

        $scope.segmentTmpl = '<div class="ui-grid-cell-contents">'
            + '{{row.entity.segment.name}}\\{{ row.entity.sub_segment.name}}</div>';

        $scope.sgmentInteractionAction = '<div class="ui-grid-cell-contents">' +
            '<md-button aria-label="view" class="md-icon-button md-accent margin-left-0"' +
            '           ng-click="grid.appScope.fnOpenSegmentInteraction(row, $event);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-external-link"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">View</md-tooltip>' +
            '</md-button></div>';

        $scope.segmentInteractionGridOptions = {
            data: 'segmentInteractionData',
            rowHeight: $scope._intRowHeight,
            multiSelect: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableVerticalScrollbar: 0,
            columnDefs: [
                {
                    name: 'action', displayName: '', cellTemplate: $scope.sgmentInteractionAction, width: 50,
                    enableSorting: false,
                    enableColumnMenu: false,
                    enableColumnResizing: false
                },
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
                {
                    name: 'segment',
                    cellTemplate: $scope.segmentTmpl,
                    displayName: 'Segment',
                    minWidth: 180,
                    enableHiding: false
                },
                {field: 'delivery_type', displayName: 'Delivery', minWidth: 80, enableHiding: false},
                {field: 'status', displayName: 'Status', minWidth: 100, enableHiding: false},
                {
                    field: 'repair_order.closed', displayName: 'Closed',
                    cellFilter: 'date:\'MM/dd/yyyy h:mm a\'', minWidth: 160, enableHiding: false
                }
            ],
            onRegisterApi: function (gridApi) {
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    row.isSelected = true;
                });
            }
        };

        $scope.fnOpenSegmentInteraction = function (row, event) {
            $scope.fnOpenSegmentInteractionModal(row.entity, event);
        };

        $scope.fnOpenSegmentInteractionModal = function (obj, event) {
            $mdDialog.show({
                controller: 'segmentInteractionDialogCtrl',
                targetEvent: event,
                templateUrl: 'views/authenticated/shopLocations/segments/modals/segmentInteraction.dialog.html',
                resolve: {
                    segmentInteractionObj: function () {
                        return obj;
                    }
                }
            });
        };

        $scope.fnRefreshGrid = function (dateRangeObj) {
            fnGetDateRange(dateRangeObj);
        };

        $scope.$on('refreshSegmentInteraction', function () {
            $scope.fnRefreshGrid($scope.dateRangeObj);
        });

        $scope.fnDownloadInteractionCSV = function (event) {
            var token = $cookies.get(cookieName);

            var DialogController = ['$scope', '$window', 'locationId', 'segmentId', 'filterObj',
                function ($scope, $window, locationId, segmentId, filterObj) {
                    var filter = angular.copy(filterObj);

                    filter.oauth_token = token;
                    $scope.fnDownload = function () {
                        $mdDialog.hide();
                        $scope.downloadLink = 'https://carglyplatform.appspot.com/partners/api/crm/' +
                            locationId + '/segments/' + segmentId + '/interactions.csv' +
                            encodeParamService.getEncodedParams(filter);
                        $window.open($scope.downloadLink, '_blank');
                    };

                    $scope.fnHide = function () {
                        $mdDialog.hide();
                    };

                }];

            $mdDialog.show({
                locals: {locationId: locId, segmentId: $scope.segment.id, filterObj: $scope.filter},
                controller: DialogController,
                template: '<md-dialog aria-label="Download Interaction CSV Dialog">' +
                '  <md-dialog-content class="layout-padding">' +
                '      <div class="md-title"> Download Interaction CSV </div>' +
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
            }, function (err) {
            });
        };

        /*-------------- Load More Interactions ---------------*/
        $scope.fnLoadMoreSegmentInteractions = function () {
            if (!$scope.isMoreSegmentInteractions) {
                $scope.filter.page_num += 1;
                $scope.isMoreSegmentInteractions = true;
                $scope.isPagingData = true;

                $scope.fnToggleDateRange(true);

                segmentInteractionService.fetchSegmentInteraction(locId, $scope.segment.id, $scope.filter)
                    .then(function (data) {
                        if (data.length != 0) {
                            $scope.segmentInteractionData = $scope.segmentInteractionData.concat(data);
                            $scope.isMoreSegmentInteractions = false;
                            $scope.fnToggleDateRange(false);
                        } else {
                            $scope.isMoreSegmentInteractions = $scope.isPagingData = false;
                            $scope.fnToggleDateRange(false);
                        }
                    }, function (error) {
                        toastr.error('Failed retrieving more segment interaction', 'STATUS CODE: ' + error.status);
                        $scope.fnToggleDateRange(false);
                    });
            }
        };

        $scope.fnChangeSegmentInteractions = function (subSegmentId) {
            $('#segment-interaction-tab #pickDateRange').daterangepicker('clearRange');
            $scope.subSegmentId = subSegmentId ? subSegmentId : '';

            if ($scope.subSegmentId === '') {
                delete $scope.filter['sub_segment_id'];
            } else {
                $scope.filter['sub_segment_id'] = $scope.subSegmentId;
            }

            $scope.filter.status = $scope.filter.deliveryType = '';
            if ($scope.isSegmentInteractionData) {
                fnGetDateRange();
            }
        };

        $scope.fnInitSegmentInteraction = function () {
            if ($scope.segment) {
                $scope.segment.sub_segments.unshift({id: '', name: 'All Sub Segments'});
            }

            $scope.getPagedDataAsync($scope.filter);
        };

    });