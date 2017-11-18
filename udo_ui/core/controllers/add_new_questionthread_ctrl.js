
// Just a controller to show the modal: Save new question thread
udoModule.controller('addQuestionThreadModalCtrl',
                     ['$scope', '$http', '$q', 'newQuestionThread',
                      function($scope, $http, $q, newQuestionThread) {
    // VARIABLES
    $scope.buttons  = {
        cancel: "Cancel",
        save:   "Save Question"
    };

    $scope.enterDescription = "Enter a note description";
    $scope.newQuestionThread = newQuestionThread;

    // CHECK QUESTION
    $scope.checkQuestionThread = function(value) {
        //$scope.checkForm(value);
        // TO DO ?
    };

}]);
