'use strict';

app.controller('downloadCustomerCSVCtrl',
    function ($scope, partnerId, $mdDialog, $timeout, $window, encodeParamService) {

        $scope.downloadFilter = {};
        $scope.dateRangeObj = {};

        $scope.fnDownload = function () {
            $mdDialog.hide();

            $timeout(function () {
                $scope.downloadFilter['from'] =
                    $scope.dateRangeObj && $scope.dateRangeObj.start
                        ? moment($scope.dateRangeObj.start).format('YYYY-MM-DD') : '';
                $scope.downloadFilter['to'] =
                    $scope.dateRangeObj && $scope.dateRangeObj.end
                        ? moment($scope.dateRangeObj.end).format('YYYY-MM-DD') : '';

                if (CarglyPartner) {
                    $scope.downloadFilter['oauth_token'] = CarglyPartner.accessToken;

                    $scope.downloadLink =
                        CarglyPartner.src + '/partners/api/crm/' + partnerId + '/customers.csv'
                            + encodeParamService.getEncodedParams($scope.downloadFilter);

                    $window.open($scope.downloadLink, '_blank');
                }
            });
        };

        $scope.fnHide = function () {
            $mdDialog.hide();
        };

    });