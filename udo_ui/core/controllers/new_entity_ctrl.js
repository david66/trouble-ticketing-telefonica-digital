// Just a controller to show new wizard
udoModule.controller(
        'newEntityCtrl', 
        ['$scope', '$rootScope', '$location', '$timeout', '$routeParams', '$http', '$q', 
        'createDialog', 'udoAPI', 'annotationsOp', 'utils', 'common', 'OBS_WOS',
        function($scope, $rootScope, $location, $timeout, $routeParams, $http, $q,
                 createDialog, udoAPI, annotationsOp, utils, common, OBS_WOS) {

    // ------------------------------------------------------------------------
    // VARIABLES
    // ------------------------------------------------------------------------

    $scope.newEntity = {}; // For save wizard
    $scope.url = $location.$$path.replace(/\/ui#/g, '');

    $scope.selectOption  = "Select an option";
    $scope.selectDate    = "Enter a date";
    $scope.attachFile    = "Attach Document";

    $scope.percent = 0;

    $scope.buttons  = {
                        cancel:        "Cancel",
                        clear:         "Clear Fields",
                        save:          "Save"
                      };

    // ------------------------------------------------------------------------
    // ATTACHMENTS
    // ------------------------------------------------------------------------

    // Attach document
    var attachDocument = function() {
        common.attachments.attach(); // Required "file-upload" directive in view
    };

    // ADD FILE ATTACHMENT
    $scope.addAttachment = function(resp) {
        common.attachments.add(resp, $scope.attachments);
        utils.html.scrollToDiv('attachments');
    };

    // Remove attachment
    $scope.removeAttachment = common.attachments.removeWithActions(function(){}, true);

    // ------------------------------------------------------------------------
    // ANNOTATIONS
    // ------------------------------------------------------------------------

    // Add new annotation
    var addNotes = function() {
        annotationsOp.launchAddNotesModal($scope, 'annotations', function() {utils.html.scrollToDiv('notes');});
    };

    // Delete annotation
    $scope.deleteAnnotation = function(index) {
        $scope.annotations.splice(index, 1);
    };

    // ------------------------------------------------------------------------
    // DATEPICKER CONFIG
    // ------------------------------------------------------------------------

    // DATEPICKER CONFIG 
    $scope.disabledWeek = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.openCalendar = function(field) {
        $timeout(function() {
            field.openCalendar = true;
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

    // ------------------------------------------------------------------------
    // NEW ENTITY CONFIG
    // ------------------------------------------------------------------------

    var configDefault = { toolbarIcons: [
                                         {type: 'action', name: 'Print', url: '#', icon: 'icon-print', active: '', action: common.portal.print},
                                         {type: 'action', name: 'Refresh', url: '#', icon: 'icon-refresh', active: '', action: common.portal.refresh}
                                        ]
                        };
    var dataDefault = { 
                        mandatory: false, 
                        value: ''
                      };

    $scope.configs = {
        '/tt/newworkorder/': {
            'title':        'New Work Order', 
            'toolbarLinks': [ // ToolBar
                                // active should be 'active' (if active section) or ''
                                {type: 'icon', active: '', icon: 'icon-file-text'},
                                {type: 'linki18n', title: 'New Work Order', class: 'brand'} 
                            ],
            'sidebarLinks': [ // SideBar
                                {name: 'Attach Document', icon: 'icon-paperclip', action: attachDocument},
                                {name: 'Add Note', icon: 'icon-file-text', action: addNotes},
                                {name: 'Help', icon: 'icon-info-sign', action: common.portal.help, apply: false}
                            ],   
            'hasNotes': true,
            'hasAttachments': true,
            'data': [   // Data contact
                        {
                            'subject': {
                                label: 'Subject', mandatory: true, widget: 'text', class: 'span3'
                            },
                            'severity': {
                                label: 'Severity', mandatory: true, widget: 'array', class: 'span3',
                                options: {
                                            dataset: [ 
                                                        { key: 0, name: "Minor"}, 
                                                        { key: 3, name: "Major"}, 
                                                        { key: 5, name: "Critical"}
                                                     ]
                                         }
                            },
                            'customerservice': {
                                label: 'Service', mandatory: true, widget: 'array', class: 'span3',
                                options: {
                                            dataset: [],
                                            fn: function () { // Return success for scope
                                                var self = this;
                                                var success = function(response) {
                                                    var csList = response[0];
                                                    angular.forEach(csList, function (obj, key) {
                                                        var newObject = {}
                                                        newObject['key']  = obj.code;
                                                        newObject['name'] = obj.name;

                                                        self.options.dataset.push(newObject);
                                                    });

                                                    $scope.updateMaster();
                                                };

                                                // Get Services
                                                var getServices = udoAPI.getCSsfromWO(); 
                                                return $q.all([getServices]).then(success);
                                            },
                                         }
                            },
                            'leading_ob': {
                                label: 'Leading OB', widget: 'array', class: 'span3',
                                options: {
                                            dataset: OBS_WOS
                                         }
                            },
                            'planned_date_start': {
                                label: 'Planned Start Date', mandatory: true, widget: 'time', class: 'span3',
                                openCalendar: false, 
                                min: {
                                        date: null,
                                        fn: function () {
                                            this.date = (new Date().getTime() + 24*60*60*1000); // Tomorrow
                                        }
                                    }, 
                                max: {
                                        date: '2099-12-31'
                                     },
                                save: {
                                        fn: function (field, key) {
                                            this[key] = utils.date.local2utc(field.value); // Convert to UTC
                                        }
                                      }
                            },
                            'planned_date_end': {
                                label: 'Planned End Date', mandatory: true, widget: 'time', class: 'span3',
                                openCalendar: false, 
                                max: {
                                        date: '2099-12-31'
                                     },
                                save: {
                                        fn: function (field, key) {
                                            this[key] = utils.date.local2utc(field.value); // Convert to UTC
                                        }
                                      }
                            },
                            'name': {
                                label: 'Resp. name', mandatory: true,
                                widget: 'text', class: 'span3',
                                save: {
                                        fn: function (field, key) {
                                            if (typeof(this['responsible']) === "undefined") {
                                                this['responsible'] = {};
                                            }

                                            this['responsible'][key] = field.value;
                                        }
                                }
                            },
                            'email': {
                                label: 'Resp. email', mandatory: true, 
                                widget: 'email', class: 'span3',
                                save: {
                                        fn: function (field, key) {
                                            if (typeof(this['responsible']) === "undefined") {
                                                this['responsible'] = {};
                                            }
                                            
                                            this['responsible'][key] = field.value;
                                        }
                                }
                            },
                            'organization': {
                                label: 'Resp. organization', widget: 'text', class: 'span3',
                                save: {
                                        fn: function (field, key) {
                                            if (typeof(this['responsible']) === "undefined") {
                                                this['responsible'] = {};
                                            }
                                            
                                            this['responsible'][key] = field.value;
                                        }
                                }
                            },
                            'phone': {
                                label: 'Resp. phone', widget: 'text', class: 'span3',
                                save: {
                                        fn: function (field, key) {
                                            if (typeof(this['responsible']) === "undefined") {
                                                this['responsible'] = {};
                                            }
                                            
                                            this['responsible'][key] = field.value;
                                        }
                                }
                            },
                            'mobile': {
                                label: 'Resp. mobile', widget: 'text', class: 'span3',
                                save: {
                                        fn: function (field, key) {
                                            if (typeof(this['responsible']) === "undefined") {
                                                this['responsible'] = {};
                                            }
                                            
                                            this['responsible'][key] = field.value;
                                        }
                                }
                            },
                            'attach_doc': {
                                label: 'Attach Document', widget: 'attach', class: 'span3',
                                hide: true // Hide, attach link from sidebar
                            }
                        },
                        {
                            'impact_on_srv': {
                                label: 'Impact on Service', widget: 'textarea', class: 'span12', rows: 3
                            }
                        },
                        {
                            'description':  {
                                                label: 'Description', widget: 'textarea', class: 'span12', rows: 5
                                            }
                        }
                    ],
            'save': { // Function save workorder
                        successLabel: 'The work order was successfully created!',
                        buttonListLabel: 'Work Orders',
                        buttonListPath:  '/tt/workorders/',
                        fn: function () {
                            $scope.newEntity = {};

                            // Fill record
                            angular.forEach($scope.record, function(container, key) {
                                angular.forEach(container, function(field, key) {
                                    if ( (typeof(field.save) != "undefined") && 
                                                        (angular.isFunction(field.save.fn)) ) { 
                                        var fn = field.save.fn; 
                                        fn.call($scope.newEntity, field, key);
                                    }
                                    else {
                                        $scope.newEntity[key] = field.value;
                                    }
                                });
                            });

                            $scope.newEntity['annotations'] = (!$scope.annotations) ? [] : $scope.annotations;
                            $scope.newEntity['attachments'] = (!$scope.attachments) ? [] : $scope.attachments;

                            var saveEntity = udoAPI.saveWorkOrder($scope.newEntity); // Save WorkOrder

                            return saveEntity;
                        }
                    }
        },
        '/tt/newproblem/': {
            'title':        'New Problem', 
            'toolbarLinks': [ // ToolBar
                                // active should be 'active' (if active section) or ''
                                {type: 'icon', active: '', icon: 'icon-file-text'},
                                {type: 'linki18n', title: 'New Problem', class: 'brand'} 
                            ],
            'sidebarLinks': [ // SideBar
                                {name: 'Attach Document', icon: 'icon-paperclip', action: attachDocument},
                                {name: 'Add Note', icon: 'icon-file-text', action: addNotes},
                                {name: 'Help', icon: 'icon-info-sign', action: common.portal.help}
                            ],   
            'hasNotes': true,
            'hasAttachments': true,
            'data': [   // Data contact
                        {
                            'type': {
                                label: 'Problem Type', mandatory: true, widget: 'array', class: 'span3',
                                csDictionary: [],
                                options: {
                                            dataset: [],
                                            fn: function () { // Return success for scope
                                                var self = this;
                                                var success = function(response) {
                                                    var data = response[0];
                                                    angular.forEach(data, function(pType, index) {
                                                        angular.forEach(pType.affected, function(affected, index) {
                                                            var newObject = {}
                                                            newObject['key']        = affected.code;
                                                            newObject['name']       = pType.code;
                                                            newObject['collection'] = affected.collection.replace('.', '/');
                                                            
                                                            self.options.dataset.push(newObject);

                                                            self.csDictionary[newObject.key] = newObject.name;
                                                        });
                                                    });

                                                    $scope.updateMaster();
                                                };

                                                // Get Problem Type
                                                var getProblemTypes = udoAPI.getProblemTypes(); 
                                                return $q.all([getProblemTypes]).then(success);
                                            }
                                         },
                                save: {
                                        fn: function (field, key) {
                                            this['type'] = field.csDictionary[field.value];
                                        }
                                      },
                                change: {
                                            fn: function (newValue) {
                                                var self = undefined;

                                                // Search affected field [this <--- data object]
                                                var keepGoing = true; // There is no way to break the loop if the condition is match !!!!!
                                                angular.forEach(this, function(container, key) {
                                                    if ( (keepGoing) && (typeof(container.affected) != "undefined") ) {
                                                        self = container.affected;
                                                        keepGoing = false;
                                                    } 
                                                });

                                                var success = function(response) {
                                                    self.options.dataset = []; // Reset

                                                    var data = response[0];
                                                    angular.forEach(data, function(resource, index) {
                                                        var newObject = {}
                                                        newObject['key']  = resource.data.code;
                                                        newObject['name'] = resource.data.name;

                                                        self.options.dataset.push(newObject);
                                                    });

                                                    self.value = ""; // Reset
                                                };

                                                var failed = function(response) {
                                                    // Reset
                                                    self.options.dataset = []; 
                                                    self.value = "";
                                                };

                                                if (typeof(self) != "undefined") {
                                                    // Get affected
                                                    var getAResource = udoAPI.getAffectedResource(newValue);
                                                    return $q.all([getAResource]).then(success, failed);
                                                }
                                                else {
                                                    return;
                                                }
                                            }
                                        }
                            },
                            'affected': {
                                label: 'Associate Phisical Resource', widget: 'array', class: 'span3',
                                options: {
                                            dataset: [],
                                            fn: function () { // Return promise for scope
                                                var self = this;
                                                var success = function(response) {
                                                    angular.forEach(response, function(resource, index) {
                                                        var newObject = {}
                                                        newObject['key']  = resource.data.code;
                                                        newObject['name'] = resource.data.name;

                                                        self.options.dataset.push(newObject);
                                                    });

                                                    self.value = ""; // Reset

                                                    $scope.updateMaster();
                                                };

                                                // Get affected 
                                                if ( (typeof(this.value) != "undefined") && (this.value != null) ) {
                                                    var getAResource = udoAPI.getAffectedResource(this.value); 
                                                    return $q.all([getAResource]).then(success);
                                                }
                                                else {
                                                    return;
                                                }
                                            }
                                         },
                                save: {
                                        fn: function (field, key) {
                                            if ( (typeof(field.value) != "undefined") && (field.value != "") ) {
                                                this['affected'].push({collection: "resource", code: field.value, instance: ""});
                                            }
                                        }
                                      }
                            },
                            'customerservice': {
                                label: 'Customer Services', mandatory: true, widget: 'array', class: 'span3',
                                options: {
                                            dataset: [],
                                            fn: function () { // Return success for scope
                                                var self = this;
                                                var success = function(response) {
                                                    var dataCS = response[0];
                                                    angular.forEach(dataCS, function(cs, index) {
                                                        var newObject = {}
                                                        newObject['key']  = cs;
                                                        newObject['name'] = cs;
                                                            
                                                        self.options.dataset.push(newObject);
                                                    });

                                                    $scope.updateMaster();
                                                };

                                                // Get Services
                                                var getServices = udoAPI.getCSsfromUser(); 
                                                return $q.all([getServices]).then(success);
                                            }
                                         },
                                save: {
                                        fn: function (field, key) {
                                            // Get this[customerservice].value
                                            this['affected'].push({collection: "service.customer", code: field.value, instance: ""});
                                        }
                                      }
                            },
                            'target_date': {
                                label: 'Target Date', widget: 'date', class: 'span3',
                                openCalendar: false,
                                save: {
                                        fn: function (field, key) {
                                            if ( (typeof(field.value) != "undefined") && (field.value != "") ) {
                                                this[key] = utils.date.local2utc(field.value); // Convert to UTC
                                            }
                                        }
                                      }
                            },
                            'attach_doc': {
                                label: 'Attach Document', widget: 'attach', class: 'span3',
                                hide: true // Hide, attach link from sidebar
                            }
                        }
                    ],
            'save': { // Function save problem
                        successLabel: 'The Problem was successfully created!',
                        buttonListLabel: 'Problems',
                        buttonListPath:  '/tt/problems/',
                        fn: function () {
                            var annotations = (!$scope.annotations) ? [] : $scope.annotations;
                            var attachments = (!$scope.attachments) ? [] : $scope.attachments;

                            // HARDCODED Default
                            $scope.newEntity = {
                                                    affected:     [],
                                                    priority:     "3", 
                                                    severity:     "3",
                                                    annotations:  annotations,
                                                    attachments:  attachments
                                                };

                            // Fill record
                            angular.forEach($scope.record, function(container, key) {
                                angular.forEach(container, function(field, key) {
                                    if ( (typeof(field.save) != "undefined") && 
                                                        (angular.isFunction(field.save.fn)) ) { 
                                        var fn = field.save.fn; 
                                        fn.call($scope.newEntity, field, key);
                                    }
                                    else {
                                        $scope.newEntity[key] = field.value;
                                    }
                                });
                            });

                            $scope.newEntity['annotations'] = (!$scope.annotations) ? [] : $scope.annotations;
                            $scope.newEntity['attachments'] = (!$scope.attachments) ? [] : $scope.attachments;

                            var saveEntity = udoAPI.saveProblem($scope.newEntity); // Save Problem

                            return saveEntity;
                        }
                    }
        },
        '/tt/newsymptom/': {
            'title':        'New Symptom', 
            'toolbarLinks': [ // ToolBar
                                // active should be 'active' (if active section) or ''
                                {type: 'icon', active: '', icon: 'icon-file-text'},
                                {type: 'linki18n', title: 'New Symptom', class: 'brand'} 
                            ],
            'sidebarLinks': [ // SideBar
                                {name: 'Help', icon: 'icon-info-sign', action: common.portal.help}
                            ],   
            'hasNotes': false,
            'hasAttachments': false,
            'data': [   // Data contact
                        {
                            'code': {
                                label: 'Symptom Code', mandatory: true, widget: 'text', class: 'span3'
                            },
                            'name': {
                                label: 'Name', mandatory: true, widget: 'text', class: 'span3'
                            },
                            'problems': {
                                label: 'Problem Type', mandatory: true, widget: 'array', class: 'span3',
                                options: {
                                            dataset: [],
                                            fn: function () { // Return success for scope
                                                var self = this;
                                                var success = function(response) {
                                                    var data = response[0];
                                                    angular.forEach(data, function(pType, index) {
                                                        angular.forEach(pType.affected, function(affected, index) {
                                                            var newObject = {}
                                                            newObject['key']        = pType.code;
                                                            newObject['name']       = pType.code;
                                                            newObject['collection'] = affected.collection.replace('.', '/');
                                                            
                                                            self.options.dataset.push(newObject);
                                                        });
                                                    });

                                                    $scope.updateMaster();
                                                };

                                                // Get Problem Type
                                                var getProblemTypes = udoAPI.getProblemTypes(); 
                                                return $q.all([getProblemTypes]).then(success);
                                            }
                                         },
                                save: {
                                        fn: function (field, key) {
                                            if (typeof(this.problems) === "undefined")
                                            {
                                                this['problems'] = {};
                                            }

                                            this['problems'][field.value] = "1";
                                        }
                                      }
                            }
                        },
                        {
                            'description':  {
                                                label: 'Description', mandatory: true, widget: 'textarea', class: 'span12', rows: 5,
                                            }
                        }
                    ],
            'save': { // Function save symptom
                        successLabel: 'The Symptom was successfully created!',
                        buttonListLabel: 'Symptoms',
                        buttonListPath:  '/tt/symptoms/',
                        fn: function () {
                            $scope.newEntity = {};

                            // Fill record
                            angular.forEach($scope.record, function(container, key) {
                                angular.forEach(container, function(field, key) {
                                    if ( (typeof(field.save) != "undefined") && 
                                                        (angular.isFunction(field.save.fn)) ) { 
                                        var fn = field.save.fn; 
                                        fn.call($scope.newEntity, field, key);
                                    }
                                    else {
                                        $scope.newEntity[key] = field.value;
                                    }
                                });
                            });

                            var saveEntity = udoAPI.saveSymptom($scope.newEntity); // Save Symptom

                            return saveEntity;
                        }
                    }
        },
        '/tt/newproblemtype/': {
            'title':        'Problem Type', 
            'toolbarLinks': [ // ToolBar
                                // active should be 'active' (if active section) or ''
                                {type: 'icon', active: '', icon: 'icon-file-text'},
                                {type: 'linki18n', title: 'Problem Type', class: 'brand'} 
                            ],
            'sidebarLinks': [ // SideBar
                                {name: 'Help', icon: 'icon-info-sign', action: common.portal.help}
                            ],   
            'hasNotes': false,
            'hasAttachments': false,
            'data': [   // Data contact
                        {
                            'code': {
                                label: 'Problem Type Code', mandatory: true, widget: 'text', class: 'span3'
                            },
                            'affected': {
                                label: 'Customer Services', mandatory: true, widget: 'array', class: 'span3',
                                options: {
                                            dataset: [],
                                            fn: function () { // Return success for scope
                                                var self = this;
                                                var success = function(response) {
                                                    var data = response[0];
                                                    angular.forEach(data, function(cs, index) {
                                                        var newObject = {}
                                                        newObject['key']        = cs;
                                                        newObject['name']       = cs;
                                                        
                                                        self.options.dataset.push(newObject);
                                                    });

                                                    $scope.updateMaster();
                                                };

                                                // Get customer services
                                                var getCSsfromUser = udoAPI.getCSsfromUser(); 
                                                return $q.all([getCSsfromUser]).then(success);
                                            }
                                         },
                                save: {
                                        fn: function (field, key) {
                                            if (typeof(this['affected']) === "undefined")
                                            {
                                                this['affected'] = [{}];
                                            }

                                            this['affected'][0]['collection'] = "service.customer";
                                            this['affected'][0]['code'] = field.value;
                                        }
                                      }
                            }
                        },
                        {
                            'description':  {
                                                label: 'Description', mandatory: true, widget: 'textarea', class: 'span12', rows: 5,
                                            }
                        }
                    ],
            'save': { // Function save problemtype
                        successLabel: 'The Problem Type was successfully created!',
                        buttonListLabel: 'Problem Types',
                        buttonListPath:  '/tt/problemtypes/',
                        fn: function () {
                            // HARDCODED Default
                            $scope.newEntity = {
                                                    tags: [],
                                                    estimated_time: "8734365",
                                                    affectation_ratio: "1.0",
                                                    count: "0",
                                                    symptoms: {}
                                                };

                            // Fill record
                            angular.forEach($scope.record, function(container, key) {
                                angular.forEach(container, function(field, key) {
                                    if ( (typeof(field.save) != "undefined") && 
                                                        (angular.isFunction(field.save.fn)) ) { 
                                        var fn = field.save.fn; 
                                        fn.call($scope.newEntity, field, key);
                                    }
                                    else {
                                        $scope.newEntity[key] = field.value;
                                    }
                                });
                            });

                            var saveEntity = udoAPI.saveProblemType($scope.newEntity); // Save Problem type

                            return saveEntity;
                        }
                    }
        }
    };
    // Disable attachments for IE
    if ($.browser.msie) {
        for (var i in $scope.configs) {
            for (var j = 0; j < $scope.configs[i].sidebarLinks.length; j++) {
                if ($scope.configs[i].sidebarLinks[j].name === 'Attach Document') {
                    $scope.configs[i].sidebarLinks[j].apply = false;
                }
            }
        }
    }

    // ------------------------------------------------------------------------
    // MODEL FUNCTIONS CONTROLLER
    // ------------------------------------------------------------------------

    // CHECK ENABLE BUTTON CLEAR
    $scope.isUnchanged = function() {
        return ( angular.equals($scope.record,  $scope.master) && 
                ($scope.attachments.length === 0) && ($scope.annotations.length === 0));
    };

    // CHECK DESCRIPTION FIELD
    $scope.isDescription = function(key) {
        return (key === 'description');
    }

    // ------------------------------------------------------------------------
    // BUTTONS WIZARD
    // ------------------------------------------------------------------------

    // BUTTON CANCEL
    $scope.cancel = function() {
        var bodyTemplate =  '<div>' +
                                // Next div line: style and class => Defined in service, don't touch
                                '<div class="modal-body info" style="color: #666666;">' + 
                                    '<p>{{ "Leave Wizard Confirmation"|i18n }}</p>' +
                                '</div>' +
                            '</div>';

        $scope.launchCancelNewEntityModal = function() {
            createDialog({
                            template: bodyTemplate,
                            id: 'cancelNewEntityModal',
                            title: $scope.title,
                            backdrop: true,
                            success: {label: 'Ok', fn: function() {$scope.clear(false);}},
                            cancel:  {label: 'Cancel', fn: null}
                         });
        };

        $scope.launchCancelNewEntityModal(); // Show modal
    };

    // BUTTON SAVE
    $scope.save = function() {
        var fn = $scope.configs[$scope.url].save.fn;
        var saveEntity = fn.call();

        $scope.percent = 75;
        $q.all([saveEntity]).then(function (response) {
                // Success
                $scope.successSave = true;
                $scope._id         = angular.fromJson(response[0]); 

                $scope.percent = 100;
                $scope.showNewEntityResult(); // Show dialog modal: success
            }, function (response) {
                // Error
                var json = response.data;
                var responseError;
                
                if (!json.field_errors){
                    responseError = angular.fromJson(response.data);
                }
                else {
                    angular.forEach(json['field_errors'], function(content, field) {
                        angular.forEach(content, function(error, index) {
                            responseError = field + ": " + error.replace(/\*/g, " ");
                        })
                    });
                }

                $scope.successSave = false;
                $scope.errorSave = responseError;

                $scope.percent = 100;
                $scope.showNewEntityResult(); // Show dialog modal: error
        });
    };

    // SHOW MODAL: SAVE NEW WIZARD RESULT
    $scope.showNewEntityResult = function() {
        $scope.percent = 0; // Reset progress bar

        var bodyTemplate =  // Next div line: style and class => Defined in service, don't touch
                            '<div class="modal-body info" style="color: #666666;">' +
                                '<p ng-if="successSave">{{ "' + 
                                    $scope.configs[$scope.url].save.successLabel +'"|i18n }}</p>' +
                                '<p ng-if="!successSave">{{ "Error:"|i18n }} {{ errorSave }}</p>' +
                            '</div>';

        var footerTemplate ='<button ng-if="successSave" class="btn btn-udo-save" ng-click="goToList()"><i class="icon-tasks"></i> {{"' +
                                $scope.configs[$scope.url].save.buttonListLabel + '"}} </button>' +
                            '<button class="btn" ng-click="$modalSuccess()">' +
                                '{{$modalSuccessLabel}}' +
                            '</button>';

        $scope.launchSaveNewEntityModal = function() {
            createDialog({
                            template: bodyTemplate,
                            id: 'saveNewEntityModal',
                            title: $scope.title,
                            backdrop: true,
                            handleEsc: false, // Disable Esc key (cancel)
                            controller: ['$scope', '$location', 'path', 'successSave', 'errorSave',
                                                    function($scope, $location, path, successSave, errorSave) {
                                            $scope.successSave  = successSave;
                                            $scope.errorSave    = errorSave;
                                            $scope.path         = path;

                                            $scope.goToList = function() {
                                                $scope.$modalClose();        // Close the dialog
                                                $location.path($scope.path); // Redirect to detail contact
                                            };
                                        }],
                            success: {label: 'Close', fn: function() {if ($scope.successSave) {$scope.init();}}}, // Success => reload model
                            footerTemplate: footerTemplate
                        },
                        {
                            path:        $scope.configs[$scope.url].save.buttonListPath,
                            successSave: $scope.successSave,
                            errorSave:   $scope.errorSave
                        });
        };

        $scope.launchSaveNewEntityModal(); // Show modal
    };

    // BUTTON CLEAR
    $scope.clear = function(confirm) {

        var clear = function() {
            // Recovery master
            $scope.record = angular.copy($scope.master);

            // Notes
            $scope.annotations = []; // Empty

            // Attachments
            $scope.attachments = []; // Empty

            $scope.percent = 0;
        };

        // Modal
        var bodyTemplate =  '<div>' +
                                // Next div line: style and class => Defined in service, don't touch
                                '<div class="modal-body info" style="color: #666666;">' +
                                    //'<p>{{ "Clear Wizard Confirmation"|i18n }}</p>' +
                                    '<p>{{ "Are you sure you want to clear the wizard? All changes not saved will be lost."|i18n }}</p>' +
                                '</div>' +
                            '</div>';

        var launchClearNewEntityModal = function() {
            createDialog({
                            template: bodyTemplate,
                            id: 'clearNewEntityModal',
                            title: $scope.title,
                            backdrop: true,
                            success: {label: 'Ok', fn: function() {clear()}},
                            cancel:  {label: 'Cancel', fn: null}
                         });
        };

        if (confirm) {
            launchClearNewEntityModal(); // Show modal for confirm
        }
        else {
            clear(); // Clear
        }
    };

    // ------------------------------------------------------------------------
    // BUILD MODEL
    // ------------------------------------------------------------------------

    // EVENT CHANGE
    $scope.change = function(field, newValue) {
        // Event on-change
        if ( (typeof(field.change) != "undefined") && (angular.isFunction(field.change.fn)) ) { 
            // Function for change event
            var fn = field.change.fn;
            fn.call($scope.record, newValue);
        }
    };

    // UPDATE MODEL
    $scope.updateMaster = function() {
        // Update master for check clear button
        $scope.master = angular.copy($scope.record);
    };

    // CREATE MODEL (FIELD AND MASTER)
    $scope.createModel = function() {
        // Extend config with config defaults
        $scope.configs[$scope.url] = angular.extend({}, configDefault, $scope.configs[$scope.url]);

        // Fill title
        $scope.title = $scope.configs[$scope.url].title;
        $scope.hasNotes = $scope.configs[$scope.url].hasNotes;
        $scope.hasAttachments = $scope.configs[$scope.url].hasAttachments;

        // Extend data with data defaults
        angular.forEach($scope.configs[$scope.url].data, function(container, key) {
            angular.forEach(container, function(field, key) {
                field = angular.extend({}, dataDefault, field);
            });
        });
        $scope.record = angular.copy($scope.configs[$scope.url].data);

        $scope.attachments = [];
        $scope.annotations = [];

        // BUILD SIDEBAR

        // Extends sidebarLinks with default sidebar config
        common.toolbar.build($scope.configs[$scope.url].sidebarLinks);

        // ONLY SHOW ICON AND APPLIED LINK
        $rootScope.toolbarLinks = $scope.configs[$scope.url].toolbarLinks; 
        $rootScope.toolbarIcons = $scope.configs[$scope.url].toolbarIcons;
        $rootScope.sidebarLinks = $scope.configs[$scope.url].sidebarLinks;

        // Fill data model (record)
        angular.forEach($scope.record, function(container, key) {
            angular.forEach(container, function(field, key) {

                switch (field.widget) {
                    case "array":
                        // Fill Options
                        if ( (typeof(field.options) != "undefined") && (angular.isFunction(field.options.fn)) ) { 
                            // Function for fill options
                            var fn = field.options.fn;
                            fn.call(field);
                        }
                        break;

                    case "date":
                        // Fill minDate
                        if ( (typeof(field.min) != "undefined") && (angular.isFunction(field.min.fn)) ) { 
                            // Function for fill minDate
                            var fn = field.min.fn;
                            fn.call(field.min);
                        }
                        break;

                    default:
                        break;
                };

            });
        });

        $scope.master = angular.copy($scope.record);
        };

    // BUILD WIZARD
    $scope.buildWizard = function() {
        $scope.createModel();
    };

    // INIT
    $scope.init = function() {
        $scope.buildWizard();
    };

    // START CONTROLLER
    $scope.init(); 
}]);

