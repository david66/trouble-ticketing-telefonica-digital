/**
 * @ngdoc controller
 * @name udoModule.controller:newNavBarCCtrl
 * @property {array} items Links properties to use on view. Each element will
 * contain 'name', 'url', and 'active'. Active will be true or ''. Example:
 * <pre>
 * {name: 'New Work Order', url: '/ui#/tt/newworkorder/', active: ''}
 * </pre>
 * @description Builds the links to create new elements on UDo taking into account
 * user permissions.
 */
udoModule.controller('newNavBarCtrl', ['$scope', 'dataProvider', function($scope, dataProvider) {
    $scope.items = [];
    // Build Lists links taking into account permissions
    dataProvider.loadUserData().then(function() {
        userData = dataProvider.userData();
        // active should be 'active' (if active section) or ''
        if (userData.permissions.check_wos('can_operate_wos')) {
            $scope.items.push({name: 'New Work Order',
                               url: '/ui#/tt/newworkorder/', active: ''});
        }
        if (userData.permissions.check('can_access_problems')) {
            $scope.items.push({name: 'New Problem',
                               url: '/ui#/tt/newproblem/', active: ''});
        }
        if (userData.permissions.check('can_access_problemtypes')) {
            $scope.items.push({name: 'New Problem Type',
                               url: '/ui#/tt/newproblemtype/', active: ''});
        }
        if (userData.permissions.check('can_access_symptoms')) {
            $scope.items.push({name: 'New Symptom',
                               url: '/ui#/tt/newsymptom/', active: ''});
        }
        //TODO: enable tasks and procedures when it is ready
        /*if (userData.permissions.check('can_access_tasks')) {
            $scope.items.push({name: 'New Task',
                               url: '/ui#/tt/newtask/', active: ''});
        }
        if (userData.permissions.check('can_access_procedures')) {
            $scope.items.push({name: 'New Procedure',
                               url: '/ui#/tt/newprocedure/', active: ''});
        }*/
    });
}]);

/**
 * TODO: now just include test data, it should add dinamically the recently
 * visited elements.
 */
udoModule.controller('newNavBarSesionCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {

    $scope.items = {};
    $scope.items['contacts'] = [];
    $scope.items['incidences'] = [];
    $scope.items['workorders'] = [];
    $scope.items['problems'] = [];

    $rootScope.last_visited = {};
    $rootScope.last_visited['contacts'] = [];
    $rootScope.last_visited['incidences'] = [];
    $rootScope.last_visited['workorders'] = [];
    $rootScope.last_visited['problems'] = [];

    $scope.init = function(element) {
        //This function is sort of private constructor for controller
        $scope.element = element;
    };

    $scope.$on('LastVisited', function(event, type) {
        $scope.items[type] = [];
        var i = $rootScope.last_visited[type].length - 1;
        angular.forEach($rootScope.last_visited[type], function(entry){
            $scope.items[type][i] = { name: 'entity id: ' + entry ,
                                      url: '#/tt/'+ type + '/' + entry,
                                      active: ''},
            i--;
        });
    });

    $scope.hasItems = function(type) {
        return $rootScope.last_visited[type].length > 0;
    }



}]);

/**
 * @ngdoc controller
 * @name udoModule.controller:newSubmenuNavBarCCtrl
 * @property {array} items Links properties to use on view. Each element will
 * contain 'name', 'url', and 'active'. Active will be true or ''. Example:
 * <pre>
 * {name: 'New Work Order', url: '/ui#/tt/newworkorder/', active: ''}
 * </pre>
 * @description Builds all links (but the UDO-TT one) on "New Ticket" menu taking into
 * account the user configuration.
 */
udoModule.controller('newSubmenuNavBarCtrl', ['$rootScope', '$scope', 'dataProvider', function($rootScope, $scope, dataProvider) {
    $scope.items = [];
    dataProvider.loadRequesterCustomerServices().then(function() {
        var cs = dataProvider.requesterCustomerServices();
        angular.forEach(cs, function(value, key) {
            if (value['code'] != 'CS_UDOTT') {
                $scope.items.push({name: value['name'],
                               url: '/ui#/tt/newticket/' + value['code'],
                               active: ''});
            }
        });
    });

}]);


/**
 * @ngdoc controller
 * @name udoModule.controller:listNavBarCtrl
 * @property {array} items Links properties to use on view. Each element will
 * contain 'name', 'url', and 'active'. Active will be true or ''. Example:
 * <pre>
 * {name: 'New Work Order', url: '/ui#/tt/newworkorder/', active: ''}
 * </pre>
 * @description Builds all links for "List" menu, taking into account what listings
 * the user can see on UDo application.
 */
udoModule.controller('listNavBarCtrl', ['$scope', 'dataProvider', function DropdownCtrl($scope, dataProvider) {
    $scope.items = [];
    // Build Lists links taking into account permissions
    dataProvider.loadUserData().then(function() {
        userData = dataProvider.userData();
        if (userData.permissions.check('can_access_contacts')) {
            $scope.items.push({name: 'Contact List',
                               url: '/ui#/tt/contacts/', active: ''});
        }
        if (userData.permissions.check('can_access_incidences')) {
            $scope.items.push({name: 'Incidence List',
                               url: '/ui#/tt/incidences/', active: ''});
            $scope.items.push({name: 'Group Involved Incidence List',
                               url: '/ui#/tt/groupinvolvedincidences/', active: ''});
        }
        // TODO: enable when it is fully implemented
        /*if (userData.permissions.check('can_access_sla_violations')) {
            $scope.items.push({name: 'SLA Violations List',
                               url: '/ui#/tt/slaviolationlist/', active: ''});
        }*/
        if (userData.permissions.check_wos('can_view_wos')) {
            $scope.items.push({name: 'Work Order List',
                               url: '/ui#/tt/workorders/', active: ''});
        }
        if (userData.permissions.check('can_access_symptoms')) {
            $scope.items.push({name: 'Symptoms List',
                                url: '/ui#/tt/symptoms/', active: ''});
        }
        if (userData.permissions.check('can_access_problems')) {
            $scope.items.push({name: 'Problem List',
                               url: '/ui#/tt/problems/', active: ''});
        }
        if (userData.permissions.check('can_access_problemtypes')) {
            $scope.items.push({name: 'Problem Type List',
                               url: '/ui#/tt/problemtypes/', active: ''});
        }
    });
}]);

