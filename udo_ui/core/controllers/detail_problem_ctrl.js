/**
 * @ngdoc controller
 * @name detailProblemCtrl
 * @description
 *
 * TBD
 *
**/

udoModule.controller(
    'detailProblemCtrl',
    ['$scope', '$rootScope', '$routeParams', '$http', '$q', '$filter',
     'dataProvider', 'createDialog', 'udoAPI', 'annotationsOp', 'questionsOp', 'modalGen',
     'createStatusChangeDialog', 'utils', 'SEVERITY_LABELS', 'common',
     function($scope, $rootScope, $routeParams, $http, $q, $filter,
              dataProvider, createDialog, udoAPI, annotationsOp, questionsOp, modalGen, createStatusChangeDialog,
              utils, SEVERITY_LABELS, common) {

    // ------------------------------------------------------------------------
    // VARIABLES
    // ------------------------------------------------------------------------
    $scope.record = { detail: [] };
    $scope.annotations = [];
    $scope.relatedincidencesproblem = [];
    $scope.affected = {
        affected: {
            data: [],
            widget: 'multitextarea'
        }
    };

    // ------------------------------------------------------------------------
    // ANNOTATIONS
    // ------------------------------------------------------------------------

    // Add new annotation
    var addNotes = function() {
        var result = [$scope.problem, $scope];
        common.notes.add($scope,
                         '/api/tt/problems/',
                         $scope.problem._id,
                         result, function() {utils.html.scrollToDiv('areaNotes')});
    };

    // Update annotations
    $scope.changeAnnotation = function(index, annotation, data) {
        var result = [$scope.problem, $scope];
        common.notes.changeAnnotation('/api/tt/problems/',
                                      $scope.problem._id,
                                      index,
                                      annotation,
                                      data,
                                      result);
    };


    // ------------------------------------------------------------------------
    // ATTACHMENTS
    // ------------------------------------------------------------------------

    // Attach document
    var attachDocument = function() {
        common.attachments.attach(); // Required "file-upload" directive in view
    };

    // Add attachment to model
    $scope.addAttachment = function(resp) {
        common.attachments.add(resp, $scope.problem.attachments);
        //utils.html.scrollToDiv('problemDetail');
    };

    // ------------------------------------------------------------------------
    // SIDEBAR
    // ------------------------------------------------------------------------

    // Show problem history modal
    var showProblemHistory = function() {
        var getProblemDetail = udoAPI.getDetailProblem($scope._id);
        $q.all([getProblemDetail]).then(function(response) {
            var problem = response[0];
            if (!problem.history) {
                problem.history = [];
            }
            common.history.showHistory(problem,
                                       $scope._id,
                                       'problemHistModal',
                                       'Problem History');
        });
    };

    // Show status problem history modal
    var showStatusHistory = function() {
        var getProblemDetail = udoAPI.getDetailProblem($scope._id);
        $q.all([getProblemDetail]).then(function(response) {
            var problem = response[0];

            common.history.showStatusHistory(problem,
                                             $scope._id,
                                             'statHistModal',
                                             'Status History');
        });
    };


    // Assign to me
    var assignToMe = function(isDelegation) {
        var operations = [];
        var assignToMeOp;
        createDialog({
            template: 'The Problem with id ' + $scope.eid + ' will be assigned to '+ $scope.username + '!',
            id: 'assignMeProblem',
            title: 'Assign to me',
            backdrop: true,
            success: {label: 'Ok',
                      fn: function() {
                          if (isDelegation) {
                              assignToMeOp = $http.put('/api/tt/problems/' + $scope._id + '/delegation',
                                  angular.toJson({'operator': $scope.username}))
                                      .success(function(data) {
                                          reloadProblem();
                                      })
                                      .error(function(data) {
                                      }); 
                          }
                          else {
                              assignToMeOp = $http.post('/api/tt/problems/' + $scope._id + '/responsible/operator',
                                  angular.toJson('current'))
                                      .success(function(data) {
                                          reloadProblem();
                                  })
                              .error(function(data) {
                               });
                          operations = [assignToMeOp];
                          return $q.all(operations);
                          }
                      }
                     },
            cancel: {label: 'Cancel',
                     fn: function() {
                         assignToMeOp = $scope.problem.next_actions;
                         operations = [assignToMeOp];
                         return $q.all(operations);
                     }
                    },
        });
    }

    // Link Incidence
    var linkIncidence = function() {
        var title = "Link Incidence to this problem";
        $scope.newIncidence = {
            urlPossibleCustomerServices: 'api/tt/customer_service/',
            problem_id: $scope.problem._id,
        };

        createDialog('/betacompany/udo_ui/core/views/modals/link-incidence-from-problem-modal.html', {
            bodyClass: 'modal-body modal-body-extend',
            modalClass: 'modal modal-extend',
            id: 'linkIncidenceModal',
            title: title,
            backdrop: true,
            controller: 'linkIncidenceModalCtrl',
            form: true, // Form for enabled/disabled Ok button
            nameForm: 'linkForm',
            success: {
                label: 'Ok',
                fn: function() {
                    var url = '/api/tt/problems/' + $scope.problem._id + '/incidences/';
                    var inc = angular.toJson($scope.newIncidence.newIncidence._id);
                    $http.post(url, inc)
                        .success(function(data, status) {
                            reloadProblem();
                        })
                        .error(function(data, status) {
                            //$window.alert(data.detail);
                            reloadProblem();
                        });
                }
            },
            cancel: {label: 'Cancel', fn: function() {
            }}
        },
        {
            newIncidence: $scope.newIncidence
        });
    };

    // Link Service
    var linkService = function() {
        var title = "Link Service to this problem";
        $scope.newService = {
            urlPossibleCustomerServices: 'api/catalogue/service/customer/',
            problem_id: $scope.problem._id,
        };

        createDialog('/betacompany/udo_ui/core/views/modals/link-cs-from-problem-modal.html', {
            bodyClass: 'modal-body modal-body-extend',
            modalClass: 'modal modal-extend',
            id: 'linkServiceModal',
            title: title,
            backdrop: true,
            controller: 'linkServiceModalCtrl',
            form: true, // Form for enabled/disabled Ok button
            nameForm: 'linkForm',
            success: {
                label: 'Ok',
                fn: function() {
                    var url = '/api/tt/problems/' + $scope.problem._id + '/affected';
                    var service = {
                        "code": $scope.newService.newCustomerService.code,
                        "collection": "service.customer"
                    };
                    $http.put(url, service)
                        .success(function(data, status) {
                            reloadProblem();
                        })
                        .error(function(data, status) {
                            //$window.alert(data.detail);
                            reloadProblem();
                        });
                }
            },
            cancel: {label: 'Cancel', fn: function() {
            }}
        },
        {
            newService: $scope.newService
        });
    };



    // ------------------------------------------------------------------------
    // EDITABLE FUNCTIONS
    // ------------------------------------------------------------------------

    // Update data in server called from view (onbeforesave in editable directive)
    $scope.updateData = function(field, newValue) {
        var oldValue = field.value;

        var successFn = function() {
            reloadProblem();
        };

        var cancelFn = function() {
            field.value = oldValue;
        };

        if (field.name === 'Status') {
            createStatusChangeDialog(newValue,
                                     "problems",
                                     $scope.problem._id,
                                     successFn,
                                     cancelFn);
        }
        else {
            var url = '/api/tt/problems/' + $scope.problem._id + '/' + field.keySave;

            // Convert newValue
            var updateValue = newValue;
            switch(field.widget) {
                case "number":
                    updateValue = new String(newValue);
                    break;
                case "date":
                case "time":
                    if (newValue instanceof Date) {
                        updateValue = utils.date.local2utc(newValue);
                    }
                    break;
            }

            var d = $q.defer();
            $http.put(url, angular.toJson(updateValue)).success(function(res) {
                    d.resolve();
                }).error(function(e) {
                    d.reject('Error');
                });
            return d.promise;
        }
    };

    // Show data for array, date or time field selection called from view:
    //  <a editable-select="field.value">{{showData(status)}}</a>
    //  <a editable-bsdatetime="field.value">{{showData(date)}}</a>ø
    $scope.showData = function(param) {
        return common.editable.showData(param);
    };

    // ------------------------------------------------------------------------
    // STATUS
    // ------------------------------------------------------------------------

    // Get possible statuses (status workflow)
    var getPossibleStatuses = function() {
        return common.status.next('api/tt/problems/',
                                  $scope.problem._id);
    }

    // ------------------------------------------------------------------------
    // DATA MODEL
    // ------------------------------------------------------------------------
    var buildModel = function() {
        // Set a default value for problem  severity and priority
        default_severity_type = [ { key: 0, name: "Cosmetic"}, { key: 1, name: "Slight"},
                                  { kay: 2, name: "Minor"}, { key: 3, name: "Major"},
                                  { key: 4, name: "Major high"}, { key: 5, name: "Critical"} ];
        default_priority_type = [ { key: 0, name: "Minor"}, { key: 1, name: "Minor high"}, 
                                  { key: 2, name: "Normal"}, { key:3, name: "Major"}, 
                                  { key: 4, name: "Major high"}, { key:5, name: "Critical"} ]

        $scope.record.detail =  [{
            code: {
                name: 'Problem ID',
                value: $scope.problem.eid,
                editable: false,
                widget: 'text',
                class: 'span1'
            },
            status: {
                name: 'Status',
                editable: true,
                widget:   'array',
                type:     getPossibleStatuses(),
                value:    $scope.problem.status,
                name:     'Status',
                info:   {
                            btn: 'icon-info-sign',
                            title: $filter('i18n')('Status info'),
                            // WIP Refactor with isDefined
                            cause: ($scope.problem.status_change.last().cause) ? 
                                $scope.problem.status_change.last().cause : "",
                            // WIP Refactor with isDefined
                            description: ($scope.problem.status_change.last().delayed_reason) ? 
                                $scope.problem.status_change.last().delayed_reason.code : "",
                            class:    'statusClass'

                        },
                keySave:  'status', 
                onchange: function() {
                    this.type = getPossibleStatuses();
                }
            },
            severity: {
                value:    SEVERITY_LABELS[$scope.problem.severity],
                editable: false,
                name:     'Severity',
                widget:   'array',
                type:     default_severity_type,
                keySave:  'severity'
            },
            priority:  {
                value:    $scope.problem.priority,
                editable: false,
                name:     'Priority',
                widget:   'array',
                type:     default_priority_type,
                keySave:  'priority'
            },
            submission_date:  {
                value:    $scope.problem.status_change[0]['start'],
                editable: false,
                name:     'Submission Date',
                widget:   'date'
            },
            target_date:  {
                value:    $scope.problem.target_date,
                editable: false,
                name:     'Target Date',
                widget:   'date'
            },
            responsible_user: {
                value:    $scope.problem.responsible.current.operator,
                editable: false,
                name:     'Responsible',
                widget:   'text'
            },
            responsible_group: {
                value:    $scope.problem.responsible.current.group,
                editable: false,
                name:     'Responsible Group',
                widget:   'text'
            },
            type: {
                name: 'Problem Type',
                value: $scope.problem.type.code,
                editable: false,
                widget: 'text',
                class: 'span2'
            },
            description: {
                name: 'Problem Type Description',
                value: $scope.problem.type.description,
                editable: false,
                widget: 'text',
                class: 'span2'
            },

        }];

        $scope.affected.affected.data.clear();
        // Fill affected model
        for(var i = 0; i < $scope.problem.affected.length; i++) {
            $scope.affected.affected.data.push({
                name: 'Affected',
                value: $filter('i18n')($scope.problem.affected[i].collection) + ': ' +
                    $scope.problem.affected[i].code + ' '
            });
        }

        $scope.symptoms = {
            element: {
                data: [],
                widget: 'multitextarea'
            }
        };
        // Fill symptoms model
        angular.forEach($scope.problem.type.symptoms, function (key, symptom) {
            $scope.symptoms.element.data.push({
                name: 'Related Symptom',
                value: symptom + ' ' + key + '%'
            });
        });

        $scope.solvingprocedures = {
            element: {
                data: [],
                widget: 'multitextarea'
            }
        };
        // Fill solvingprocedures model
        for(var i = 0; i < $scope.problem.type.solvingprocedures.length; i++) {
            $scope.solvingprocedures.element.data.push({
                name: 'Solving procedure',
                value: $scope.problem.type.solvingprocedures[i].procedure.code
            });
        }
    };


    // Build attachments
    var buildAttachments = function(data) {
        $scope.attachments = data.attachments || [];
        $scope.upload_detail_problem_url = '/api/dms/problem/' + $scope.problem._id + '/upload';
        $rootScope.upload_detail_url = '/api/dms/problem/' + $scope.problem._id + '/upload';
        // Attachments management on problem detail
        $scope.removeAttachment = common.attachments.removeWithActions(function(attachment) {
            var url = '/api/tt/problems/' + $scope.problem._id +
                '/attachments/' + '?uri=' + attachment.uri;
            $http.delete(url).success(function() {
                // TODO: refresh problem?
            });
        });
    };

    // ------------------------------------------------------------------------
    // TOOL-BAR / SIDE-BAR ACTIONS
    // ------------------------------------------------------------------------   
    var linkResourceAction = function () {
        // TODO: actually perform the action
        alert('TODO: link incidence action!');
    };

    // ------------------------------------------------------------------------
    // TOOL-BAR / SIDE-BAR DEFINITION
    // ------------------------------------------------------------------------
    // Build sidebar
    var buildSideBar = function(data) {
        $rootScope.sidebarLinks = [
            {name: 'Assign to me', icon: 'icon-link', action: assignToMe},
            {
                name: 'Link with a Incidence',
                icon: 'icon-link',
                action: linkIncidence
            },
            // {
            //     name: 'Link Resource',
            //     icon: 'icon-link',
            //     action: linkResourceAction
            // },
            {
                name: 'Link with a Service',
                icon: 'icon-link',
                action: linkService
            },
            {name: 'Attach Document', icon: 'icon-paperclip', action: attachDocument},
            {name: 'Add Note', url: '#', icon: 'icon-file-text', action: addNotes},
            {name: 'State History', icon: 'icon-time', action: showStatusHistory},
            {name: 'Problem History', icon: 'icon-time', action: showProblemHistory},
            {name: 'Help', icon: 'icon-info-sign', action: common.portal.help, apply: false}
        ];

        // Extends $rootScope.sidebarLinks with default sidebar config
        common.toolbar.build($rootScope.sidebarLinks);
    };



    var buildBar = function() {

        $rootScope.toolbarLinks = [
            {type: 'link', title: '#'+$scope.eid, url: '#', active: '', class: 'brand'},
            {
                type: 'linki18n',
                title: 'Problem',
                url: '#',
                active: '',
                class: 'brand'
            }
        ];

        $rootScope.toolbarIcons = [

        ];

        buildSideBar();

    };

    $scope.problemHasAssociatedIncidences = function() {
        if ($scope.problem && $scope.problem.incidences && !(jQuery.isEmptyObject($scope.problem.incidences))) {
            return true;
        }
        else {
            return false;
        }
    };
    var reloadProblem = function() {
        udoAPI.getDetailProblem($scope._id).then(
            // Success
            function(response) {
                $scope.problem = response;

                // Reference to annotations
                $scope.annotations = $scope.problem.annotations =
                    annotationsOp.buildAnnotations($scope.problem.annotations || []);

                buildSideBar();

                if ($scope.problem && $scope.problem.incidences && !(jQuery.isEmptyObject($scope.problem.incidences))) {
                    udoAPI.getRelatedIncidences($scope.problem._id).then(
                    // Success
                    function(response) {
                        $scope.relatedincidencesproblem.clear();
                        for(var i = 0; i < response.length; i++) {
                            $scope.relatedincidencesproblem.push(response[i]);
                        }
                        buildModel();
                    },
                    // Error
                    function(response) {
                        //TODO: Handle error. Redirect to error page
                    });
                }
                else {
                    buildModel();
                }
            }
        );

    }

    $scope.init = function() {
        $scope._id = $routeParams.eid;  // eid here is just _id

        $scope.upload_detail_problem_url = '/api/dms/problem/' + $scope._id + '/upload';

        udoAPI.getDetailProblem($scope._id).then(
            // Success
            function(response) {
                var data = $scope.problem = response;
                // Update _id, and eid values
                $scope._id = data._id;
                $scope.eid = data.eid;

                // Set current problem as a recented visited
                $scope.pushRecentEntityId('problems', $scope.eid);

                // Reference to annotations
                $scope.annotations = $scope.problem.annotations =
                    annotationsOp.buildAnnotations($scope.problem.annotations || []);


                buildBar();

                udoAPI.getRelatedIncidences($scope.problem._id).then(
                    // Success
                    function(response) {
                        $scope.relatedincidencesproblem.clear();
                        for(var i = 0; i < response.length; i++) {
                            $scope.relatedincidencesproblem.push(response[i]);
                        }
                        buildModel();
                    },
                    // Error
                    function(response) {
                        //TODO: Handle error. Redirect to error page
                    });

                // Build attachments
                buildAttachments(data);
            },
            // Error
            function(response) {
            });



    };
    $scope.init();

}]);

