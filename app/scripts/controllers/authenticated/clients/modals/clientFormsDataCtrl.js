'use strict';
app.controller('clientFormsDataCtrl', function ($scope, $mdDialog, clientFormDataObj){
    $scope.clientFormData = {};
    $scope.clientFormData = angular.copy(clientFormDataObj);

    $scope.fnCloseFormDataDialog = function(){
        $mdDialog.hide();
    };

    $scope.fnCheckFormData = function(data){
        return Object.keys(data).length;
    };

});