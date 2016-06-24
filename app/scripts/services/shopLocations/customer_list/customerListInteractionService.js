'use strict';
app.factory('customerListInteractionService',['$q', 'ErrorMsg', 'encodeParamService',
    function($q, ErrorMsg, encodeParamService) {
        var customerListInteractionService = {};

        customerListInteractionService.fetchCustomerListInteraction = function(locId, customerListId, paramsObj){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/customer-lists/'+ customerListId + '/interactions'
                            + encodeParamService.getEncodedParams(paramsObj),
                type: 'GET',
                success: function (data) {
                    defer.resolve(data);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.reject(error);
                }
            });
            return defer.promise;
        };

        return customerListInteractionService;
    }
]);