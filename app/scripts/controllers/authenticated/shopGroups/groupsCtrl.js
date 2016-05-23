'use strict';
app.controller('groupsCtrl',
    function ($scope, $mdSidenav, $rootScope, $mdDialog, groupService) {
        $scope.rightView = 'views/authenticated/shopGroups/manageGroup.html';
        $scope.isGroupEditable = $rootScope.isGroupTabsLoad = false;

        $scope.fnFetchGroups = function () {
            groupService.fetchGroups().then(function (data) {
                if (data.length !== 0) {
                    $scope.isGroupsData = true;
                    $scope.isMsgGridShow = false;
                    $scope.groupsData = data;
                } else {
                    $scope.isGroupsData = false;
                    $scope.isMsgGridShow = true;
                }
            });
        };

        //$broadcast event
        $scope.$on('RefreshGroupsGrid', function () {
            $scope.fnFetchGroups();
        });

        $scope.groupsAction = '<div layout="row">' +
            '<md-button aria-label="edit" class="md-icon-button md-accent" ' +
            '           ng-click="grid.appScope.fnGroupEdit(row, $event);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-pencil"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Edit</md-tooltip></md-button>' +
            '<md-button aria-label="delete" class="md-icon-button md-warn" ' +
            '           ng-click="grid.appScope.fnGroupDelete(row, $event);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-trash"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Delete</md-tooltip>' +
            '</md-button></div>';

        $scope.groupsGridOptions = {
            data: 'groupsData',
            rowHeight: 50,
            multiSelect: false,
            enableVerticalScrollbar: 0,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            columnDefs: [
                {field: 'name', displayName: 'Group Name', minWidth: 250, enableHiding: false},
                {
                    name: 'action',
                    displayName: '',
                    cellTemplate: $scope.groupsAction,
                    width: 100,
                    enableSorting: false,
                    enableColumnMenu: false,
                    enableColumnResizing: false
                }
            ],
            onRegisterApi: function (gridApi) {
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    row.isSelected = true;
                });
            }
        };

        $scope.fnGroupDelete = function (row, event) {
            var confirm = $mdDialog.confirm()
                .title('Delete')
                .content('Would you like to delete this group?')
                .ariaLabel('Delete')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(event);
            $mdDialog.show(confirm).then(function () {
                groupService.deleteGroup(row.entity.id).then(function () {
                    toastr.success('Group deleted successfully...');
                    $scope.fnFetchGroups();
                }, function (error) {
                    toastr.error('Failed deleting group.', 'STATUS CODE: ' + error.status);
                });
            });
        };

        $scope.fnGroupEdit = function (row) {
            $scope.intIndex = row.rowIndex;
            $scope.editGroupName = row.entity.name;
            groupService.setGroupObj(row.entity);
            $scope.fnOpenManageGroupSwap(true);
        };

        //Swapping view open function
        $scope.fnOpenManageGroupSwap = function (isEditable) {
            $scope.isGroupEditable = isEditable;
            setTimeout(function () {
                $scope.rightView = '';
                $scope.$apply();
                $scope.rightView = 'views/authenticated/shopGroups/manageGroup.html';
                $scope.$apply();
                $rootScope.isGroupTabsLoad = true;
                $mdSidenav('manageGroupView').open().then(function () {
                });
            });
        };

        //Swapping view close function
        $scope.fnCloseManageGroupSwap = function () {
            $mdSidenav('manageGroupView').close().then(function () {
                delete $rootScope.isGroupTabsLoad;
            });
        };

        $scope.fnInitGroups = function () {
            $scope.fnFetchGroups();
        };

    });
