'use strict';
app.factory('customerTemplateService',['$q', 'ErrorMsg',
    function($q, ErrorMsg) {
        var customerTemplateService = {};

        // Fetch customer list templates
        customerTemplateService.fetchCustomerListTemplates = function (partnerId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + partnerId + '/email-templates',
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

        return customerTemplateService;
    }
]);