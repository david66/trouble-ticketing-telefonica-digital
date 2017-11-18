/**
 * @ngdoc controller
 * @name widgetGaCtrl
 * @description
 *
 * TBD: Widget controler List
 *
 *
 */
udoModule.controller('widgetGaCtrl', ['$scope', function DropdownCtrl($scope) {
    $scope.items = [
        "Tickets Unresolved",
        "Unallocated Tickets",
        "Outstanding Tickets",
        "Tickets Newly Solved",
        "All Unsolved Tickets"
    ];
}]);

/**
 * @ngdoc controller
 * @name widgetTcCtrl
 * @description
 *
 * TBD: 
 *
 *
 */
udoModule.controller('widgetTcCtrl', ['$scope', function DropdownCtrl($scope) {
    $scope.items = [
        "Processed Tickets: ?",
        "Pending Tickets: ?",
        "Unproc. Tickets: ?"
    ];
}]);

/**
 * @ngdoc controller
 * @name widgetHlvCtrl
 * @description
 *
 * TBD: 
 *
 *
 */
udoModule.controller('widgetHlvCtrl', ['$scope', function DropdownCtrl($scope) {
    $scope.items = [
        "Tickets Unresolved",
        "Unallocated Tickets",
        "Outstanding Tickets",
        "Tickets Newly Solved",
        "All Unsolved Tickets"
    ];
}]);
