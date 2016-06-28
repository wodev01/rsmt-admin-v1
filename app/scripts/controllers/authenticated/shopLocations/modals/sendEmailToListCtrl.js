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
                    $scope.isProcessing = false;
                } else {
                    $scope.isProcessing = true;
                }
            }, function (error) {
                toastr.error('Failed retrieving templates.', 'STATUS CODE: ' + error.status);
            });
    };


    $scope.fnCloseFormDataDialog = function(){
        $mdDialog.hide();
    };

    $scope.fnInitSendEmailToList = function () {

        $scope.displayMode = 'full';
        $scope.dateValue = new Date();

        $scope.getPagedDataAsync(partnerId);
    };

});