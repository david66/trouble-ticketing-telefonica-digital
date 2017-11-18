// Code goes here
udoModule.controller('newTicketCtrl',
        ['$scope', '$rootScope', '$modal', '$routeParams', '$timeout', '$q',
         'createDialog', 'udoAPI', 'dataProvider', 'annotationsOp', 'utils', 'common',
         function($scope, $rootScope, $modal, $routeParams, $timeout, $q,
                  createDialog, udoAPI, dataProvider, annotationsOp, utils, common) {

    ////////////////////////////////////////////// VARIABLES
    
    $scope.buttons  = {
                        cancel:        "Cancel",
                        clear:         "Clear Fields",
                        save:          "Save Contact",
                        addNewSymptom: "Add New Symptom",
                        addNote:       "Add Note",
                        file:          "Choose File"
                      };

    $scope.CSservice = $routeParams.cs;
    $scope.cs        = angular.lowercase($scope.CSservice);
    $scope.title     = $scope.cs; // Default
    $scope.scn       = undefined; // Default

    $scope.selectOption  = "Select an option";
    $scope.selectDate    = "Enter a date";
    $scope.attachFile    = "Attach Document";

    $scope.percent = 0;

    $scope.record_contact     = [];
    $scope.record_allSymptoms = [];
    $scope.record_symptoms    = [];
    $scope.annotations = [];
    $scope.attachments = [];

    $scope.templates = {
                            list: undefined,
                            selected: {
                                        name:     undefined,
                                        content:  "",
                                        template: undefined
                                      }
                       };

    var symptomsDictionary   = {};
    var freeTextTemplateCode = "free_text_template";

    ////////////////////////////////////////////// NAVBAR AND TOOLBAR CONFIGURATION

    // IMPORTANT: Build toolbar and sidebar after get ticket title !!!!

    ////////////////////////////////////////////// DATEPICKER FIELD

    // DATEPICKER CONFIG 
    $scope.disabledWeek = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.openCalendar = function(field) {
        $timeout(function() {
            field._openCalendar = true;
        });
    };

    var date_format = {
                        'en': 'MM-dd-yyyy',
                        'es': 'dd-MM-yyyy',
                        'pt': 'dd-MM-yyyy'
                      };
    $scope.dateformatter = date_format[$rootScope.currentLanguage];

    $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1
    };

    ////////////////////////////////////////////// BUTTONS FORM

    // BUTTON CANCEL
    $scope.cancel = function() {
        var bodyTemplate =  '<div>' +
                                // Next div line: style and class => Defined in service, don't touch
                                '<div class="modal-body info" style="color: #666666;">' +
                                    '<p>{{ "Leave Wizard Confirmation"|i18n }}</p>' +
                                '</div>' +
                            '</div>';

        $scope.launchCancelNewTicketModal = function() {
            createDialog({
                            template: bodyTemplate,
                            id: 'cancelNewTicketModal',
                            title: 'New Ticket',
                            backdrop: true,
                            success: {label: 'Ok', fn: function() {$scope.clear(false);}},
                            cancel:  {label: 'Cancel', fn: null}
                        });
        };

        $scope.launchCancelNewTicketModal(); // Show modal
    };

    // BUTTON CLEAR
    $scope.clear = function(confirm) {

        var clear = function() {
            // Data contact
            $scope.record_contact = angular.copy($scope.masterContact);

            // Symptoms
            $scope.availableSymptoms = []; // Empty
            $scope.selectedSymptoms = []; // Empty
            $scope.v_symptomDescription = []; // Empty
            $scope.moveAllSymptoms($scope.record_symptoms, // All available
                                    $scope.record_allSymptoms); 

            // Descriptions
            if (typeof($scope.templates) != "undefined")
            {
                // Free text is the last template !!!!
                var free_text = $scope.templates.list.last(); 
                // Radio  can't be deselected => free text
                $scope.templates.selected.template = free_text; 
                $scope.templates.selected.content  = ""; // Empty 
                // Update select radio button
                $(".tabDescription[value='"+free_text.name+"']").
                        val(free_text.name); 
                $(".tabDescription[value='"+free_text.name+"']").
                        prop('checked', true);
            }
            
            // Notes
            $scope.annotations = []; // Empty

            // Attachments
            $scope.attachments = []; // Empty

            $scope.percent = 0; // Reset the progress bar
        };

        // Modal
        var bodyTemplate =  '<div>' +
                                // Next div line: style and class => Defined in service, don't touch
                                '<div class="modal-body info" style="color: #666666;">' +
                                    //'<p>{{ "Clear Wizard Confirmation"|i18n }}</p>' +
                                    '<p>{{ "Are you sure you want to clear the wizard? All changes not saved will be lost."|i18n }}</p>' +
                                '</div>' +
                            '</div>';

        var launchClearNewTicketModal = function() {
            createDialog({
                            template: bodyTemplate,
                            id: 'clearNewTicketModal',
                            title: 'New Ticket',
                            backdrop: true,
                            success: {label: 'Ok', fn: function() {clear();}},
                            cancel:  {label: 'Cancel', fn: null}
                         });
        };

        if (confirm) {
            launchClearNewTicketModal(); // Show modal for confirm
        }
        else {
            clear(); // Clear
        }
    };

    // BUTTON SAVE
    $scope.save = function() {
        // Init new ticket
        $scope.newTicket = {};

        // Fill data contact
        for (var param in $scope.dataParams)
        {
            var dataField  = $scope.dataParams[param];
            if (dataField._apply)
            {
                var data   = $scope.record_contact[dataField._ref];

                var id     = data._id;
                var value  = data._value;
                var widget = data._widget;

                if (typeof(value) != "undefined" && value !== null)
                {
                    if (widget === "date" || widget == "time") // Convert date to UTC format: YYYY-mm-DD HH:MM:SS.ffffff
                    {
                        value = utils.date.local2utc(value);
                    }

                    $scope.newTicket[id] = value;
                } 
            }
        }

        // Fill symptoms: part 1
        $scope.newTicket['symptoms'] = [];
        var newUserSymptomsList = [];

        for (j=0; j<$scope.record_symptoms.length; j++)
        {
            // No id -> user defined symptom: add it and get the new id
            if (typeof($scope.record_symptoms[j].id) === "undefined") 
            {
                var newObject = {
                                    name:        $scope.record_symptoms[j].name,
                                    description: $scope.record_symptoms[j].description
                                };

                newUserSymptomsList.push(newObject);
            }
            else
            {
                $scope.newTicket['symptoms'].push($scope.record_symptoms[j].id);
            }
        }

        // Fill symptoms: part 2 - For each new user symptoms then get id
        if (newUserSymptomsList.length > 0)
        {
            var getSymptomCodeList = [];

            for (i=0; i<newUserSymptomsList.length; i++)
            {
                // Get id for new user defined symptom 
                var getSymptomCode = udoAPI.saveSymptom(newUserSymptomsList[i]); 
                getSymptomCodeList.push(getSymptomCode);
            }
            // Get all id symptoms
            $scope.percent = 33;
            $q.all(getSymptomCodeList).then(function (response) {
                    // Success all
                    for (i=0; i<response.length; i++)
                    {
                        // Id for user defined symtom
                        var idNewSymptom = angular.fromJson(response[i]);
                        $scope.newTicket['symptoms'].push(idNewSymptom); 
                    }

                    // Data contact and new user symptoms OK => continue with descriptions ...
                    $scope.continueSave(); 
                }, function (response) {
                    // Error
            });
        }
        else
        {
            // Data contact and new user symptoms OK => continue with descriptions ...
            $scope.continueSave(); 
        }
    };

    $scope.continueSave = function() {
        $scope.percent = 66;

        // Fill description
        if ($scope.templates.selected.content !== "") // Save template
        {
            var description;

            if ($scope.templates.selected.template.code === freeTextTemplateCode) // Free text template
            {
                description = {
                                code :    $scope.templates.selected.template.code,
                                contexts: [[]]
                              };
                description.contexts[0][0] = $scope.templates.selected.content;
            }
            else // System Template
            {
                // WIP descriptions old version (jQuery)
                var context = {};
                $('.context_key').each(function() {
                    var key = $(this).text();
                    var value = $(this).next().text();
                    context[key] = value;
                });
                // End WIP

                description = {
                                code :    $scope.templates.selected.template.code,
                                contexts: [[]]
                              };
                description.contexts[0] = context;
            }

            $scope.newTicket['description'] = description;
        }

        // Fill notes
        if (!$scope.annotations) { $scope.annotations = []; }
        $scope.newTicket['annotations'] = $scope.annotations;

        // Fill atachments
        if (!$scope.attachments) { $scope.attachments = []; }
        $scope.newTicket['attachments'] = $scope.attachments;

        // Complete new ticket record
        $scope.newTicket['customerservice'] = $scope.CSservice;
        $scope.newTicket['public']          = false;

        // Save ticket
        $scope.percent = 80;
        var saveTicket = udoAPI.saveTicket($scope.newTicket); // Save ticket
        $q.all([saveTicket]).then(function (response) {
                $scope.successSave     = true; // Success
                $scope.eid             = response[0].eid;

                $scope.percent = 100;
                $scope.showNewTicketResult(); // Show dialog modal: success
            }, function (response) {
                $scope.successSave = false; // Error
                $scope.errorSave = angular.fromJson(response.data);
                
                $scope.percent = 100;
                $scope.showNewTicketResult(); // Show dialog modal: error
        });
    };

    // SHOW MODAL: SAVE NEW TICKET RESULT
    $scope.showNewTicketResult = function() {
        $scope.percent = 0; // Reset the progress bar

        var bodyTemplate =  // Next div line: style and class => Defined in service, don't touch
                            '<div class="modal-body info" style="color: #666666;">' +
                                '<p ng-if="successSave">{{ "The claim with the Id:"|i18n }}' +
                                        '<a ng-click="detail()">{{ eid }} </a>' +
                                    '{{ "was successfully created!"|i18n }}</p>' +
                                '<p ng-if="!successSave">{{ "Error:"|i18n }} {{ errorSave }}</p>' +
                            '</div>';

        var footerTemplate ='<button class="btn btn-udo-save" ng-click="$modalSuccess()">' +
                                '{{$modalSuccessLabel}}' +
                            '</button>';

        $scope.launchSaveNewTicketModal = function() {
            createDialog({
                            template: bodyTemplate,
                            id: 'saveNewTicketModal',
                            title: 'New Ticket',
                            backdrop: true,
                            handleEsc: false, // Disable Esc key (cancel)
                            controller: ['$scope', '$location', 'eid', 'successSave', 'errorSave',
                                                    function($scope, $location, eid, successSave, errorSave) {
                                            $scope.successSave  = successSave;
                                            $scope.errorSave    = errorSave;
                                            $scope.eid          = eid;
                                            $scope.path         = '/tt/contacts/' + eid;

                                            $scope.detail = function() {
                                                $scope.$modalClose();        // Close the dialog
                                                $location.path($scope.path); // Redirect to detail contact
                                            };
                                        }],
                            success: {label: 'Close', fn: function() {$scope.clear(false);}},
                            footerTemplate: footerTemplate
                        },
                        {
                            eid:         $scope.eid,
                            successSave: $scope.successSave,
                            errorSave:   $scope.errorSave
                        });
        };

        $scope.launchSaveNewTicketModal(); // Show modal
    };


    // ADD NEW USER SYMPTOM
    $scope.addNewUserSymptom = function() {
        $scope.newUserSymptom = {
                                        id :          undefined,
                                        code :        "",
                                        name :        "",
                                        description : ""
                                };

        $scope.launchNewUserSymptomModal = function() {
            createDialog('/betacompany/udo_ui/core/views/modals/new-user-symptom-modal.html', {
                id: 'newUserSymptomModal',
                title: 'New Symptom',
                backdrop: true,
                controller: ['$scope', 'newUserSymptom', function($scope, newUserSymptom) {
                                $scope.newUserSymptom = newUserSymptom;
                            }],
                form: true, // Form for enabled/disabled Ok button
                success: { label: 'Ok', 
                           fn: function() {
                                            // OK => Custom symptom goes to the selected list directly
                                            $scope.newUserSymptom.code = $scope.newUserSymptom.name.toUpperCase(); // Convert to upper case
                                            var newObject = {
                                                                key:         $scope.newUserSymptom.code, 
                                                                name:        $scope.newUserSymptom.name,
                                                                id:          undefined,
                                                                description: $scope.newUserSymptom.description,
                                                                selected:    false
                                                            };

                                            $scope.record_symptoms.push(newObject);

                                            symptomsDictionary[$scope.newUserSymptom.code] = { 
                                                                                                id:          undefined, 
                                                                                                name:        $scope.newUserSymptom.name,
                                                                                                description: $scope.newUserSymptom.description 
                                                                                              };
                                            utils.html.scrollToDiv('symptoms');
                                          }

                          },
                cancel: {label: 'Cancel', fn: null},
            },
            {
                newUserSymptom: $scope.newUserSymptom
            });
        };

        $scope.launchNewUserSymptomModal(); // Show modal
    };

    // BUTTON FILE UPLOAD

    $scope.fileDMSUploaded = function(resp) {
        var data = angular.fromJson(resp);
        $scope.dms_code = data.document_id;

        // Add attachment
        $scope.addAttachment(resp);
    };

    // CHECK MANDATORY FIELD
    $scope.isMandatory = function(param){
        var mandatory = param._mandatory;
        return (mandatory) ? 'wizard-label mandatory' : 'wizard-label';
    };

    // CHECK MANDATORY FIELD (ATTACH FILE)
    $scope.isMandatoryAttachFile = function(){
        var mandatory = ($scope.scn === "scn_m2m");
        return (mandatory) ? 'wizard-label mandatory' : 'wizard-label';
    };

    // CHECK TEMPLATE CLASS
    $scope.templateClass = function(){
        return ($scope.noTemplateByDefault) ? 'span7 row-fluid wizard-control' : 'span12 row-fluid wizard-control';
    };

    // CHECK ENABLE BUTTON CLEAR
    $scope.isUnchanged = function() {
        // Checks ticket record (contact + symptoms + templates + annotations + attachments)
        return ( angular.equals($scope.record_contact,  $scope.masterContact)  &&
                 ($scope.record_symptoms.length === 0) &&
                 ( typeof($scope.templates.selected) === "undefined" || $scope.templates.selected.content === "") &&
                 ($scope.attachments.length === 0) && ($scope.annotations.length === 0) );
    };

    // CHECK APPLY: Called from <div ng-if="!notApplyField(field)">
    $scope.notApplyField = function(field) {
        var dataField  = $scope.dataParams[field._id];
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
                    apply = ($scope.dataParams[key]._apply) && // Ref apply
                            ($scope.record_contact[$scope.dataParams[key]._ref]._value === dataField._objReferenced[key]); // Check value
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

    ////////////////////////////////////////////// SYMPTOMS

    // CHECK ENABLE BUTTONS TRANFER
    $scope.notSelected = function(list) {
        return (typeof(list) === "undefined" || list.length === 0);
    };

    // MOVE SELECTED SYMPTOMS
    $scope.moveSymptoms = function(symptoms, from, to) {
        var indexTemp = [];

        for (i=0; i<symptoms.length; i++) {
            for (j=0; j<from.length; j++)
            {
                if (from[j].key === symptoms[i])
                {
                    var s = from[j];
                    
                    to.push(s);
                    from.splice(j, 1); j--;     // Update index j (from array)
                    symptoms.splice(i, 1); i--; // Update index i (symptoms array)
                }
            }
        }
    };

    // MOVE ALL SYMPTOMS
    $scope.moveAllSymptoms = function(from, to) {
        var indexTemp = [];

        for (j=0; j<from.length; j++)
        {
            var s = from[j];
                
            to.push(s);
            from.splice(j, 1); j--; // Update index j (from array)
        }
    };

    // ADD SYMPTOM TO SELECTED SYMPTOMS
    $scope.addSymptom = function() {
        $scope.moveSymptoms($scope.availableSymptoms, $scope.record_allSymptoms, $scope.record_symptoms);
    };

    // DELETE SYMPTOM FROM SELECTED SYMPTOMS
    $scope.deleteSymptom = function() {
        $scope.moveSymptoms($scope.selectedSymptoms, $scope.record_symptoms, $scope.record_allSymptoms);
    };

    // UPDATE SYMPTOM DESCRIPTION
    $scope.updateSymptomDescription = function(symptoms) {
        if (typeof(symptoms) != "undefined" && symptoms.length > 0)
        {
            $scope.v_symptomDescription = symptomsDictionary[symptoms.last()].description;
        }
    };

    // SYMPTOM DESCRIPTION MONITORING 
    $scope.$watch('availableSymptoms', function (symptoms) {
        $scope.updateSymptomDescription(symptoms);
    });
    $scope.$watch('selectedSymptoms', function (symptoms) {
        $scope.updateSymptomDescription(symptoms);
    });

    ////////////////////////////////////////////// DESCRIPTIONS

    // QUERY: GET TAB DESCRIPTIONS 
    $scope.getTabDescriptions = function() {
        // EXCEPTION FOR TABS DESCRIPTION
        var service_temp   = undefined;
        var serviceBluevia = "CS_BlueVia";
        var serviceUDOTT   = "CS_UDOTT";
        switch ($scope.CSservice)
        {
            case serviceBluevia :
                service_temp = $scope.CSservice.slice(3).toLowerCase(); // cs_bluevia ---> bluevia
                break;
            case serviceUDOTT :
                service_temp = $scope.CSservice.slice(3,-2).toLowerCase(); // cs_udott ---> udo
                break;
            default :
                service_temp = $scope.CSservice;
                break;
        }

        // Get templates and free text template
        var getTemplates        = udoAPI.getTemplates(service_temp, $rootScope.currentLanguage); // Get templates 
        var getFreeTextTemplate = udoAPI.getTextFreeTemplate($rootScope.currentLanguage);        // Get Free text templates 

        $q.all([getTemplates, getFreeTextTemplate]).then(function (response) {
                // Fill templates list
                $scope.templates.list = response[0];

                // Free text template 
                for (i=0; i<response[1].length; i++)
                {
                    $scope.templates.list.push(response[1][i]); // Add templates.list
                }

                if ($scope.templates.list.length === 1)
                {
                    // Set default template
                    $scope.selectTemplate($scope.templates.list[0]); // Content template  
                    $scope.noTemplateByDefault = false; 
                }
                else
                {
                    $scope.noTemplateByDefault = true; 
                }
                
            }, function (response) {
                // WIP Exception
        });
    };

    // SELECT TEMPLATE DESCRIPTION  
    $scope.selectTemplate = function(template) {
        if (typeof(template) != "undefined") 
        {
            $scope.templates.selected = {};
            $scope.templates.selected.template = template; // Monitoring in template directive
        }
    };

    // ------------------------------------------------------------------------
    // ANNOTATIONS
    // ------------------------------------------------------------------------

    // Add new annotation
    $scope.addNotes = function() {
        annotationsOp.launchAddNotesModal($scope, 'annotations', function() {utils.html.scrollToDiv('notes');});
    };

    // Delete annotation
    $scope.deleteAnnotation = function(index) {
        $scope.annotations.splice(index, 1);
    };


    // ------------------------------------------------------------------------
    // ATTACHMENTS
    // ------------------------------------------------------------------------

    // Attach document
    $scope.attachDocument = function() {
        common.attachments.attach(); // Required "file-upload" directive in view
    };

    // ADD FILE ATTACHMENT
    $scope.addAttachment = function(resp) {
        common.attachments.add(resp, 
                               $scope.attachments);
        utils.html.scrollToDiv('attachments');
    };

    // Remove attachment
    $scope.removeAttachment = common.attachments.removeWithActions(function(){}, true);

    ////////////////////////////////////////////// BUILD CONTROLLER

    // CREATE MODEL (FIELD AND MASTER)
    $scope.createModel = function() {
        // Get tab descriptions (templates)
        $scope.getTabDescriptions();

        // For checks (button clear)
        $scope.record_contact = angular.copy($scope.dataValues);
        $scope.masterContact  = angular.copy($scope.record_contact);
    };

    // BUILD WIZARD TICKET
    $scope.buildWizard = function() {
        $scope.createModel();
    };

    // BUILD TOOLBAR AND SIDEBAR
    $scope.buildBar = function() {

        ////////////////////////////////////////////// NAVBAR AND TOOLBAR CONFIGURATION

        $rootScope.toolbarLinks = [
            // active should be 'active' (if active section) or ''
            {type: 'icon', active: '', icon: 'icon-file-text'},
            {type: 'label', title: $scope.title, active: '', class: 'brand'},
            {type: 'labeli18n', title: 'New Ticket', active: '', class: 'brand'}
        ];    

        $rootScope.toolbarIcons = [
            {type: 'action', name: 'Print', url: '#', icon: 'icon-print', active: '', action: common.portal.print},
            {type: 'action', name: 'Refresh', url: '#', icon: 'icon-refresh', active: '', action: common.portal.refresh}
        ];  

        $rootScope.sidebarLinks = [
            // active should be 'active' (if active section) or ''
            {name: 'Attach Document', icon: 'icon-paperclip', action: $scope.attachDocument},
            {name: 'Add Note', icon: 'icon-file-text', action: $scope.addNotes},
            {name: 'Add Symptom', icon: 'icon-lightbulb', action: $scope.addNewUserSymptom},
            {name: 'Help', icon: 'icon-info-sign', action: common.portal.help, apply: false}
        ];
        // Disable attachments for ie
        if ($.browser.msie) {
            $rootScope.sidebarLinks[0].apply = false;
        }

        // Extends sidebarLinks with default sidebar config
        common.toolbar.build($rootScope.sidebarLinks);
    };

    // INIT
    $scope.init = function() {

        if ($scope.cs === 'cs_udott') {
            createDialog({
                template: 'This section is used only to create tickets relative to program of <strong>Trouble Ticketing UDo</strong>.<br>' +
                    'If not, please select, inside the menu, the Service most adapted to your problem!',
                id: 'warnUDoTicket',
                title: 'New UDo Ticket',
                backdrop: true,
                success: {label: 'Ok', fn: function() {}},
            });
        }

        dataProvider.loadScenario($scope.CSservice).then(function() {
            // Scenario
            $scope.scn = dataProvider.scenario($scope.CSservice);

            dataProvider.loadCustomerServiceDetails($scope.CSservice).then(function() {
                $scope.details = dataProvider.customerServiceDetails($scope.CSservice);

                // Title
                $scope.title = $scope.details.name;

                dataProvider.loadParameters($scope.CSservice).then(function(response) {
                    // Parameters
                    var model = angular.copy(dataProvider.parameters($scope.CSservice).model);
                    $scope.dataParams = model.dataParams;
                    $scope.dataValues = model.dataValues;

                    // Exception: delete priority
                    var stringPriority = 'priority';
                    if ($scope.dataParams.hasOwnProperty(stringPriority)) {
                        var ref = $scope.dataParams[stringPriority]._ref; // Reference $scope.dataValues
                        delete $scope.dataParams[stringPriority]; // Remove priority in $scope.dataParams
                        $scope.dataValues.splice(ref, 1); // Remove priority in $scope.dataValues

                        // Rebuild _ref in $scope.dataParams
                        angular.forEach($scope.dataParams, function(field, key) {
                            if (field._ref > ref) {
                                field._ref = field._ref - 1;
                            }
                        });
                    }

                    dataProvider.loadSymptoms($scope.CSservice).then(function(response) {
                        // Symptoms
                        var symptoms = dataProvider.symptoms($scope.CSservice);

                        for (var i=0; i<symptoms.length; i++)
                        {
                            var newObject = {
                                                key:         symptoms[i].code,
                                                name:        symptoms[i].name,
                                                id:          symptoms[i]._id,
                                                description: symptoms[i].description,
                                                selected:    false
                                            };

                            $scope.record_allSymptoms.push(newObject);
                            symptomsDictionary[symptoms[i].code] = { 
                                                                    id:          symptoms[i]._id, 
                                                                    name:        symptoms[i].name,
                                                                    description: symptoms[i].description 
                                                                   };
                        } 
                        $scope.symptomDescription = undefined;
                        
                        // Build toolbar and sidebar
                        $scope.buildBar();

                        // Build Wizard
                        $scope.buildWizard(); 
                    });
                });
            });
        });
    };

    // START CONTROLLER
    $scope.init(); 

}]);




