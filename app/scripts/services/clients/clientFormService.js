'use strict';
app.factory('clientFormService', ['$q', 'ErrorMsg',
    function ($q, ErrorMsg) {
        var clientFormService = {};

        // Fetch forms details
        clientFormService.fetchFormsDetails = function(partnerId, activityType){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + partnerId + '/activities?activityType=' + activityType,
                type: 'GET',
                success: function (data) {
                    defer.resolve(data);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        return clientFormService;
    }
]);