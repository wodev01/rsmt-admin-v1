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

        $rootScope.$on('actonAccountLinked', function () {
            $scope.fnGetActonInfo();
        });

        $scope.fnToggleActonModal = function (ev, isActonAccountLinked) {
            if (!isActonAccountLinked) {
                var ActonDialogController = ['$scope', '$rootScope', function ($scope, $rootScope) {
                    $scope.fnToggleActonAccount = function (user) {
                        var paramObj = {};
                        paramObj.email = user.username;
                        paramObj.password = user.password;

                        clientActonService.linkActonAccount(partnerId, paramObj)
                            .then(function (data) {
                                toastr.success('User account linked successfully.');
                                $rootScope.$broadcast('actonAccountLinked');

                            }, function (error) {
                                toastr.error('Something goe\'s wrong while linking act-on.');
                            });

                        $scope.fnCloseActonDialog();
                    };

                    $scope.fnCloseActonDialog = function () {
                        $mdDialog.hide();
                    };

                }];

                $mdDialog.show({
                    controller: ActonDialogController,
                    template: '<md-dialog aria-label="Act on form dialog" flex-gt-sm="40" flex-sm="60" flex>' +
                    '       <md-toolbar>' +
                    '           <div class="md-toolbar-tools"><span class="md-title">Acton Form</span></div>' +
                    '       </md-toolbar>' +
                    '       <md-dialog-content layout-padding>' +
                    '           <form name="downloadCustomerCSVForm" ng-init="fnInit();" layout="column" novalidate>' +
                    '               <md-input-container class="remove-error-space">' +
                    '                   <md-icon class="md-accent">person</md-icon>' +
                    '                   <input type="text" ng-model="user.username" ' +
                    '                                                   placeholder="Username" required />' +
                    '               </md-input-container>' +
                    '               <md-input-container class="remove-error-space">' +
                    '                   <md-icon class="md-accent">lock</md-icon>' +
                    '                   <input type="password" ng-model="user.password" ' +
                    '                                                   placeholder="Password" required />' +
                    '               </md-input-container>' +
                    '           </form>' +
                    '           <md-dialog-actions>' +
                    '               <md-button class="md-raised md-accent"' +
                    '                          ng-disabled="downloadCustomerCSVForm.$invalid"' +
                    '                          ng-click="fnToggleActonAccount(user);">Link Account</md-button>' +
                    '               <md-button class="md-warn md-raised md-hue-2" style="margin:0px 10px !important;"' +
                    '                          ng-click="fnCloseActonDialog();">Cancel</md-button>' +
                    '           </md-dialog-actions>' +
                    '       </md-dialog-content>' +
                    '</md-dialog>',
                    targetEvent: ev
                }).then(function (answer) {
                }, function (err) {
                });

            } else {

                var confirm = $mdDialog.confirm()
                    .title('Unlink Account')
                    .content('Are you sure you want to unlink act-on account?')
                    .ariaLabel('Delete')
                    .ok('Unlink')
                    .cancel('Cancel');

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
