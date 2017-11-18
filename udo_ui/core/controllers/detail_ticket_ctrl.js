/**
 * @ngdoc controller
 * @name detailTicketCtrl
 * @description
 *
 * TBD: // Just a controller to show detail ticket
 *
 *
**/

udoModule.controller(
    'detailTicketCtrl', 
    ['$scope', '$rootScope', '$routeParams', '$http', '$q', '$filter',
     'dataProvider', 'createDialog', 'udoAPI', 'annotationsOp', 'questionsOp', 'modalGen',
     'createStatusChangeDialog', 'utils', 'SEVERITY_LABELS', 'common', 
     function($scope, $rootScope, $routeParams, $http, $q, $filter,
              dataProvider, createDialog, udoAPI, annotationsOp, questionsOp, modalGen, createStatusChangeDialog,
              utils, SEVERITY_LABELS, common) {

    var self = this;

    // ------------------------------------------------------------------------
    // VARIABLES
    // ------------------------------------------------------------------------

    $scope.record = { detail: [], data: [], tabs: [] };
    $scope.annotations = [];

    var dataParams = undefined;
    var dataValues = undefined;

    // ------------------------------------------------------------------------
    // ANNOTATIONS
    // ------------------------------------------------------------------------

    // Add new annotation
    var addNotes = function() {
        var result = [$scope.contact, $scope];
        common.notes.add($scope, 
                         '/api/tt/contacts/', 
                         $scope.contact._id, 
                         result,
                         function() {
                             utils.html.scrollToDiv('areaNotes')
                         });
    };

    // Update annotations
    $scope.changeAnnotation = function(index, annotation, data) {
        var result = [$scope.contact, $scope];
        common.notes.changeAnnotation('/api/tt/contacts/', 
                                      $scope.contact._id, 
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
                                utils.html.scrollToDiv('questions');
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
    };

    // Add attachment to model
    $scope.addAttachment = function(resp) {
        common.attachments.add(resp, $scope.contact.attachments);
        utils.html.scrollToDiv('ticketDetail');
    };

    // ------------------------------------------------------------------------
    // SIDEBAR
    // ------------------------------------------------------------------------

    // Show ticket history modal
    var showTicketHistory = function() {
        var getTicketDetail = udoAPI.getTicketDetail($scope._id_ticket);
        $q.all([getTicketDetail]).then(function(response) {
            var contact = response[0];

            common.history.showHistory(contact, 
                                       $scope.eid, 
                                       'ticketHistModal', 
                                       'Ticket History');
        });
    };

    // Show incidence history modal
    var showIncidenceHistory = function() {
        var getTicketDetail = udoAPI.getTicketDetail($scope._id_ticket);
        $q.all([getTicketDetail]).then(function(response){
            var incidenceContact = response[0].incidence;

            common.history.showHistory(incidenceContact, 
                                       $scope.eid, 
                                       'incContHistModal', 
                                       'Incidence History');
        });
    };

    // Show status ticket history modal
    var showStatusHistory = function() {
        var getTicketDetail = udoAPI.getTicketDetail($scope._id_ticket);
        $q.all([getTicketDetail]).then(function(response) {
            var contact = response[0];
            
            common.history.showStatusHistory(contact, 
                                             $scope.eid, 
                                             'statHistModal', 
                                             'Status History');
        });
    };

    // ------------------------------------------------------------------------
    // MODEL FUNCTIONS CONTROLLER
    // ------------------------------------------------------------------------

    // Check field apply: Called from <div ng-if="!notApplyField(keyField)">
    $scope.notApplyField = function(keyField, field) {

        // WIP Refactor. Used too in new_ticket_ctrl

        var dataField  = dataParams[keyField];
        var dependence = false;
        var apply      = true;

        if (dataField && dataField._objReferenced) {
            dependence = (dataField._objReferenced instanceof Object);

            if (dependence)
            {
                // Each object referenced
                for (var key in dataField._objReferenced) 
                {
                    // Check field apply => referenced apply and check referenced value
                    apply = (dataParams[key]._apply) && // Ref apply
                            (field[key].value === dataField._objReferenced[key]); // Check value
                    dataField._apply = apply;  // Update field apply
                    if (!apply)
                    {
                        break;
                    }
                }
            }
        }

        return (!apply);    
    };

    // ------------------------------------------------------------------------
    // EDITABLE FUNCTIONS
    // ------------------------------------------------------------------------

    // Update data in server called from view (onbeforesave in editable directive)
    $scope.updateData = function(field, newValue) {
        var oldValue = field.value;

        var successFn = function() {
            //field.onchange();
            reloadContact(); // status_info
        };

        var cancelFn = function() {
            field.value = oldValue;
        };

        if (field.name === 'Status') {
            createStatusChangeDialog(newValue, 
                                     "contacts", 
                                     $scope.contact._id, 
                                     successFn,
                                     cancelFn);
        }
        else {
            var url = '/api/tt/contacts/' + $scope.contact._id + '/' + field.keySave;

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
    //  <a editable-bsdatetime="field.value">{{showData(date)}}</a>
    $scope.showData = function(param) {
        return common.editable.showData(param);
    };

    // Save data to model after save data in server. Called from view:
    //  <a editable-select="field.value" ... onaftersave="saveData(field, $data)">{{showData(field)}}</a>
    $scope.saveData = function(field, newValue) {
        //field.value = $filter('udoDate')(newValue);
        angular.noop();
    };

    // ------------------------------------------------------------------------
    // STATUS
    // ------------------------------------------------------------------------

    // Get possible statuses (status workflow)
    var getPossibleStatuses = function() {
        return common.status.next('api/tt/contacts/', 
                                  $scope.contact._id);
    }

    // ------------------------------------------------------------------------
    // BUILD MODEL
    // ------------------------------------------------------------------------

    // Build detail model
    var buildDetailModel = function() {
        var configDefault = { editable: false };
        $scope.record.detail = [
            {
                'service': {
                    value:    (isDefined($scope.contact, 'customerservice.name')) ? $scope.contact.customerservice.name : '',
                    name:     'Service',
                    widget:   'text'
                },
                'status': {
                    value:    (isDefined($scope.contact, 'status')) ? $scope.contact.status : '',
                    editable: true,
                    widget:   'array',
                    info:     {
                                btn: 'icon-info-sign',
                                title: $filter('i18n')('Status info'),
                                // WIP Refactor with isDefined
                                cause: ($scope.contact.status_change.last().cause) ? 
                                            $scope.contact.status_change.last().cause : "",
                                // WIP Refactor with isDefined
                                description: ($scope.contact.status_change.last().delayed_reason) ? 
                                            $scope.contact.status_change.last().delayed_reason.code : "",
                                class:    'statusClass'
                    },
                    type:     getPossibleStatuses(),
                    name:     'Status',
                    keySave:  'status',
                    onchange: function() {
                        this.type = getPossibleStatuses();
                    } 
                },
                'originator_user':  {
                    value:    (isDefined($scope.contact, 'customer')) ? $scope.contact.customer : '',
                    name:     'Originator User',
                    widget:   'text'
                },
                'submission_date':  {
                    // WIP Refactor with isDefined
                    value:    $scope.contact.status_change[0]['start'],
                    name:     'Submission Date',
                    widget:   'date'
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
            // Checks if param field is saved
            if ($scope.contact[param._id]) {
                $scope.record.data[key] = {
                                            value:    (!$scope.contact[key]) ? "" : $scope.contact[key],
                                            editable: param._editable,
                                            widget:   param._widget,
                                            type:     param._type,
                                            name:     param._name,
                                            keySave:  'parameter/' + key,
                                            onchange: null
                                          };

                // Checks date or time widget
                if (($scope.record.data[key].widget === "date") || ($scope.record.data[key].widget === "time")) {
                    $scope.record.data[key].value = utils.date.utc2local($scope.record.data[key].value);
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
                                  data: $scope.contact.description },
                                { title:"Symptoms",
                                  icon: 'icon-lightbulb',
                                  contentUrl:"/betacompany/udo_ui/core/views/tabs/symptoms.html", 
                                  data: $scope.contact.symptoms },
                                { title:"Attachments",
                                  icon: 'icon-paperclip',
                                  contentUrl:"betacompany/udo_ui/core/views/tabs/attachments.html", 
                                  data: $scope.contact.attachments,
                                  editable: true},
                             ];
        $scope.navType = 'pills'; 
    };

    // Build ticket model
    var buildModel = function(data) {
        // Get parameters and data contact

        // Get CSservice
        $scope.CSservice = data.customerservice.code;

        // Get data and parameters
        dataProvider.loadParameters($scope.CSservice).then(function(response) {

            // Parameters
            var model = angular.copy(dataProvider.parameters($scope.CSservice).model);

            dataParams = model.dataParams;
            dataValues = model.dataValues;

            // Exception: delete priority
            var stringPriority = 'priority';
            if (dataParams.hasOwnProperty(stringPriority)) {
                var ref = dataParams[stringPriority]._ref; // Reference dataValues
                delete dataParams[stringPriority]; // Remove priority in dataParams
                dataValues.splice(ref, 1); // Remove priority in dataValues

                // Rebuild _ref in dataParams
                angular.forEach(dataParams, function(field, key) {
                    if (field._ref > ref) {
                        field._ref = field._ref - 1;
                    }
                });
            }

            // Contact            
            $scope.contact = angular.extend({}, data);
            // Reference to annotations
            $scope.annotations = $scope.contact.annotations =
                annotationsOp.buildAnnotations($scope.contact.annotations || []);

            $scope._id_inc = data.incidence._id;
            // If there is not attachments init it as an empty list
            if (!$scope.contact.attachments) {
                $scope.contact.attachments = [];
            }

            // Detail model (record.detail)
            buildDetailModel();

            // Reference to conversations
            $scope.conversation = $scope.contact.conversation = data.conversation;

            // Data model (record.data)
            buildDataModel();

            // Tabs model (record.tabs)
            buildTabsModel();
        });
    };

    // Build attachments
    var buildAttachments = function(data) {
        // Attachments management on ticket detail
        $scope.removeAttachment = common.attachments.removeWithActions(function(attachment) {
            var url = '/api/tt/contacts/' + $scope.contact._id + 
                '/attachments/' + '?uri=' + attachment.uri;
            $http.delete(url).success(function() {
                // TODO: refresh contact?
            });
        });
    };

    // Build sidebar
    var buildSideBar = function(data) {
        $rootScope.sidebarLinks = [
            // active should be 'active' (if active section) or ''
            {name: 'Attach Document', icon: 'icon-paperclip', action: attachDocument},
            {name: 'Add Note', url: '#', icon: 'icon-file-text', action: addNotes},
            {name: 'Add Question Thread', icon: 'icon-comments', action: addQuestionThread},
            {name: 'State History', icon: 'icon-time', action: showStatusHistory},
            {name: 'Ticket History', icon: 'icon-time', action: showTicketHistory},
            {name: 'Incidence History', icon: 'icon-time', action: showIncidenceHistory},
            {name: 'Help', icon: 'icon-info-sign', action: common.portal.help, apply: false}
        ];

        // Extends $rootScope.sidebarLinks with default sidebar config
        common.toolbar.build($rootScope.sidebarLinks);
    };

    // Build bar (toolbar -links and icons- and sidebar)
    var buildBar = function(data) {
        var nextActions = data.next_actions;
        if (nextActions && nextActions.hasObject("CanViewIncidence")) {
            $rootScope.toolbarLinks = [
                // active should be 'active' (if active section) or ''
                {type: 'link', title: '#'+$scope.eid, url: '#', active: '', class: 'brand'},
                {type: 'linki18n', title: 'Contact', url: '/ui#/tt/contacts/' + $scope._id_ticket, active: 'active', class: ''},
                {type: 'linki18n', title: 'Incidence', url: '/ui#/tt/incidences/' + $scope._id_inc, active: '', class: ''}
            ];
        }
        else {
            $rootScope.toolbarLinks = [
                {type: 'link', title: '#'+$scope.eid, url: '#', active: '', class: 'brand'},
                {type: 'linki18n', title: 'Contact', url: '/ui#/tt/contacts/' + $scope._id_ticket, active: 'active', class: ''}
            ];

        }

        $rootScope.toolbarIcons = [
            {type: 'action', name: 'Print', url: '#', icon: 'icon-print', active: '', action: common.portal.print},
            {type: 'action', name: 'Refresh', url: '#', icon: 'icon-refresh', active: '', action: common.portal.refresh}
        ]; 

        buildSideBar();
    };

    // Init data
    self.initData = function(data) {
        $scope.eid = data.eid;
        $scope._id_inc = data.incidence._id;
        $scope._id_ticket = data._id;
        $scope.upload_detail_ticket_url = '/api/dms/contact/' + $scope._id_ticket + '/upload';
        $rootScope.upload_detail_url = '/api/dms/contact/' + $scope._id_ticket + '/upload';
    };

    // Reload Contact (detail)
    var reloadContact = function() {
        // Get Ticket Detail
        var getTicketDetail = udoAPI.getTicketDetail($routeParams.eid); // Get detail ticket 
        $q.all([getTicketDetail]).then(function (response) {
            var data = response[0];

            // Build Model
            buildModel(data);
        }, function (response) {
            // WIP Exception
        });    
    }; 


    // Init
    $scope.init = function() {
        // Get Ticket Detail
        var getTicketDetail = udoAPI.getTicketDetail($routeParams.eid); // Get detail ticket 
        $q.all([getTicketDetail]).then(function (response) {
            var data = response[0];

            // Init data
            self.initData(data);

            // Set current ticket as a recented visited
            $scope.pushRecentEntityId('contacts', $scope.eid);

            // Build bar (toolbar and sidebar)
            buildBar(data);

            // Build Model
            buildModel(data);

            // Build attachments
            buildAttachments(data);
        }, function (response) {
            // WIP Exception
        });
    }; 

    // ------------------------------------------------------------------------
    // INIT CONTROLLER
    // ------------------------------------------------------------------------

    if (!navigator.userAgent.match(/PhantomJS/)) {
        // Init controller
        $scope.init(); 
    }
}]);

