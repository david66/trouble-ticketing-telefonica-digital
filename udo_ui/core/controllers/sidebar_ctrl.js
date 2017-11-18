/**
 * @ngdoc controller
 * @name newNavBarCCtrl
 * @description
 *
 * TBD: Sidebar controller
 *
 *
 */
udoModule.controller('sidebarCtrl', ['$scope', function($scope) {
    $scope.mainLinks = [
        // active should be 'active' (if active section) or ''
        {name: 'UDo Trouble Ticketing',
            url: '/ui#/', icon: 'icon-home', active: 'active'}
    ];
}]);
