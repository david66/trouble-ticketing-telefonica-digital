
// Just a controller to show the modal: Save new ticket wizard
udoModule.controller('addNotesModalCtrl', ['$scope', '$http', '$q', 'newNote',
                                                        function($scope, $http, $q, newNote) {
    ////////////////////////////////////////////// VARIABLES
    
    $scope.buttons  = {
                        cancel: "Cancel",
                        save:   "Save Note"
                      };

    $scope.enterDescription = "Enter a note description";

    $scope.newNote = newNote;
    $scope.selectedItem = false;

    ////////////////////////////////////////////// MONITORING SELECTED ITEMS

    $scope.afterSelectionChange = function(rowItem, event) {
        var newVal = rowItem.config.selectedItems[0]; // Only 1 row selected (multiSelect: false in config !!!!!)

        $scope.selectedItem = (!newVal) ? false: true;

        if ($scope.selectedItem) {
            $scope.newNote.code = rowItem.config.selectedItems[0].code;
        }

        $scope.checkForm($scope.selectedItem, $scope.newNote.value);
    };

    ////////////////////////////////////////////// BUILD CONTROLLER

    // CHECK FORM
    $scope.checkNote = function(value) {
        $scope.checkForm($scope.selectedItem, value);
    };

    // CHECK FORM
    $scope.checkForm = function(selectedItem, value) {
        $scope.addNotesForm.$invalid = (!selectedItem) || (!value);
    };

    // INIT
    $scope.init = function() {
    };

    // START CONTROLLER
    $scope.init(); 
}]);