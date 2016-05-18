'use strict';
app.controller('clientUpdateManageCtrl',
    function ($scope, $rootScope, toastr, updateService, clientService, clientLocationService) {

        $scope.client = clientService.getClientObj().id ? angular.copy(clientService.getClientObj()) : {};
        var partnerId = $scope.client.id;

        $scope.isProcessing = false;
        $scope.updatesDefinitions = [];
        $scope.update = {};
        $scope.locationsDD = [
            {id: 'NONE', name: 'All locations'}
        ];
        $scope.update.location_id = 'NONE';
        $scope.isAppliesToLocation = false;

        $scope.fnFetchUpdatesDefinitions = function () {
            updateService.fetchUpdatesDefinitions().then(function (res) {
                if (res.length !== 0) {
                    $scope.updatesDefinitions = res;
                    $scope.update.updateObj = res[0];
                    $scope.isAppliesToLocation = res[0].applies_to_location ? true : false;
                } else {
                    toastr.info('Update definitions not available.');
                }
            });
        };

        $scope.fnUpdatesDefinitionsDDChange = function (updatesDefinitionObj) {
            $scope.isAppliesToLocation = updatesDefinitionObj.applies_to_location ? true : false;
        };

        $scope.fnFetchLocations = function () {
            clientLocationService.fetchLocations(partnerId).then(function (res) {
                angular.forEach(res, function (val) {
                    $scope.locationsDD.push({id: val.id, name: val.name});
                });
            });
        };

        $scope.fnSaveUpdate = function (update) {
            $scope.isProcessing = true;

            var updateCopy = {};
            updateCopy.update_definition_id = update.updateObj.id;
            if (update.location_id !== 'NONE') {
                updateCopy.location_id = update.location_id;
            }

            updateService.createUpdate(partnerId, updateCopy).then(function (res) {
                if (!isEmpty(res) && !res.status) {
                    toastr.success('Update saved successfully.');
                    $rootScope.$broadcast('refreshUpdates');
                } else {
                    if (res.data) {
                        var data = JSON.parse(res.data);
                        if (!isEmpty(data)) {
                            var msg = data.messages[0].message;
                            toastr.error(msg);
                        } else {
                            toastr.error('Update not saved');
                        }
                    }
                }
                $scope.isProcessing = false;
                $rootScope.fnCloseManageUpdate();
            });
        };

        function isEmpty(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    return false;
                }
            }
            return true;
        }

        $scope.fnInitUpdateManage = function () {
            if ($rootScope.isFetchUpdateDefinitions) {
                $scope.fnFetchUpdatesDefinitions();
                $scope.fnFetchLocations();
            }
        };

    });