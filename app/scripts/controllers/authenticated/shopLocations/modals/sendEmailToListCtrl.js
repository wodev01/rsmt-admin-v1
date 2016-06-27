'use strict';
app.controller('sendEmailToListCtrl', function ($scope, $timeout, $mdDialog, partnerId,customerTemplateService){
    $scope.templatesData = [];
    $scope.isProcessing = true;
    $scope.filter = {templateName:''};

    $scope.getPagedDataAsync = function(partnerId){
        customerTemplateService.fetchCustomerListTemplates(partnerId)
            .then(function (data) {
                if (data.length !== 0) {
                    $scope.templatesData = data;
                    $scope.fnToggleDateRange(false);
                } else {
                    $scope.fnToggleDateRange(false);
                }
            }, function (error) {
                toastr.error('Failed retrieving templates.', 'STATUS CODE: ' + error.status);
            });
    };

    $scope.fnToggleDateRange = function (isProcessing) {
        $scope.isProcessing = isProcessing;
        if (isProcessing) {
            $('.comiseo-daterangepicker-triggerbutton.ui-button').css('cursor', 'wait');
            $('.comiseo-daterangepicker-triggerbutton.ui-button').attr('disabled', 'true');
        } else {
            $('.comiseo-daterangepicker-triggerbutton.ui-button').css('cursor', '');
            $('.comiseo-daterangepicker-triggerbutton.ui-button').removeAttr('disabled');
        }
    };

    $scope.fnCloseFormDataDialog = function(){
        $mdDialog.hide();
    };

    function fnGetDateRange(dateRangeObj) {
        $scope.filter['from'] = dateRangeObj && dateRangeObj.start ? moment(dateRangeObj.start).format('YYYY-MM-DD') : '';
        $scope.filter['to'] = dateRangeObj && dateRangeObj.end ? moment(dateRangeObj.end).format('YYYY-MM-DD') : '';
        //$scope.fnChangeFilter($scope.filter);
        console.log($scope.filter);
    }

    $scope.fnRefreshGrid = function (dateRangeObj) {
        fnGetDateRange(dateRangeObj);
    };

    $scope.fnInitSendEmailToList = function () {
        $scope.getPagedDataAsync(partnerId);
    };

});