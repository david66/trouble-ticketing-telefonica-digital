/**
 * @ngdoc controller
 * @name detailProblemTypeCtrl
 * @description
 *
 * TBD
 *
**/

udoModule.controller(
    'detailProblemTypeCtrl',
    ['$scope', '$rootScope', '$routeParams', 'udoAPI', 'common',
     function($scope, $rootScope, $routeParams, udoAPI, common) {

    // ------------------------------------------------------------------------
    // DATA MODEL
    // ------------------------------------------------------------------------
    var buildModel = function() {
        $scope.fields = {
            code: {
                name: 'ID Problem Type',
                value: $scope.problemtype.code,
                editable: false,
                widget: 'text',
                class: 'span3'
            },
            estimated_time: {
                name: 'Medium Resolution Time',
                value: $scope.problemtype.estimated_time,
                editable: false,
                widget: 'text',
                class: 'span3'
            },
            count: {
                name: 'Count',
                value: $scope.problemtype.count,
                editable: false,
                widget: 'text',
                class: 'span4'
            }
        }
        $scope.description = {
            description: {
                name: 'Problem Type Description',
                value: $scope.problemtype.description,
                widget: 'textarea'
            }

        };
        $scope.affected_resources = {
            affected: {
                data: [],
                widget: 'multitextarea'
            }
        };
        // Fill affected resources model
        for(var i = 0; i < $scope.problemtype.affected.length; i++) {
            $scope.affected_resources.affected.data.push({
                name: 'Affected resource',
                value: $scope.problemtype.affected[i].code
            });
        }
    };

    // ------------------------------------------------------------------------
    // TOOL-BAR / SIDE-BAR ACTIONS
    // ------------------------------------------------------------------------

    var associateProblemTypeAction = function () {
        // TODO: actually perform the action
        alert('TODO: associate problem type action!');
    };

    // ------------------------------------------------------------------------
    // TOOL-BAR / SIDE-BAR DEFINITION
    // ------------------------------------------------------------------------
    // Build sidebar
    var buildSideBar = function(data) {
        $rootScope.sidebarLinks = [
            {name: 'Help', icon: 'icon-info-sign', action: common.portal.help, apply:false}
        ];

        // Extends $rootScope.sidebarLinks with default sidebar config
        common.toolbar.build($rootScope.sidebarLinks);
    };

    var buildBar = function() {

        $rootScope.toolbarLinks = [
            {
                type: 'linki18n',
                title: 'Problem Type',
                url: '#',
                active: '',
                class: 'brand'
            }
        ];

        $rootScope.toolbarIcons = [

        ];

        buildSideBar();
    };

    var init = function() {
        $scope.code = $routeParams.code;
        udoAPI.getDetailProblemType($scope.code).then(
            // Success
            function(response) {
                $scope.problemtype = response;
                buildBar();
                buildModel();
            },
            // Error
            function(response) {
                //TODO: Handle error. Redirect to error page
            });
    };
    init();

}]);

