'use strict';
app.controller('clientActivityCtrl',
    function($scope, clientService, clientActivityService){
        $scope.isMsgShow = $scope.isDataAvail = false;
        $scope.clientActivityData = [];
        $scope.sessionActivities = [];

        $scope.isActivityDataProcessing = false;
        $scope.isMoreActivities = false;
        $scope.activityCursor = '';

        $scope.client = clientService.getClientObj().id ? clientService.getClientObj() : {};
        var partnerId = $scope.client.id;
        var filterObj = {};

        $scope.getPagedDataAsync = function () {
            $scope.isMsgShow = $scope.isDataAvail = false;

            clientActivityService.fetchClientActivities(partnerId)
                .then(function (data) {
                    if (data.cursor) {
                        $scope.activityCursor = data.cursor;
                        filterObj.cursor = $scope.activityCursor;
                    } else {
                        $scope.activityCursor = '';
                    }

                    if (data.results.length !== 0) {
                        $scope.clientActivityData = data.results;
                        $scope.isMsgShow = false;
                        $scope.isDataAvail = true;
                    } else {
                        $scope.isDataAvail = false;
                        $scope.isMsgShow = true;
                    }
                }, function (error) {
                    toastr.error('Failed retrieving activity data.', 'STATUS CODE: ' + error.status);
                });
        };

        var collapseAnother = function (index) {
            for (var i = 0; i < $scope.clientActivityData.length; i++) {
                if (i != index) {
                    $scope.clientActivityData[i].active = false;
                }
            }
        };

        $scope.fnGetActivities = function (index, sessionId) {
            $scope.clientActivityData[index].active = !$scope.clientActivityData[index].active;
            collapseAnother(index);
            $scope.isActivityDataProcessing = true;

            if ($scope.clientActivityData[index].active) {
                clientActivityService.fetchSessionActivities(partnerId, sessionId)
                    .then(function (data) {
                        if (data.length !== 0) {
                            $scope.isActivityDataProcessing = true;
                            $scope.sessionActivities = data;
                        }
                        $scope.isActivityDataProcessing = false;
                    }, function (error) {
                        toastr.error('Failed retrieving session activities data.', 'STATUS CODE: ' + error.status);
                        $scope.isActivityDataProcessing = false;
                    });
            }
        };

        // Load more sessions functionality.
        $scope.fnLoadMoreSessions = function () {
            if (!$scope.isMoreActivities) {
                $scope.isMoreActivities = true;
                clientActivityService.fetchMoreSessions(partnerId, filterObj)
                    .then(function (data) {
                        if (data.cursor) {
                            $scope.activityCursor = data.cursor;
                            filterObj.cursor = $scope.activityCursor;
                        } else {
                            $scope.activityCursor = '';
                        }

                        if (data.results.length !== 0) {
                            $scope.clientActivityData = $scope.clientActivityData.concat(data.results);
                        }
                        $scope.isMoreActivities = false;
                    }, function (error) {
                        toastr.error('Failed retrieving more sessions data.', 'STATUS CODE: ' + error.status);
                        $scope.isMoreActivities = false;
                    });
            }
        };

        $scope.fnInitClientActivity = function () {
            $scope.getPagedDataAsync();
        };
    }
);
