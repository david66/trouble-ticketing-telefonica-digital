// Dependencies
//
// <!-- JS libraries -->
// <script src="/betacompany/udo_ui/lib/jquery/jquery-1.8.3.min.js"></script>
// <script src="/betacompany/udo_ui/lib/angular/angular-min-1.1.5.js"></script>
// <script src="/betacompany/udo_ui/lib/ui-bootstrap-tpls-0.6.0.js"></script>
// <script src="/betacompany/udo_ui/lib/popover-jq.js"></script>
// <script src="/betacompany/udo_ui/lib/ng-grid/ng-grid-2.0.7.debug.js"></script>
// <script src="/betacompany/udo_ui/lib/ng-grid/ng-grid-flexible-height.js"></script>
//
// Main controller
udoModule.controller ('mainCtrl', ['$scope', '$injector', '$window', '$route', '$rootScope', 
                            '$http', 'VERSION', 'LANG_FORMAT', 'createDialog', 'dataProvider', 'common',
                        function ($scope, $injector, $window, $route, $rootScope, 
                                $http, VERSION, LANG_FORMAT, createDialog, dataProvider, common) {
 
    ////////////////////////////////////////////// XEDITABLE ENABLED/DISABLED SUBMIT BUTTON

    $rootScope.xeditable = {};

    $rootScope.xeditable.master = undefined;

    $rootScope.xeditable.dataBackup = function(value) { 
        $rootScope.xeditable.master = value;
    };

    $rootScope.xeditable.isUnchanged = function(value) { 
        return (($rootScope.xeditable.master === value) || (value === ''));
    };

    ////////////////////////////////////////////// ARRAY WITH ELEMENTS

    $scope.arrayNotEmpty = function(data) {
        return (data instanceof Array) && (data.length);
    };

    ////////////////////////////////////////////// NAVBAR AND TOOLBAR CONFIGURATION

    $scope.$on('$routeChangeStart', function(next, current) {
        $rootScope.toolbarLinks = []; // Empty => Remove (ng-if) for view
        $rootScope.toolbarIcons = []; // Empty => Remove (ng-if) for view
        $rootScope.sidebarLinks = []; // Empty => Remove (ng-if) for view
    });

    ////////////////////////////////////////////// FUNCTIONS CONTROLLER

    $scope.version = VERSION; //UDO prod Version

    // Loading page while loading initial data
    $rootScope.showLoadingPage = true;
    dataProvider.loadUserData().then(function() {
        var userData = dataProvider.userData();
        $rootScope.username = userData.username;
        // Set language relative variables and load translations
        $rootScope.currentLanguage = userData.language;
        $rootScope.formatLanguage = LANG_FORMAT[userData.language];
        var trPromise = $rootScope.load_translations();
        if (typeof(trPromise) !== 'undefined') {
            trPromise.then(function() {
                // Remove loading page when everything is loaded
                $rootScope.showLoadingPage = false;
            });
        }
    });

    /* SIDEBAR HANDLE ACTIONS */
    $scope.handleAction = function(link) {
        if (link.apply != false) {
            link.action.apply(undefined, link.args);
        }
    };

    $scope.href = function(link) {
        if (link.apply != false) {
            common.portal.href(link.url);
        }
    };

    /*ABOUT MODAL CONFIG */
    $scope.openAbout = function () {
        $scope.aboutModal = true;
    };

    $scope.closeAbout = function () {
        $scope.aboutModal = false;
    };

    $scope.opts = {
        backdropFade: true,
        dialogFade:true
    };

    /**
     * @ngdoc function
     * @name launchSimpleModal
     * @description
     *
     * Function for launch a Simple Modal window
     *
     * @alias { launchCancelModal, launchSaveModal, launchOKModal }
     *
     */
    $scope.launchSimpleModal = function() {
        createDialog('/betacompany/udo_ui/core/views/modals/simple-modal.html', {
            id: 'simpleDialog',
            title: 'A Simple Modal Dialog',
            backdrop: true,
            success: {label: 'Success', fn: function() {}}
        });
    };

    $scope.launchCancelModal = $scope.launchSimpleModal;
    $scope.launchSaveModal = $scope.launchSimpleModal;
    $scope.launchOKModal = $scope.launchSimpleModal;

    /**
     * @ngdoc function
     * @name fileDMSUploaded
     * @description
     *
     * Function to print DMS code file in current scope view
     *
     * @param {resp} json with UDo DMS response, tipically {resp} could be:
     *      {"success": False, "detail": "Some was wrong"}
     *      {"success": True, "document_id": "JBUE3"}
     *
     */
    $scope.fileDMSUploaded = function(resp) {
        var data = angular.fromJson(resp);
        $scope.dms_code = data.document_id;
    }

    /**
     * @ngdoc function
     * @name pushRecentEntityId
     * @description
     *
     * Function to push into a bounded stack  all recent entities
     *
     * @param {type} : type of entity from [ contacts, incidences, problems ]
     *        {element}: identification (eid or _id) entity
     *
     */
    $scope.pushRecentEntityId = function(type, element){
        // Use last_visited as a bounded stack
        if ( $.inArray(element, $rootScope.last_visited[type]) < 0 ) {
            $rootScope.last_visited[type].push(element);
            if ($rootScope.last_visited[type].length > 5) {
                $rootScope.last_visited[type].shift();
            }
            $scope.$broadcast('LastVisited', type);
        }
     };

    /**
     * @ngdoc function
     * @name sidebarLinksClass
     * @description
     *
     * Function to get the sidebar class. Enable or disable the sidebar link
     *
     * @param {link} sidebar link
     *
     */
    $scope.sidebarLinksClass = function(link) {
        return ((link.apply == false) ? 'sidebarLink-disabled' : 'sidebarLink-enabled') + ' ' + link.active;
    }

    /* CUSTOM SCROLL BAR */
    //$scope.customizeScrollbar = function(){
    //    $(".customScroll").mCustomScrollbar();
    //}
    //
    //angular.element(document).ready(function () {
    //    $scope.customizeScrollbar();
    //});
    
    /* COLLAPSED */
    $scope.isCollapsed = false;
}]);

// Just a controller to show how to use url parmeters
udoModule.controller('emptyCtrl', ['$scope', '$rootScope', 'createDialog', '$routeParams', function($scope, $rootScope, createDialogService, $routeParams) {
    $scope.eid = $routeParams.eid;

}]);


/**
 * @ngdoc controller
 * @name ErrorModalController
 * @description
 *
 * Just a controller to handle error modals
 *
 *
 */
udoModule.controller('ErrorModalController',['$scope', 'name', 'details',
    function($scope, name, details) {
        $scope.name = name;
        $scope.details = details;
}]);


udoModule.controller('loadingPageCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
    $scope.showLoading = function() {
        return $rootScope.showLoadingPage;
    }
}]);

udoModule.controller('ErrorModalController',['$scope', 'name', 'details',
    function($scope, name, details) {
        $scope.name = name;
        $scope.details = details;
}]);


