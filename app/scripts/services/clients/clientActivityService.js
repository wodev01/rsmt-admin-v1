'use strict';
app.factory('clientActivityService',['$q','ErrorMsg', 'encodeParamService',
    function($q, ErrorMsg, encodeParamService){
        var clientActivityService = {};

        //Fetch Marketing Session data
        clientActivityService.fetchClientActivities = function(partnerId){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + partnerId + '/sessions',
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

        // Fetch activities for specific marketing sessions.
        clientActivityService.fetchSessionActivities = function (partnerId, sessionId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + partnerId + '/sessions/' + sessionId + '/activities',
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

        clientActivityService.fetchMoreSessions = function (partnerId, filterObj) {
            var defer = $q.defer();

            CarglyPartner.ajax({
                url: '/partners/api/crm/' + partnerId + '/sessions' + encodeParamService.getEncodedParams(filterObj),
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

        return clientActivityService;
    }
]);
