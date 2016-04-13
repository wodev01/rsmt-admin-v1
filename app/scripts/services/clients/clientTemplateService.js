'use strict';
app.factory('clientTemplateService', ['$q', 'ErrorMsg',
    function ($q, ErrorMsg) {
        var clientTemplateService = {};

        // Fetch client templates
        clientTemplateService.fetchClientTemplates = function (partnerId) {
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

        // Create client template
        clientTemplateService.createClientTemplate = function (partnerId, template) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + partnerId + '/email-templates',
                type: 'POST',
                data: template,
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

        // Edit client template
        clientTemplateService.editClientTemplate = function (partnerId, template) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + partnerId + '/email-templates/' + template.id,
                type: 'POST',
                data: template,
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

        // Delete client template
        clientTemplateService.removeClientTemplate = function (partnerId, templateId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + partnerId + '/email-templates/' + templateId,
                type: 'DELETE',
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

        // Interpolate client template
        clientTemplateService.interpolateClientTemplate = function (template) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/interpolate',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(template),
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

        // Send test email
        clientTemplateService.sendTestEmail = function (partnerId, testEmailData) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + partnerId + '/send-email',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(testEmailData),
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

        /*-------------- Getter and Setter Method ---------*/
        var templateObj = {};
        clientTemplateService.setTemplateObj = function(newObj){
            templateObj = newObj;
        };
        clientTemplateService.getTemplateObj = function(){
            return templateObj;
        };

        return clientTemplateService;
    }

]);