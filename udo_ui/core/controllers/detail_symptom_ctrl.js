/**
 * @ngdoc controller
 * @name detailSymptomCtrl
 * @description
 *
 * TBD
 *
**/

udoModule.controller(
    'detailSymptomCtrl',
    ['$scope', '$rootScope', '$routeParams', 'udoAPI',
     function($scope, $rootScope, $routeParams, udoAPI) {

    // ------------------------------------------------------------------------
    // DATA MODEL
    // ------------------------------------------------------------------------
    var buildModel = function() {
        $scope.fields = {
            code: {
                name: 'Symptom Code',
                value: $scope.symptom.code,
                editable: false,
                widget: 'text',
                class: 'span1'
            },
            name: {
                name: 'Symptom Short Name',
                value: $scope.symptom.name,
                editable: false,
                widget: 'text',
                class: 'span2'
            },
            description: {
                name: 'Symptom Description',
                value: $scope.symptom.description,
                editable: false,
                widget: 'textarea',
                class: 'span3'
            }
        }

        $scope.problems = {
            affected: {
                data: [],
                widget: 'multitextarea'
            }
        };

        // 'cook' problems
        angular.forEach($scope.symptom.problems, function (key, problem) {
            $scope.problems.affected.data.push({
                name: 'Related Problem Type',
                value: problem
            });
        });


        // Fill affected resources model
        for(var i = 0; i < $scope.symptom.problems; i++) {
            $scope.problems.affected.data.push({
                name: 'Affected resource',
                value: $scope.symptom.problems
            });
        }


    };


    // ------------------------------------------------------------------------
    // TOOL-BAR / SIDE-BAR DEFINITION
    // ------------------------------------------------------------------------
    var buildBar = function() {

        $rootScope.toolbarLinks = [
            {
                type: 'linki18n',
                title: 'Symptom',
                url: '#',
                active: '',
                class: 'brand'
            }
        ];

        $rootScope.toolbarIcons = [

        ];

        $rootScope.sidebarLinks = [

        ];

    };
    
    $scope.init = function() {
        $scope.code = $routeParams.code;
        udoAPI.getDetailSymptom($scope.code).then(
            // Success
            function(response) {
                $scope.symptom = response;
                buildBar();
                buildModel();
            },
            // Error
            function(response) {
                //TODO: Handle error. Redirect to error page
            });
    };
    $scope.init();

}]);

