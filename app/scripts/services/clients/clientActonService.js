'use strict';
app.factory('clientActonService', ['$q', 'encodeParamService', 'ErrorMsg',
    function ($q, encodeParamService, ErrorMsg) {
        var clientActonService = {};

        // Get Acton Info
        clientActonService.fetchActonInfo = function (partnerId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/acton/' + partnerId + '/info',
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

        // Unlink Acton Account
        clientActonService.unlinkActonAccount = function (partnerId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/acton/' + partnerId + '/unlink',
                type: 'POST',
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

        // Link Acton Account
        clientActonService.linkActonAccount = function (partnerId, paramObj) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/acton/' + partnerId + '/link' + encodeParamService.getEncodedParams(paramObj),
                type: 'POST',
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

        return clientActonService;
    }

]);