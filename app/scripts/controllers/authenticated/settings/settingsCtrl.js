'use strict';

app.controller('settingsCtrl',
    function ($scope, $stateParams) {
        $scope.tabs = [
			{ title: 'ACCOUNT SETTINGS', viewName:'account', settingsName:'account', path:'views/authenticated/settings/account.html'},
            { title: 'USERS', viewName:'user', settingsName:'users', path:'views/authenticated/settings/users.html'},
            { title: 'SUBSCRIPTIONS', viewName:'subscriptions', settingsName:'subscriptions', path:'views/authenticated/settings/subscriptions.html'},
            { title: 'UPDATES', viewName:'updates', settingsName:'updates', path:'views/authenticated/settings/updates.html'}
        ];

        $scope.tabInit = function(){
            for(var intIndex = 0;intIndex<$scope.tabs.length;intIndex++){
                if($scope.tabs[intIndex].settingsName === $stateParams.settingsName){
                    $scope.selectedIndex = intIndex;
                }
            }
        };

    });