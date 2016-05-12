'use strict';
app.factory('shopLocationsCustomerListService', ['$q', 'ErrorMsg',
    function ($q, ErrorMsg) {
        var shopLocationsCustomerListService = {};

        // Get customer list data
        shopLocationsCustomerListService.getCustomerListData = function (locId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/customer-lists',
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

        shopLocationsCustomerListService.getCustomerList = function (locId, customerListId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/customer-lists/' + customerListId,
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

        shopLocationsCustomerListService.fnAddToCustomerListPreview = function (locId, filterObj) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/customer-lists',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(filterObj),
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

        shopLocationsCustomerListService.fnGetPreviewValues = function (locId, filterObj) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/customer-list-preview',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(filterObj),
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

        shopLocationsCustomerListService.fnDownloadPreviewListCSV = function (locId, customerListId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/customer-lists/' + customerListId + '/results.csv',
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

        shopLocationsCustomerListService.fnUpdateCustomerList = function (locId, filterObj) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/customer-lists/' + filterObj.id,
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(filterObj),
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

        shopLocationsCustomerListService.fnRemoveCustomerList = function (locId, customerListId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/customer-lists/' + customerListId,
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

        shopLocationsCustomerListService.fetchFilterValues = function (locId, query) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/customer-list-filter-values/' + query,
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

        /*-------------- Getter and Setter Method ---------*/
        var customerListObj = {};
        shopLocationsCustomerListService.setCustomerListObj = function (newObj) {
            customerListObj = newObj;
        };

        shopLocationsCustomerListService.getCustomerListObj = function () {
            return customerListObj;
        };

        return shopLocationsCustomerListService;
    }

]);