'use strict';
app.controller('clientActOnCtrl',
    function ($scope, $mdDialog, $rootScope, toastr, clientService, clientActonService) {

        $scope.client = clientService.getClientObj().id ? clientService.getClientObj() : {};
        var partnerId = $scope.client.id;

        $scope.isActonAccountLinked = $scope.isProcessing = false;

        $scope.fnGetActonInfo = function () {
            $scope.isProcessing = true;
            clientActonService.fetchActonInfo(partnerId)
                .then(function (data) {
                    $scope.isActonAccountLinked = JSON.parse(data.enabled);
                    $scope.isProcessing = false;

                }, function (error) {
                    $scope.isProcessing = false;
                    toastr.error('Something goe\'s wrong while getting act-on.');

                });

        };

        $scope.fnToggleActonModal = function (ev, isActonAccountLinked) {
            if (!isActonAccountLinked) {
                var ActonDialogController = ['$scope', function ($scope) {
                    $scope.fnToggleActonAccount = function (user) {
                        var paramObj = {};
                        paramObj.email = user.username;
                        paramObj.password = user.password;

                        $scope.isProcessing = true;
                        clientActonService.linkActonAccount(partnerId, paramObj)
                            .then(function (data) {
                                toastr.success('User account linked successfully.');
                                $scope.isProcessing = false;
                                $mdDialog.hide();

                            }, function (error) {
                                toastr.error('Something goe\'s wrong while linking act-on.');
                                $scope.isProcessing = false;
                                $mdDialog.cancel();
                            });

                    };

                    $scope.fnCloseActonDialog = function () {
                        $mdDialog.cancel();
                    };

                }];

                $mdDialog.show({
                    controller: ActonDialogController,
                    templateUrl: 'views/authenticated/clients/modals/clientActOn.tmpl.html',
                    targetEvent: ev
                }).then(function (answer) {
                    $scope.fnGetActonInfo();
                }, function (err) {
                });

            } else {

                var confirm = $mdDialog.confirm()
                    .title('Unlink Account')
                    .content('Are you sure you want to unlink act-on account?')
                    .ariaLabel('Ok')
                    .ok('Unlink')
                    .cancel('Cancel')
                    .targetEvent(ev);

                $mdDialog.show(confirm).then(function () {
                    $scope.isProcessing = true;
                    clientActonService.unlinkActonAccount(partnerId)
                        .then(function (data) {
                            toastr.success('User account unlinked successfully.');
                            $scope.fnGetActonInfo();
                            $scope.isProcessing = false;

                        }, function (error) {
                            $scope.isProcessing = false;
                            toastr.error('Something goe\'s wrong while unlinking act-on.');
                        });

                }, function () {
                });

            }

        };

    });
