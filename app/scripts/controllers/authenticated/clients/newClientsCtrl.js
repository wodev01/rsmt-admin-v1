'use strict';
app.controller('newClientsCtrl',
    function ($scope, $rootScope, toastr, globalTimeZone, clientService) {

        $scope.client = {timezone: 'US/Central'};
        $scope.isProcessing = false;

        $scope.fnSaveClient = function (client) {
            $scope.isProcessing = true;

            clientService.saveClient(client)
                .then(function (response) {
                    toastr.success('Client save successfully.');
                    $scope.client = {timezone: 'US/Central'};
                    $scope.newClientForm.$setUntouched();
                    $rootScope.$broadcast('RefreshClientsGrid');
                    $scope.isProcessing = false;
                }, function (error) {
                    toastr.error('Can\'t be saved, repeated email or invalid information.',
                        'STATUS CODE: ' + error.status);
                    $scope.isProcessing = false;
                });

            $scope.fnCloseNewClientSwap();
        };

        $scope.fnInitManageClient = function () {
            $scope.timeZoneDDOptions = globalTimeZone;
        };

    });