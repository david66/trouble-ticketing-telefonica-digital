
/**
 * @ngdoc controller
 * @name udoModule.controller:listCtrl
 * @description Generic controller to generate the grids.
 */

udoModule.controller('listCtrl', ['$rootScope', '$scope', '$routeParams', '$http','$location', 
    'SEVERITY_LABELS', 'utils', 'common', 'dataProvider',
function($rootScope, $scope, $routeParams, $http, $location, SEVERITY_LABELS, utils, common, dataProvider) {

    // ------------------------------------------------------------------------
    // TOOLBAR
    // ------------------------------------------------------------------------

    $scope.checkActive = function(url) {
        var path = url.replace(/\/ui#/g, '');
        return (path === $location.$$path);
    };

    var saveFilter = function() {
        alert("WIP save filter");
    };

    var buildToolbarLinks = function() {
        $rootScope.toolbarLinks = [];
        dataProvider.loadUserData().then(function() {
            userData = dataProvider.userData();

            if (userData.permissions.check('can_access_contacts')) {       
                $rootScope.toolbarLinks.push({type: 'linki18n', title: 'Contacts', url: '/ui#/tt/contacts/', class: ''});
            }
            if (userData.permissions.check('can_access_incidences')) {
                $rootScope.toolbarLinks.push({type: 'linki18n', title: 'Incidences', url: '/ui#/tt/incidences/', class: ''});
                $rootScope.toolbarLinks.push({type: 'linki18n', title: 'Group Involved Incidences', url: '/ui#/tt/groupinvolvedincidences/', class: 'title-resp'});
            }
            if (userData.permissions.check_wos('can_view_wos')) {
                $rootScope.toolbarLinks.push({type: 'linki18n', title: 'Work Orders', url: '/ui#/tt/workorders/', class: ''});
            };   
            //{type: 'linki18n', title: 'SLA Violations', url: '/ui#/tt/slaviolationlist/', class: ''},
            if (userData.permissions.check('can_access_symptoms')) {
                $rootScope.toolbarLinks.push({type: 'linki18n', title: 'Symptoms', url: '/ui#/tt/symptoms/', class: 'title-resp'});
            }
            if (userData.permissions.check('can_access_problems')) {
                $rootScope.toolbarLinks.push({type: 'linki18n', title: 'Problems', url: '/ui#/tt/problems/', class: 'title-resp'});
            }
            if (userData.permissions.check('can_access_problemtypes')) {
                $rootScope.toolbarLinks.push({type: 'linki18n', title: 'Problem Types', url: '/ui#/tt/problemtypes/', class: 'title-resp'});
            }

            // Update active field
            angular.forEach($rootScope.toolbarLinks, function(link) {
                link.active = $scope.checkActive(link.url) ? 'active' : '';
            });
        });
    };

    buildToolbarLinks();

    $rootScope.toolbarIcons = [
        {type: 'action', name: 'Print', url: '#', icon: 'icon-print', active: '', action: common.portal.print},
        {type: 'action', name: 'Refresh', url: '#', icon: 'icon-refresh', active: '', action: common.portal.refresh}
    ];  

    $rootScope.sidebarLinks = [
        // active should be 'active' (if active section) or ''
        //{name: 'Save Filter', icon: 'icon-filter', action: saveFilter},
        {name: 'Help', icon: 'icon-info-sign', action: common.portal.help, apply: false}
    ];

    // Extends sidebarLinks with default sidebar config
    common.toolbar.build($rootScope.sidebarLinks);
}]);
