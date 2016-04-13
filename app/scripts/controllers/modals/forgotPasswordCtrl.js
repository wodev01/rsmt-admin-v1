'use strict';

/**
 * @ngdoc function
 * @name rsmtAdminApp.controller:ForgotPasswordCtrl
 * @description
 * # ForgotPasswordCtrl
 * Controller of the rsmtAdminApp
 */
app.controller('ForgotPasswordCtrl',
    function ($scope, $rootScope, $mdDialog, $state,
              localStorage, toastr) {

        $scope.resendEmail = '';

        $scope.fnHide = function () {
            $mdDialog.hide();
        };

        $scope.fnCancel = function () {
            $mdDialog.cancel();
        };

        $scope.fnResendMail = function (resendEmail) {
            CarglyPartner.requestPasswordReset(resendEmail,
                function () {
                    toastr.success('Password request send successfully.');
                    $scope.fnHide();
                },
                function () {
                    toastr.error('Something goe\'s wrong while sending request.');
                    $scope.fnHide();
                }
            );
        };

    });
