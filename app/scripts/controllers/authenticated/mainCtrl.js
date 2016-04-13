'use strict';

/**
 * @ngdoc function
 * @name rsmtAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the rsmtAdminApp
 */
angular.module('rsmtAdminApp')
    .controller('MainCtrl', function ($scope, $state, $location, $cookies, $mdSidenav, $mdUtil, cookieName, localStorage) {

        $scope.fnToggleSideNav = function (componentId) {
            $mdSidenav(componentId).toggle().then(function () {
                if ($mdSidenav(componentId).isOpen()) {
                    var leftNavElem = $('.left-side-nav').parent().find('md-backdrop').first();
                    $(leftNavElem).css('z-index', '61');
                }
            });
        };

        $scope.fnIsActive = function (viewLocation) {
            return viewLocation === $location.path() ? 'md-accent' : '';
        };

        $scope.fnLogout = function () {
            CarglyPartner.logout(function () {
                $cookies.remove(cookieName);
                $state.go('login');
            }, function () {
            });
        };

        $scope.fnStateSettings = function () {
            $state.go('main.settings', {'settingsName': 'account'});
        };

        $scope.fnInitMain = function () {
            if (localStorage.getItem('userObj')) {
                $scope.userObj = JSON.parse(localStorage.getItem('userObj'));
            }
        };
    });