udoModule.controller('linkIncidenceModalCtrl', ['$scope', '$http', 'newIncidence',
                                             function($scope, $http, newIncidence) {
    ////////////////////////////////////////////// VARIABLES
    $scope.newIncidence = newIncidence;

    $http.get(newIncidence.urlPossibleCustomerServices).then(function(result) {
        $scope.newIncidence.css = result.data;
    });

    $scope.afterCustomerServiceSelection = function(cs) {

        var url = 'api/tt/incidences/';
        url += '?status=Active&status=New&status=Delayed&status=Restored&';
        url += 'customerservice='+ $scope.newIncidence.newCustomerService;
        url += '&problem=!' + $scope.newIncidence.problem_id;
        url += '&type=Claim&detailed=true&sord=desc&rows=100';

        $http.get(url).then(function(result) {
            $scope.newIncidence.incidences = result.data;
        });

    }



    ////////////////////////////////////////////// BUILD CONTROLLER

    // INIT
    $scope.init = function() {
    };

    // START CONTROLLER
    $scope.init();
}]);


udoModule.controller('linkServiceModalCtrl', ['$scope', '$http', 'newService',
                                             function($scope, $http, newService) {
    ////////////////////////////////////////////// VARIABLES
    $scope.newService = newService;

    $http.get(newService.urlPossibleCustomerServices).then(function(result) {
        $scope.newService.css = result.data;
    });


    ////////////////////////////////////////////// BUILD CONTROLLER

    // INIT
    $scope.init = function() {
    };

    // START CONTROLLER
    $scope.init();
}]);
