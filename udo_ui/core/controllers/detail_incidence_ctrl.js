/**f
 * @ngdoc controller
 * @name detailIncidenceCtrl
 * @description
 *
 * TBD: Controller Incidence
 *
 *
 */
udoModule.controller(
    'detailIncidenceCtrl',
     ['$scope', '$rootScope', '$routeParams', '$filter', '$http', '$q',
      'createStatusChangeDialog', 'udoAPI', 'annotationsOp', 'questionsOp', 'modalGen',
      'createDialog', 'common', '$window', 'utils', 'dataProvider', 'SEVERITY_LABELS',
       function($scope, $rootScope, $routeParams, $filter, $http, $q,
                createStatusChangeDialog, udoAPI, annotationsOp, questionsOp, modalGen, 
                createDialog, common, $window, utils, dataProvider, SEVERITY_LABELS) {

    // ------------------------------------------------------------------------
    // VARIABLES
    // ------------------------------------------------------------------------

    $scope.record = { detail: [], data: [], tabs: [] };
    $scope.annotations = [];
    $scope.attachments = [];
    $scope.relatedproblemsincidence = [];

    $scope.getRepairDate = utils.date.getRepairDate;
    $scope._id_inc = $routeParams.eid;
    $scope.available_sla = "undefined";
    $scope.getSemaphoreImageUrl = utils.tt.getSemaphoreImageUrl;

    var dataParams = undefined;
    var dataValues = undefined;


    var getLabelInfo = function() {
        var info = [];

        if ($scope.incidence && $scope.incidence.responsible.current.operator) {
            info.push({ title: 'Assigned', class: 'label label-assigned', icon: 'icon-user' });
        }

        if ($scope.incidence && $scope.incidence.responsible.delegations) {
            info.push({ title: 'Delegated', class: 'label label-delegated', icon: 'icon-mail-forward' });
        }

        for (i=0; i<$rootScope.toolbarLinks.length; i++) {
            var link = $rootScope.toolbarLinks[i];
            if (link.hasOwnProperty('title')) {
                if (link.title == "Incidence") {
                    link.info = info; // Reset and assign
                    break;
                }
            }
        }
    };

    // ------------------------------------------------------------------------
    // ANNOTATIONS
    // ------------------------------------------------------------------------

    // Add new annotation
    var addNotes = function() {
        var result = [$scope.incidence, $scope];
        common.notes.add($scope, 
                         '/api/tt/incidences/', 
                         $scope.incidence._id, 
                         result,
                         function() {
                             utils.html.scrollToDiv('areaNotes')
                         });
    };

    // Update annotations
    $scope.changeAnnotation = function(index, annotation, data) {
        var result = [$scope.incidence, $scope];
        common.notes.changeAnnotation('/api/tt/incidences/', 
                                      $scope.incidence._id, 
                                      index, 
                                      annotation, 
                                      data, 
                                      result);
    };

    // ------------------------------------------------------------------------
    // QUESTIONS
    // ------------------------------------------------------------------------
    // Add new question thread
    var addQuestionThread = function() {
        questionsOp.launchAddQuestionThreadModal($scope, 'conversation', function() {
            var newQuestionThread = $scope.conversation[$scope.conversation.length - 1];
            var newTopic = newQuestionThread.text.trim();
            $http.post('/api/tt/contacts/' + $scope.contact._id + '/conversation/', 
                       angular.toJson(newTopic))
                 .success(function(conversation_id) {
                     $http.post('/api/tt/contacts/' + $scope.contact._id + '/conversation/' + 
                                parseInt(conversation_id) + '/interactions/',
                                newQuestionThread)
                          .success(function(interaction_id) {
                              $scope.init();
                          });
                 });
        });
    };


    // ------------------------------------------------------------------------
    // ATTACHMENTS
    // ------------------------------------------------------------------------

    // Attach document
    var attachDocument = function() {
        common.attachments.attach(); // Required "file-upload" directive in view
        utils.html.scrollToDiv('areaAttachments');
    };

    // Add file attachment to model
    $scope.addAttachment = function(resp) {
        common.attachments.add(resp, $scope.attachments);
        utils.html.scrollToDiv('areaAttachments');
    };

    // ------------------------------------------------------------------------
    // SIDEBAR
    // ------------------------------------------------------------------------

    // Show ticket history modal
    var showTicketHistory = function() {
        common.history.showHistory($scope.incidence.contact, 
                                   $scope.eid_contact, 
                                   'ticketHistModal', 
                                   'Ticket History');
    };
    
    // Show incidence history modal
    var showIncidenceHistory = function() {
        var getIncidenceDetail = udoAPI.getIncidenceDetail($scope._id_inc);
        $q.all([getIncidenceDetail]).then(function(response) {
            var incidenceContact = response[0];

            common.history.showHistory(incidenceContact, 
                                       $scope.eid_contact, 
                                       'incHistModal', 
                                       'Incidence History');
        });
    };

    // Show status incidence history modal
    var showStatusHistory = function() {
        var getIncidenceDetail = udoAPI.getIncidenceDetail($scope._id_inc);
        $q.all([getIncidenceDetail]).then(function(response) {
            var incidenceContact = response[0];
            
            common.history.showStatusHistory(incidenceContact, 
                                             $scope.eid_contact, 
                                             'statHistModal', 
                                             'Status History');
        });
    };
    
    // WIP Assign to me
    var assignToMe = function(isDelegation) {
        var operations = [];
        var assignToMeOp;
        createDialog({
            template: 'The Incidence with id ' + $scope.eid + ' will be assigned to '+ $scope.username + '!',
            id: 'assignMeIncidence',
            title: 'Assign to me',
            backdrop: true,
            success: {label: 'Ok',
                      fn: function() {
                          if (isDelegation) {
                              assignToMeOp = $http.put('/api/tt/incidences/' + $scope._id_inc + '/delegation',
                                  angular.toJson({'operator': $scope.username}))
                                      .success(function(data) {
                                          reloadIncidence();
                                      })
                                      .error(function(data) {
                                      }); 
                          }
                          else {
                              assignToMeOp = $http.post('/api/tt/incidences/' + $scope._id_inc + '/responsible/operator',
                                  angular.toJson('current'))
                                      .success(function(data) {
                                          reloadIncidence();
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
                         assignToMeOp = $scope.incidence.next_actions;
                         operations = [assignToMeOp];
                         return $q.all(operations);
                     }
                    },
        });
    }
    
    // WIP Finish delegation
    var finishDelegation = function() {
        var operations = [];
        var assignToMeOp;
        createDialog({
            template: 'The current delegation in incidence ' + $scope.eid + ' will be finished !',
            id: 'finishDelegation',
            title: 'Finish delegation',
            backdrop: true,
            success: {label: 'Ok',
                      fn: function() {
                          finishDelegationOp = $http.delete('/api/tt/incidences/' + $scope._id_inc + '/delegation')
                              .success(function(data) {
                                  reloadIncidence();
                              })
                              .error(function(data) {
                          }); 
                          operations = [finishDelegationOp];
                          return $q.all(operations);
                      }
                     },
            cancel: {label: 'Cancel',
                    },
        });
    }
    
    // WIP Tranfer incidence
    var transferIncidence = function(delegation) {
        var operations = [];
        var transferOp;
        var title; 
        $scope.newResponsible = {
                urlPossibleGroups: 'api/groups/customer_service/'+ $scope.incidence.contact.customerservice.code+'/?exclude=' + $scope.incidence.responsible.current.group}
        if (delegation === true){
            title = 'Delegate';
        }
        else {
            title = 'Transfer';
        }
        
        createDialog('/betacompany/udo_ui/core/views/modals/transfer-delegate-modal.html', {
            bodyClass: 'modal-body modal-body-extend',
            modalClass: 'modal modal-extend',
            id: 'transferDelegateModal',
            title: title,
            backdrop: true,
            controller: 'transferModalCtrl',
            form: true, // Form for enabled/disabled Ok button
            nameForm: 'transferForm',
            success: {
                label: 'Ok', 
                fn: function() {
                    if (delegation === true) {
                        url = '/api/tt/incidences/' + $scope._id_inc + '/delegation';
                    }
                    else {
                        url = '/api/tt/incidences/' + $scope._id_inc + '/responsible';
                    }                    
                    var resp_desc = {
                        group: $scope.newResponsible.newGroup.code
                    }
                    
                    transferOp = $http.put(url, resp_desc)
                        .success(function(data, status) {
                            reloadIncidence();
                            
                        })
                        .error(function(data, status) {
                            $window.alert(data.detail);
                            reloadIncidence();
                        });
                    
                    operations = [transferOp];
                    return $q.all(operations);
                }
            },
            cancel: {label: 'Cancel', fn: function() {
            }}
        },
        {
            newResponsible: $scope.newResponsible
        });
    };


    // Link Problem
    var linkProblem = function() {
        var title = "Link Problem to this incidence";
        $scope.newProblem = {
            urlPossibleProblems: 'api/tt/problems/?detailed=true&status=Active&incidence=!' + 
                $scope._id_inc + '&rows=100',
        };

        createDialog('/betacompany/udo_ui/core/views/modals/link-problem-from-incidence-modal.html', {
            bodyClass: 'modal-body modal-body-extend',
            modalClass: 'modal modal-extend',
            id: 'linkProblemModal',
            title: title,
            backdrop: true,
            controller: 'linkProblemModalCtrl',
            form: true, // Form for enabled/disabled Ok button
            nameForm: 'associateForm',
            success: {
                label: 'Ok',
                fn: function() {
                    var url = '/api/tt/incidences/' + $scope._id_inc + '/problems';
                    var problem = angular.toJson($scope.newProblem.newProblem._id)
                    $http.post(url, problem)
                        .success(function(data, status) {
                            reloadIncidence();
                        })
                        .error(function(data, status) {
                            reloadIncidence();
                        });
                }
            },
            cancel: {label: 'Cancel', fn: function() {
            }}
        },
        {
            newProblem: $scope.newProblem
        });
    };

    // ------------------------------------------------------------------------
    // EDITABLE FUNCTIONS
    // ------------------------------------------------------------------------

    // Update data in server called from view (onbeforesave in editable directive)
    $scope.updateData = function(field, newValue) {
        var oldValue = field.value;

        var successFn = function() {
            reloadIncidence();
        };

        var cancelFn = function() {
            field.value = oldValue;
        };

        if (field.name === 'Status') {
            createStatusChangeDialog(newValue, 
                                 "incidences", 
                                 $scope._id_inc, 
                                 successFn,
                                 cancelFn);
        }
        else {

            var url = ''

            if (field.name == 'Originator Group') {
              url = '/api/tt/incidences/' + $scope.incidence._id + '/parameter/' + field.keySave;
            }
            else {
              url = '/api/tt/incidences/' + $scope.incidence._id + '/' + field.keySave;
            }

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
                    reloadIncidence();
                }).error(function(e) {
                    d.reject('Error');
                });
            return d.promise;
        }
    };

    // Show data for array, date or time field selection called from view:
    //  <a editable-select="field.value">{{showData(status)}}</a>
    //  <a editable-bsdatetime="field.value">{{showData(date)}}</a>
    $scope.showData = function(param) {
        return common.editable.showData(param);
    };

    // Save data to model after save data in server. Called from view:
    //  <a editable-select="field.value" ... onaftersave="saveData(field, $data)">{{showData(field)}}</a>
    $scope.saveData = function(field, newValue) {
        angular.noop();
    };

    // ------------------------------------------------------------------------
    // STATUS
    // ------------------------------------------------------------------------

    // Get possible statuses (status workflow)
    var getPossibleStatuses = function() {
        return common.status.next('api/tt/incidences/', 
                                  $scope.incidence._id);
    }

    // ------------------------------------------------------------------------
    // BUILD MODEL
    // ------------------------------------------------------------------------

    // Build detail model
    var buildDetailModel = function() {
        var canModifyParams = ($scope.incidence.next_actions.hasObject("ModifyParams"));
        var canModifyStatus = ($scope.incidence.next_actions.hasObject("ModifyStatus"));
        var configDefault = { editable: false };
        if ($scope.incidence.sla_info) {
          $scope.available_sla = "available";
        }
        else {
          $scope.available_sla = "not_available";
        }

        $scope.record.detail =  [
                                    {
                                        'service': {
                                                        value:    (isDefined($scope.incidence, 'contact.customerservice.name')) ?
                                                                                $scope.incidence.contact.customerservice.name : '',
                                                        name:     'Service',
                                                        widget:   'text'
                                                   },
                                        'type': {
                                                    value:    (isDefined($scope.incidence, 'contact.type')) ?
                                                                                $scope.incidence.contact.type : '',
                                                    name:     'Type',
                                                    widget:   'array',
                                                    type:     dataParams.type._type,
                                                },
                                        'status': {
                                                    value:    (isDefined($scope.incidence, 'status')) ?
                                                                                $scope.incidence.status : '',
                                                    editable: canModifyStatus,
                                                    widget:   'array',
                                                    info:     {
                                                                btn: 'icon-info-sign',
                                                                title: $filter('i18n')('Status info'),
                                                                // WIP Refactor with isDefined
                                                                cause: ($scope.incidence.status_change.last().cause) ? 
                                                                            $scope.incidence.status_change.last().cause : "",
                                                                // WIP Refactor with isDefined
                                                                description: ($scope.incidence.status_change.last().delayed_reason) ? 
                                                                            $scope.incidence.status_change.last().delayed_reason.code : "",
                                                                class:    'statusClass'

                                                    },
                                                    type:     getPossibleStatuses(),
                                                    name:     'Status',
                                                    keySave:  'status',
                                                    onchange: function() {
                                                                this.type = getPossibleStatuses();
                                                              } 
                                                  },
                                        'severity': {
                                                        value:    (isDefined($scope.incidence, 'severity')) ?
                                                                                SEVERITY_LABELS[$scope.incidence.severity] : '',
                                                        editable: canModifyParams,
                                                        name:     'Severity',
                                                        widget:   'array',
                                                        type:     dataParams.severity._type,
                                                        keySave:  'severity'
                                                    },
                                        'originator_user':  {
                                                                value:    (isDefined($scope.incidence, 'contact.customer')) ?
                                                                                $scope.incidence.contact.customer : '',
                                                                name:     'Originator User',
                                                                widget:   'text'
                                                            },
                                        'originator_group':  {
                                                                value:    (isDefined($scope.incidence, 'contact.originator_group')) ?
                                                                                $scope.incidence.contact.originator_group : '',
                                                                name:     'Originator Group',
                                                                editable:  dataParams.originator_group && canModifyParams,
                                                                widget:   'array',
                                                                type:     (isDefined(dataParams, 'originator_group._typeExtended')) ?
                                                                                dataParams.originator_group._typeExtended : [],

                                                                keySave:  'originator_group'
                                                            },
                                        'priority':  {
                                                        value:    (isDefined($scope.incidence, 'priority')) ?
                                                                                $scope.incidence.priority.toString() : '',
                                                        editable: canModifyParams,
                                                        name:     'Priority',
                                                        widget:   'array',
                                                        type:     dataParams.priority._type,
                                                        keySave:  'priority'
                                                     },
                                        'failure_responsible':  {
                                                                    value:    '',
                                                                    name:     'Failure Responsible',
                                                                    widget:   'text'
                                                                }

                                    },
                                    {
                                        'responsible_user': {
                                                                value:    (isDefined($scope.incidence, 'responsible.current.operator')) ?
                                                                                $scope.incidence.responsible.current.operator : '',
                                                                name:     'Responsible',
                                                                widget:   'text'
                                                            },
                                        'responsible_group': {
                                                                value:    (isDefined($scope.incidence, 'responsible.current.group')) ?
                                                                                $scope.incidence.responsible.current.group : '',
                                                                name:     'Responsible Group',
                                                                widget:   'text'
                                                             },
                                        'delegation_user': {
                                                                value:    (isDefined($scope.incidence, 
                                                                            'responsible.delegations.current.operator')) ?
                                                                                $scope.incidence.responsible.delegations.current.operator : '',
                                                                name:     'Deleg. User',
                                                                widget:   'text'
                                                            },
                                        'delegation_group': {
                                                                value:    (isDefined($scope.incidence, 
                                                                            'responsible.delegations.current.group')) ?
                                                                                $scope.incidence.responsible.delegations.current.group : '',
                                                                name:     'Deleg. Group',
                                                                widget:   'text'
                                                             }

                                    },
                                    {
                                        'submission_date':  {
                                                                // WIP Refactor with isDefined
                                                                value:    utils.date.utc2local($scope.incidence.status_change[0]['start']),
                                                                name:     'Submission Date',
                                                                widget:   'date'
                                                            },
                                        'target_date':  {
                                                                value:    (isDefined($scope.incidence, 'target_date')) ?
                                                                                utils.date.utc2local($scope.incidence.target_date) : '',
                                                                editable: canModifyParams,
                                                                name:     'Target Date',
                                                                widget:   'time',
                                                                keySave:  'target_date'
                                                            },
                                        'repair_date':  {
                                                                // WIP Refactor with isDefined
                                                                value:    utils.date.utc2local($scope.getRepairDate($scope.incidence)), 
                                                                name:     'Repair Date',
                                                                widget:   'date'
                                                            },
                                                            
                                        'sla_info':  {          
                                                                value:    (isDefined($scope.incidence, 'sla_info')) ?
                                                                                $scope.incidence.sla_info : '',
                                                                name:     'SLA',
                                                                widget:   'sla_info',
                                                                available_sla: $scope.available_sla
                                                            }

                                    }
                                ]; 

        // Extend data with data defaults
        angular.forEach($scope.record.detail, function(container, index) {
            angular.forEach(container, function(field, key) {
                container[key] = angular.extend({}, configDefault, field);
            });
        });
    };

    // Build data model
    var buildDataModel = function() {
        $scope.record.data = {};

        // Data contact
        angular.forEach(dataParams, function (param, key) {

            var exit = false;
            for (var i=0; i<$scope.record.detail.length && !exit; i++) {
                exit = (key in $scope.record.detail[i]); // Field exists in record.detail
            };

            if (!exit) {
                // Checks if param field is saved
                if ($scope.incidence.contact[param._id]) {
                    $scope.record.data[key] = {
                                                value:    (!$scope.contact[key]) ? "" : $scope.contact[key],
                                                editable: false, // Not editable in incidence detail
                                                widget:   param._widget,
                                                type:     param._type,
                                                name:     param._name,
                                                keySave:  'parameter/' + key,
                                                onchange: null
                                              };

                    // Severity
                    if (key === 'severity') {
                        $scope.record.data.severity.value = SEVERITY_LABELS[$scope.contact[key]];
                    }
                }
            }
        });
    };

    // Build tabs model
    var buildTabsModel = function() {
        // Tabs
        $scope.record.tabs = [
                                { title:"Description",
                                  icon: 'icon-list',
                                  contentUrl:"betacompany/udo_ui/core/views/tabs/description.html", 
                                  data: $scope.contact.description,
                                  editable: false },
                                { title:"Symptoms",
                                  icon: 'icon-lightbulb',
                                  contentUrl:"/betacompany/udo_ui/core/views/tabs/symptoms.html", 
                                  data: $scope.contact.symptoms,
                                  editable: false },
                                { title:"Attachments",
                                  icon: 'icon-paperclip',
                                  contentUrl:"betacompany/udo_ui/core/views/tabs/attachments.html", 
                                  data: $scope.contact.attachments,
                                  editable: false,
                                  buttons: 'DL' },
                                { title:"Notes",
                                  icon: 'icon-file-text', 
                                  contentUrl:"betacompany/udo_ui/core/views/tabs/annotations.html", 
                                  data: $scope.contact.annotations,
                                  editable: false } 
                             ];
        $scope.navType = 'pills'; 
    };

    // Build status model
    var buildStatus = function() {
        if ($scope.status == undefined) {
            $scope.status = {               
                                value:    $scope.incidence.status,
                                editable: true,
                                widget:   'array',
                                type:     getPossibleStatuses(),
                                name:     'Status',
                                keySave:  'status',
                                onchange: function() {
                                            this.type = getPossibleStatuses();
                                          } 
                            };
        }
        else {
            $scope.status.value = $scope.incidence.status;
            $scope.status.type  = getPossibleStatuses();
        }

    };

    // Build incidence model
    var buildModel = function(data) {
        // Get CSservice
        $scope.CSservice = data.contact.customerservice.code;

        // Get data and parameters
        dataProvider.loadParameters($scope.CSservice).then(function(response) {
            // Parameters
            var model = angular.copy(dataProvider.parameters($scope.CSservice).model);
            dataParams = model.dataParams;
            dataValues = model.dataValues;

            // Contact            
            $scope.contact = angular.extend({}, data.contact);

            // Reference to conversations
            $scope.conversation = $scope.contact.conversation = data.contact.conversation;

            // Detail model (record.detail)
            buildDetailModel();

            // Data model (record.data)
            buildDataModel();

            // Tabs model (record.tabs)
            buildTabsModel();
    // ------------------------------------------------------------------------
    // ANNOTATIONS
    // ------------------------------------------------------------------------
    // Add new annotation

// TODO: check how to tho scroll to div with service
//    $scope.addNotes = function() {
//        annotationsOp.launchAddNotesModal($scope, 'annotations', function() {
//            var newNote = $scope.annotations[$scope.annotations.length - 1];
//            $http.post('/api/tt/incidences/' + $scope.incidence._id + '/annotations/',
//                       newNote)
//                 .success(function() {
//                    $http.get('/api/tt/incidences/' + $scope.incidence._id + '/annotations/', 
//                              {cache: false})
//                         .success(function(data) {
//                            $scope.incidence.annotations = $scope.annotations =
//                                annotationsOp.buildAnnotations(data);
//                                utils.html.scrollToDiv('areaNotes');
//                        });
//                 });
        });
    };

    // Build annotations
    var buildAnnotations = function() {
        $scope.annotations = $scope.incidence.annotations = annotationsOp.buildAnnotations($scope.incidence.annotations || []);
    };

    // Build attachments
    var buildAttachments = function(data) {
        // Attachments management
        $scope.attachments = data.attachments || [];
        $scope.upload_detail_incidence_url = '/api/dms/incidence/' + $scope.incidence._id + '/upload';
        $rootScope.upload_detail_url = '/api/dms/incidence/' + $scope.incidence._id + '/upload';
        $scope.removeAttachment = common.attachments.removeWithActions(function(attachment) {
            var url = '/api/tt/incidences/' + $scope.incidence._id +
                '/attachments/' + '?uri=' + attachment.uri
            $http.delete(url).success(function() {
                // TODO: refresh contact?
            });
        });

    };

    // Build sidebar
    var buildSideBar = function(data) {
        var nextActions = data.next_actions;

        var sidebarLinksIncidence = [
            {id: 'FinishDelegation', name: 'Finish Delegation', icon: 'icon-mail-reply', apply: false, action: finishDelegation},
            {id: 'Delegate', name: 'Delegate Incidence',icon: 'icon-mail-forward', apply: false, action: transferIncidence, args: [true]},
            {id: 'Transfer', name: 'Transfer Incidence',icon: 'icon-share', apply: false, action: transferIncidence, args: [false]},
            {id: 'AssignmeDelegation', name: 'Assign me the delegation', icon: 'icon-link', apply: false, action: assignToMe, args: [true]},
            {id: 'Assignme', name: 'Assign to me', icon: 'icon-link', apply: false, action: assignToMe, args: [false]}
        ];

        $rootScope.sidebarLinks = [
            {id: 'AttachDocument', name: 'Attach Document', icon: 'icon-paperclip', action: attachDocument},
            {id: 'AddNote', name: 'Add Note', icon: 'icon-file-text', action: addNotes},
            {id: 'AddQuestionThread', name: 'Add Question Thread', icon: 'icon-comments', action: addQuestionThread},
            {id: 'StateHistory', name: 'State History', icon: 'icon-time', action: showStatusHistory},
            {id: 'TicketHistory', name: 'Ticket History', icon: 'icon-time', action: showTicketHistory},
            {id: 'IncidenceHistory', name: 'Incidence History', icon: 'icon-time', action: showIncidenceHistory},
            {id: 'Help', name: 'Help', icon: 'icon-info-sign', action: common.portal.help, apply: false}        
        ];

        if ($scope.incidence.contact.symptoms && $scope.incidence.contact.symptoms.length > 0) {
           $rootScope.sidebarLinks.unshift({id: 'LinkProblem', name: 'Link with a problem', icon: 'icon-link', action: linkProblem});
        }

        // Extends sidebarLinksIncidence and $rootScope.sidebarLinks with default sidebar config
        common.toolbar.build(sidebarLinksIncidence);

        common.toolbar.build($rootScope.sidebarLinks);

        // Workflow: enable/disable incidence sidebar options
        common.toolbar.enable(sidebarLinksIncidence, nextActions);

        // Extends sidebarLinks with sidebarLinksIncidence
        angular.forEach(sidebarLinksIncidence, function(link, key) {
            $rootScope.sidebarLinks.unshift(link);
        });
    };

    // Build bar (toolbar -links and icons- and sidebar)
    var buildBar = function(data) {
        buildSideBar(data);

        $rootScope.toolbarIcons = [
            {type: 'action', name: 'Print', url: '#', icon: 'icon-print', active: '', action: common.portal.print },
            {type: 'action', name: 'Refresh', url: '#', icon: 'icon-refresh', active: '', action: common.portal.refresh}
        ]; 

        var nextActions = data.next_actions;
        if (nextActions && nextActions.hasObject("CanViewTicket")) {
          $rootScope.toolbarLinks = [
            {type: 'link', title: '#'+ $scope.eid_contact, url: '#', active: '', class: 'brand'},
            {type: 'linki18n', title: 'Contact', url: '/ui#/tt/contacts/' + $scope._id_ticket, active: '', class: ''},
            {type: 'linki18n', title: 'Incidence', url: '/ui#/tt/incidences/' + $scope._id_inc, active: 'active', class: ''}
        ]; 
        }
        else {
          $rootScope.toolbarLinks = [
            // active should be 'active' (if active section) or ''
            {type: 'link', title: '#'+ $scope.eid_contact, url: '#', active: '', class: 'brand'},
            {type: 'linki18n', title: 'Incidence', url: '/ui#/tt/incidences/' + $scope._id_inc, active: 'active', class: ''}
        ]; 

        }
        
    };

    // Init data
    var initData = function(data) {
        $scope.incidence = data;
        $scope._id_inc = data._id;
        $scope.eid = data.eid;
        $scope._id_ticket = data.contact._id;
        $scope.eid_contact = data.contact.eid;
    };

    // Return if the incidence has associated problems
    $scope.incidenceHasAssociatedProblems = function() {
      //if ($scope.incidence && $scope.incidence.problems && !(jQuery.isEmptyObject($scope.incidence.problems) {
      if ($scope.relatedproblemsincidence.length > 0) {
        return true;
      }
      else {
        return false;
      }
    };

    // Reload Incidence (detail and sidebar)
    var reloadIncidence = function() {
        // Get Incidence Detail
        var getIncidenceDetail = udoAPI.getIncidenceDetail($scope._id_inc); // Get incidence detail 
        $q.all([getIncidenceDetail]).then(function (response) {
            var data = response[0];
            
            $scope.incidence = data

            // Build sidebar
            buildSideBar($scope.incidence);

            if ($scope.incidence && $scope.incidence.problems && !(jQuery.isEmptyObject($scope.incidence.problems))) {
              udoAPI.getRelatedProblems($scope.incidence._id).then(
                // Success
                function(response) {
                    $scope.relatedproblemsincidence.clear();
                    for(var i = 0; i < response.length; i++) {
                      $scope.relatedproblemsincidence.push(response[i]);
                    }
                    buildDetailModel(data);

                    // Get label info (assigned, delegated)
                    getLabelInfo();
                },
                // Error
                function(response) {
                    //TODO: Handle error. Redirect to error page
                });

            }
            else {
              buildDetailModel(data);

              // Get label info (assigned, delegated)
              getLabelInfo();
            }

            
        });
    }; 

    // Init
    $scope.init = function() {
        // Get Incidence Detail
        var getIncidenceDetail = udoAPI.getIncidenceDetail($scope._id_inc); // Get incidence detail 
        $q.all([getIncidenceDetail]).then(function (response) {
            var data = response[0];

            // Init data
            initData(data);

            // Set current incidence as a recented visited
            $scope.pushRecentEntityId('incidences', $scope.eid_contact);

            // Build bar (toolbar and sidebar)
            buildBar(data);

            // Build attachments
            buildAttachments(data);

            // Build annotations
            buildAnnotations(data);

            // Build Model
            //buildModel(data);



            udoAPI.getRelatedProblems($scope.incidence._id).then(
                // Success
                function(response) {
                    $scope.relatedproblemsincidence.clear();
                    for(var i = 0; i < response.length; i++) {
                      $scope.relatedproblemsincidence.push(response[i]);
                    }
                    buildModel(data);

                    // Get label info (assigned, delegated)
                    getLabelInfo();
                },
                // Error
                function(response) {
                    //TODO: Handle error. Redirect to error page
                });
        });
    }; 

    // ------------------------------------------------------------------------
    // INIT CONTROLLER
    // ------------------------------------------------------------------------

    // Init controller
    $scope.init();
    
}]);


udoModule.controller('transferModalCtrl', ['$scope', '$http', 'newResponsible',
                                             function($scope, $http, newResponsible) {
    ////////////////////////////////////////////// VARIABLES
    $scope.newResponsible = newResponsible;
    
    $http.get(newResponsible.urlPossibleGroups).then(function(result) {
        $scope.newResponsible.groups = result.data;
    });

    ////////////////////////////////////////////// BUILD CONTROLLER
    
    // INIT
    $scope.init = function() {
    };

    // START CONTROLLER
    $scope.init(); 
}]);

udoModule.controller('linkProblemModalCtrl', ['$scope', '$http', 'newProblem',
                                             function($scope, $http, newProblem) {
    ////////////////////////////////////////////// VARIABLES
    $scope.newProblem = newProblem;

    $http.get(newProblem.urlPossibleProblems).then(function(result) {
        $scope.newProblem.problems = result.data;
    });

    // INIT
    $scope.init = function() {
    };

    // START CONTROLLER
    $scope.init();
}]);
