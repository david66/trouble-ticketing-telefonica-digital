/**
 * @ngdoc service
 * @name udoModule.service.validations
 * @description UDo service to perform validations and execute actions
 * when errors happens.
 */
udoModule.service('validations',
['dataProvider', function(dataProvider) {
    return {
        /**
         * @ngdoc method
         * @methodOf udoModule.service.validations
         * @name udoModule.service.validations#checkPermissions
         * @param {array} permissions Array of permissions to check
         * @param {function} errorAction action to perform if user
         * has not all permissions
         * @param {function} successAction action to perform if user has
         * all permissions (optional).
         * @description Check if user has all permissions and returns a Promise
         * which will be acomplished when the validation is check. The function
         * will execute ``errorAction`` if any permission fails or
         * ``successAction`` if it is defined and the user has all permissions.
         */
        checkPermissions: function(permissions, errorAction, successAction) {
            return dataProvider.loadUserData().then(function() {
                var hasPermissions = true;
                var userData = dataProvider.userData();
                for(var i = 0; i < permissions.length; i++) {
                    var check_function;
                    if (permissions[i] === 'can_view_wos'){
                        check_function = userData.permissions.check_wos;
                    }
                    else {
                        check_function = userData.permissions.check;
                    }
                    if(!check_function(permissions[i])) {
                        errorAction();
                        hasPermissions = false;
                        break;
                    }
                }
                if(hasPermissions && (typeof successAction === 'function')) {
                    successAction();
                }
            });
        }
    }
}]);

/**
 * @ngdoc service
 * @name udoModule.service:errors
 * @description UDo service to provide utilities to handle errors
 */
udoModule.service('errors',
['$rootScope', '$location', 'createDialog',
 function($rootScope, $location, createDialog) {
    return {
        /**
         * @ngdoc method
         * @methodOf udoModule.service:errors
         * @name udoModule.service:errors:forbidden
         * @description Handles the forbidden error by redirecting the
         * user to forbidden page and cleaning up navigation bars
         */
        forbidden: function() {
            $rootScope.toolbarLinks = [];
            $rootScope.toolbarIcons = [];
            $rootScope.sidebarLinks = [];
            $location.path('/tt/forbidden/');
        },

        /**
         * @ngdoc function
         * @methodOf udoModule.service:errors
         * @name udoModule.service:errors:launchErrorModal
         * @name launchErrorModal
         * @description Function for launch a Error Modal window
         * @param {code} eror code
         * @param {description} a full or detailed error description
         *
         */
        launchErrorModal: function(code, description) {
            createDialog('/betacompany/udo_ui/core/views/modals/error-modal.html', {
                id: 'errorDialog',
                title: 'An error was happend',
                backdrop: true,
                controller: 'ErrorModalController',
                success: {label: 'Success', fn: function() {}}
            }, {
                name: code,
                details: description
            });
        }
    }
}]);
