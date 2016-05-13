'use strict';
app.controller('segmentsConfigurationCtrl',
    function ($scope, $rootScope, $mdDialog, toastr,
              shopLocationsService, shopLocationSegmentService, segmentConfigurationService) {

        var locId =
            shopLocationsService.getShopLocationsObj().id ?
                shopLocationsService.getShopLocationsObj().id : '';

        var segmentId =
            shopLocationSegmentService.getShopLocSegmentObj().id ?
                shopLocationSegmentService.getShopLocSegmentObj().id : undefined;

        $scope.fnCreateNewSubSegment = function (event) {
            $scope.fnOpenSegmentModal({}, event);
        };

        $scope.getPagedDataAsync = function () {
            if (segmentId) {
                $scope.isSubSegmentMsgShow = false;
                $scope.isSubSegmentDataNotNull = false;

                segmentConfigurationService.fetchSubSegments(locId, segmentId)
                    .then(function (data) {
                        if (data.length !== 0) {
                            if (data.sub_segments.length !== 0) {
                                $scope.isSubSegmentMsgShow = false;
                                $scope.isSubSegmentDataNotNull = true;
                                $scope.subSegmentsData = data.sub_segments;
                            } else {
                                $scope.isSubSegmentMsgShow = true;
                                $scope.isSubSegmentDataNotNull = false;
                            }
                        }
                    });
                $scope.isSubSegmentMsgShow = false;
                $scope.isSubSegmentDataNotNull = false;
            }
        };

        $scope.fnInitSubSegments = function () {
            $scope.getPagedDataAsync();
        };

        $scope.subSegmentsAction = '<div layout="row">' +
            '<md-button aria-label="view" class="md-icon-button md-accent" ' +
            '           ng-click="grid.appScope.fnEditManageSegmentsView(row, $event);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-external-link"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">View</md-tooltip></md-button>' +
            '<md-button aria-label="delete" class="md-icon-button md-warn" ' +
            '           ng-click="grid.appScope.fnRemoveSubSegmentsView(row, $event)">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-trash"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Delete</md-tooltip>' +
            '</md-button></div>';

        $scope.subSegmentsGridOptions = {
            rowTemplate: '<div grid="grid" class="ui-grid-draggable-row" draggable="true">' +
            '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" ' +
            'class="ui-grid-cell move" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'custom\': true }" ' +
            'ui-grid-cell></div></div>',
            data: 'subSegmentsData',
            rowHeight: 50,
            multiSelect: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableVerticalScrollbar: 0,
            columnDefs: [
                {field: 'name', displayName: 'Sub-segment Name', minWidth: 100, enableHiding: false},
                {field: 'template_name', displayName: 'Template Name', minWidth: 100, enableHiding: false},
                {
                    field: 'interaction_delay_days',
                    displayName: 'Interaction Delay Days',
                    minWidth: 100,
                    enableHiding: false
                },
                {field: 'expression', displayName: 'Expressions', minWidth: 100, width: 200, enableHiding: false},
                {field: 'enabled', displayName: 'Enabled', minWidth: 100, enableHiding: false},
                {
                    name: 'action',
                    displayName: '',
                    cellTemplate: $scope.subSegmentsAction,
                    width: 100,
                    enableSorting: false,
                    enableColumnMenu: false
                }
            ],
            onRegisterApi: function (gridApi) {
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    row.isSelected = true;
                });

                gridApi.draggableRows.on.rowDropped($scope, function (info, dropTarget) {
                    if (info.fromIndex !== info.toIndex) {
                        toastr.success('Sub-segments reorderd...');
                    }
                });

                gridApi.draggableRows.on.rowDragged($scope, function (info, rowElement) {
                    if (!info.fromIndex || !info.toIndex) {
                        angular.element(rowElement).css('opacity', '1');
                    }
                });

                gridApi.draggableRows.on.rowOverRow($scope, function (info, rowElement) {
                    if (!info.fromIndex || !info.toIndex) {
                        angular.element(rowElement).css('opacity', '1');
                    }
                });

                gridApi.draggableRows.on.rowLeavesRow($scope, function (info, rowElement) {
                    if (!info.fromIndex || !info.toIndex) {
                        angular.element(rowElement).css('opacity', '1');
                    }
                });

            }
        };

        /*----- For update segment ----------*/
        $scope.fnEditManageSegmentsView = function (row, event) {
            $scope.fnOpenSegmentModal(row.entity, event);
        };

        $scope.fnOpenSegmentModal = function (obj, event) {
            $mdDialog.show({
                controller: 'segmentsConfigurationDialogCtrl',
                templateUrl: 'views/authenticated/shopLocations/segments/modals/segmentConfiguration.dialog.html',
                targetEvent: event,
                resolve: {
                    subSegment: function () {
                        return obj;
                    }
                }
            });
        };

        $scope.fnRemoveSubSegmentsView = function (row, event) {
            var confirm = $mdDialog.confirm()
                .title('Delete')
                .content('Are you sure you want to remove?')
                .ariaLabel('Delete')
                .ok('Remove')
                .cancel('Cancel')
                .targetEvent(event);

            $mdDialog.show(confirm).then(function () {
                var subSegmentId = row.entity.id;

                shopLocationSegmentService.removeSubSegments(locId, segmentId, subSegmentId).then(function (res) {
                    if (res === null) {
                        $rootScope.$broadcast('refreshSubSegments');
                        $rootScope.$broadcast('refreshSegments');
                        toastr.success('Sub-segment deleted successfully...');
                    }
                });

            }, function () {
            });

        };

        $scope.$on('refreshSubSegments', function () {
            $scope.getPagedDataAsync();
        });

    });
