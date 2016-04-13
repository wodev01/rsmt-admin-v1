'use strict';
app.factory('GetUserService',['$q', '$cookies', 'cookieName', 'localStorage', 'ErrorMsg',
    function($q, $cookies, cookieName, localStorage, ErrorMsg) {
        var GetUserService = {};

        //Get clients for current user partner:
        GetUserService.fetchUser = function () {
            var token = $cookies.get(cookieName);
            var defer = $q.defer();
            CarglyPartner._getUser(token, function (response) {
                localStorage.setItem('userObj',JSON.stringify(response));
                defer.resolve(response);
            },function(error){
                if (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                }
            });
            return defer.promise;
        };

        return GetUserService;
    }
]);
