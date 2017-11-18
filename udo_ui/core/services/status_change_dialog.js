// Taken from https://github.com/Fundoo-Solutions/angularjs-modal-service/

udoModule.factory('createStatusChangeDialog', ["createDialog", "$rootScope", "$http",
  function createStatusChangeDialog(createDialog, $rootScope, $http) {
	
    return function (newStatusCode, collection, entity_id, successFn, cancelFn) {
    	$scope = $rootScope.$new();

        $scope.newStatus = {
            status: newStatusCode,
            cause: "",
            causeRequired: "true",
            showDelayDescription: "false",
            delayDescription: ""
        };
        
        if (newStatusCode === 'Delayed' && collection === 'incidences') {
        	$scope.newStatus.showDelayDescription = "true";
        } 

        var launchChangeStatusModal = function() {        	 
            createDialog('/betacompany/udo_ui/core/views/modals/change-status-modal.html', {
                bodyClass: 'modal-body modal-body-extend',
                modalClass: 'modal modal-extend',
                id: 'changeStatusModal',
                title: 'Change to status ' + newStatusCode,
                backdrop: true,
                controller: 'changeStatusModalCtrl',
                form: true, // Form for enabled/disabled Ok button
                nameForm: 'changeStatusForm',
                success: {
                	label: 'Ok', 
                    fn: function() {
                        ///api/tt/incidences/506d45a897fbe51d08000028/status
                        url = '/api/tt/' + collection + '/' + entity_id + '/status';
                                        	   
                        var status_desc = {
                            status: $scope.newStatus.status,
                            cause: $scope.newStatus.cause
                        }
                        if ($scope.newStatus.delayDescription !== "") {
                        	status_desc.delayed_reason = $scope.newStatus.delayDescription.code;
                        }
                        //If it is a problem, and status is Solved, request to automatically
                        //solve related incidences
                        if (collection === 'problems' && $scope.newStatus.status == 'Solved') {
                           status_desc.incidences_to_solve= "ALL";
                        }
                        $http.put(url, status_desc)
                        	.success(function(data, status) {
                        		successFn();
                        	})
                        	.error(function(data, status) {
                        		cancelFn();
                        	});;
                    }
                },
                cancel: {label: 'Cancel', fn: function() {
                	cancelFn();
                }}
            },
            {
                newStatus: $scope.newStatus
            });
        };

        launchChangeStatusModal(); // Show modal
    };

}]);

//Change to status controller.
udoModule.controller('changeStatusModalCtrl', ['$scope', '$http', '$q', 'newStatus', 'dataProvider',
                                             function($scope, $http, $q, newStatus, dataProvider) {
    ////////////////////////////////////////////// VARIABLES
    
    $scope.buttons  = {
                        cancel: "Cancel",
                        save:   "Save Note"
                      };

    $scope.enterCause = "Enter a cause description";
    
    $scope.newStatus = newStatus;
    
    if ($scope.newStatus.showDelayDescription) {
    	dataProvider.loadUserData().then(function() {
            var userData = dataProvider.userData();
            var lan = userData.language;
            
	    	dataProvider.loadDelayReasons(lan).then(function(response) {
	    		// delay reasons
	    		$scope.delayReasons = dataProvider.delayReasons(lan);
	    	});
    	});
    }

    

    ////////////////////////////////////////////// BUILD CONTROLLER
    
    // INIT
    $scope.init = function() {
    };

    // START CONTROLLER
    $scope.init(); 
}]);
