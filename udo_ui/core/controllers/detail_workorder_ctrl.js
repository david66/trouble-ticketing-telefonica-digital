/**
 * @ngdoc controller
 * @name detailWorkOrderCtrl
 * @description
 *
 * TBD
 *
**/

udoModule.controller(
    'detailWorkOrderCtrl',
    ['$scope', '$rootScope', '$routeParams', 'udoAPI', '$http', '$q', 'common',
    'createStatusChangeDialog', 'annotationsOp', 'modalGen', 'createDialog', 'utils',
    'OBS_WOS', 'SEVERITY_LABELS_WOS', '$filter',
    function($scope, $rootScope, $routeParams, udoAPI, $http, $q, common, 
        createStatusChangeDialog, annotationsOp, modalGen, createDialog, utils,
        OBS_WOS, SEVERITY_LABELS_WOS, $filter) {

    $scope.annotations = [];

    // ------------------------------------------------------------------------
    // ANNOTATIONS
    // ------------------------------------------------------------------------

    // Add new annotation
    var addNotes = function() {
        var result = [$scope.workorder, $scope];
        common.notes.add($scope, 
                         '/api/tt/workorders/', 
                         $scope.workorder._id, 
                         result,
                         function() {
                            utils.html.scrollToDiv('areaNotes')});
    };

    // Update annotations
    $scope.changeAnnotation = function(index, annotation, data) {
        var result = [$scope.workorder, $scope];
        common.notes.changeAnnotation('/api/tt/workorders/', 
                                      $scope.workorder._id, 
                                      index, 
                                      annotation, 
                                      data, 
                                      result);
    };

    // ------------------------------------------------------------------------
    // STATUS
    // ------------------------------------------------------------------------

    // Get possible statuses (status workflow)
    var getPossibleStatuses = function() {
        return common.status.get('api/tt/workorders/', 
                                  $scope.workorder._id);
    }

    var statusChange = function(newValue) {
        //TO-DO: Disable button Replan and enable button Active
        udoAPI.getDetailWO($scope._id).then(
            // Success
            function(response) {
                $scope.workorder = response;
                $scope.fields.dates.real_start_date.value = $scope.workorder.real_date ? 
                    $scope.workorder.real_date.start : undefined;
                $scope.fields.dates.real_end_date.value = $scope.workorder.real_date ?
                    $scope.workorder.real_date.end : undefined;
                $scope.fields.mainData.status.value = $scope.workorder.status;
                $scope.fields.mainData.status.info.cause = ($scope.workorder.status_change.last().cause) ? 
                    $scope.workorder.status_change.last().cause : "";

                buildSideBar(); //Refresh Disabled/enabled buttons sidebar
                if ($.inArray($scope.workorder.status, ['Active', 'Finished', 'Canceled']) !== -1) {
                    disableFields();
                }
            }
        );
    }

    // ------------------------------------------------------------------------
    // OBS
    // ------------------------------------------------------------------------

        // Get possible statuses (status workflow)
    var getPossibleObs = function() {
        return OBS_WOS
    };

    // ------------------------------------------------------------------------
    // SPECIAL WO ACTIONS: Active and Replan
    // ------------------------------------------------------------------------
    var replanWo = function() {
        var footerTemplate ='<button class="btn btn-udo-warning" type="button" ng-click="$modalCancel()">{{$modalCancelLabel}}</button>' +
                            '<button class="btn btn-udo-save" ng-click="$modalSuccess()" ng-disabled="invalidModal()">' +
                                '{{$modalSuccessLabel}}' +
                            '</button>';

        var dataContactOpts = { 
            id: 'replanWoModal', 
            title: 'Replan Work Order'
        };

        var time = {
            planned_start_date: {
                name: 'Planned Start Date',
                value: utils.date.utc2local($scope.workorder.planned_date.start),
                editable: true,
                xeditable: false,
                mandatory: true,
                widget: 'date',
                class: 'span3'
            },
            planned_end_date: {
                name: 'Planned End Date',
                value: utils.date.utc2local($scope.workorder.planned_date.end),
                editable: true,
                xeditable: false,
                mandatory: true,
                widget: 'date',
                class: 'span3'
            },
        };

        var defaultOpts =  {
                bodyClass: 'modal-body modal-body-extend',
                modalClass: 'modal',
                controller: ['$scope', 'time', 'common', 
                    function($scope, time, common) {    
                        $scope.time = time;

                        $scope.alert = null;

                        $scope.closeAlert = function() {
                            $scope.alert = null; // Reset
                        };

                        $scope.showData = function(param) {
                            return common.editable.showData(param);
                        };

                        $scope.invalidModal = function() {
                            var valid = false;
                            var alert = '';

                            var start = (time.planned_start_date.value instanceof Date) ? 
                                            time.planned_start_date.value : utils.date.string2date(time.planned_start_date.value);
                            var end   = (time.planned_end_date.value instanceof Date) ?
                                            time.planned_end_date.value : utils.date.string2date(time.planned_end_date.value);
                            var now   = new Date();

                            if ((start) && (end)) {
                                if (start >= now) {
                                    if (start <= end) {
                                        valid = true;
                                        $scope.alert = null;
                                    }
                                    else {
                                        valid = false;
                                        $scope.alert = {type: 'error', msg: "The start date is later than the end date"};
                                    }
                                }
                                else {
                                    valid = false;
                                    $scope.alert = {type: 'error', msg: "The start date is in the past"};
                                }
                            }
                            else {
                                valid = false;
                                $scope.alert = {type: 'error', msg: "Both Start and End dates are required"};
                            }

                            return (!valid);
                        };
                    }],
                css: { top: '10%', left:'25%', width:'50%', margin: '0 auto' },
                backdrop: true,
                form: false, // Form for enabled/disabled Ok button
                footerTemplate: footerTemplate,
                success: { 
                    label: 'Ok', 
                    fn: function() {
                        var start = (time.planned_start_date.value instanceof Date) ? 
                                        utils.date.local2utc(time.planned_start_date.value) : 
                                            utils.date.local2utc(utils.date.string2date(time.planned_start_date.value));
                        var end   = (time.planned_end_date.value instanceof Date) ? 
                                        utils.date.local2utc(time.planned_end_date.value) : 
                                            utils.date.local2utc(utils.date.string2date(time.planned_end_date.value));

                        // Update model
                        $scope.fields.dates.planned_start_date.value = start;
                        $scope.fields.dates.planned_end_date.value   = end;
                        
                        // Update server
                        var planned_range_date = {
                            "planned_range_date" : {
                                "start": start,
                                "end":   end
                            }
                        };

                        var saveReplanWO = udoAPI.saveReplanWO($scope.workorder._id, planned_range_date);
                        $q.all([saveReplanWO]).then(function(response){
                            // Success
                            angular.noop();
                        });
                    }
                }
        };

        var configOptions = $.extend({}, defaultOpts, dataContactOpts);
        
        createDialog('/betacompany/udo_ui/core/views/modals/replan_wo_modal.html',
                     configOptions, 
                     { 
                        time : time
                     });   
    }
    var refreshStatusWo = function(newStatus) {
        $scope.updateData($scope.fields.mainData.status, newStatus);
    }

    // ------------------------------------------------------------------------
    // ATTACHMENTS
    // ------------------------------------------------------------------------
    var buildAttachments = function(data) {
        // Attachments management on Work Orders
        $scope.removeAttachment = common.attachments.removeWithActions(function(attachment) {
            var url = '/api/tt/workorders/' + $scope.workorder._id + 
                '/attachments/' + '?uri=' + attachment.uri;
            $http.delete(url).success(function() {
                // TODO: refresh contact?
            });
        });
    };

    // Attach document
    var attachDocument = function() {
        common.attachments.attach(); // Required "file-upload" directive in view
    };

    // Add attachment to model
    $scope.addAttachment = function(resp) {
        common.attachments.add(resp, $scope.workorder.attachments);
        utils.html.scrollToDiv('workOrderDetail');
    };


    // ------------------------------------------------------------------------
    // SEVERITY
    // ------------------------------------------------------------------------
    // Get possible severity (severity workflow)
    var getPossibleSeverities = function () {
        var possibleSev = [];
        angular.forEach(SEVERITY_LABELS_WOS, function(value, index) {
            if (value !== "") possibleSev.push({key: index, name: value});
        });
        return possibleSev;
    }

    // ------------------------------------------------------------------------
    // DATA MODEL
    // ------------------------------------------------------------------------
    var buildModel = function() {
        // Reference to annotations
        $scope.annotations = $scope.workorder.annotations =
            annotationsOp.buildAnnotations($scope.workorder.annotations || []);

        var configDefault = { editable: false };

        $scope.fields = {};

        $scope.fields.subject = {
            subject: {
                name: 'Subject',
                paramName: 'subject',
                value: $scope.workorder.subject,
                editable: true,
                widget: 'textarea'
            }
        }

        // Extend fields.subject with data defaults
        angular.forEach($scope.fields.subject, function(field, key) {
            field[key] = angular.extend({}, configDefault, field);
        });

        $scope.fields.mainData = {
            service: {
                name: 'Service',
                value: $scope.workorder.customerservice,
                widget: 'text'
            },
            severity: {
                name: 'Severity',
                value: SEVERITY_LABELS_WOS[$scope.workorder.severity],
                editable: true,
                keySave: 'severity',
                type: getPossibleSeverities(),
                onchange: function() {
                    this.type = getPossibleSeverities();
                },
                widget: 'array'
            },
            leading_ob: {
                name: 'Leading OB',
                value: $scope.workorder.leading_ob,
                editable: true,
                type: getPossibleObs(),
                keySave:  'ob',
                onchange: function() {
                    this.type = getPossibleObs();
                },
                widget: 'array'
            },
            status: {
                value:    $scope.workorder.status,
                editable: true,
                widget:   'array',
                type:     getPossibleStatuses(),
                name:     'Status',
                keySave:  'status',
                info:     {
                    btn: 'icon-info-sign',
                    title: $filter('i18n')('Status info'),
                    // WIP Refactor with isDefined
                    cause: ($scope.workorder.status_change.last().cause) ? 
                        $scope.workorder.status_change.last().cause : "",
                    // WIP Refactor with isDefined
                    description: ($scope.workorder.status_change.last().delayed_reason) ? 
                        $scope.workorder.status_change.last().delayed_reason.code : "",
                    class:    'statusClass'
                },
                onchange: function (newValue) {
                    newValue = newValue || this.value;
                    statusChange(newValue);
                    this.type = getPossibleStatuses();
                }
            }
        };

        // Extend fields.mainData with data defaults
        angular.forEach($scope.fields.mainData, function(field, key) {
            field[key] = angular.extend({}, configDefault, field);
        });

        $scope.fields.dates = {
            planned_start_date: {
                name: 'Planned Start Date',
                value: utils.date.utc2local($scope.workorder.planned_date.start),
                widget: 'date'
            },
            planned_end_date: {
                name: 'Planned End Date',
                value: utils.date.utc2local($scope.workorder.planned_date.end),
                widget: 'date'
            },
            real_start_date: {
                name: 'Real Start Date',
                value: $scope.workorder.real_date ? 
                        utils.date.utc2local($scope.workorder.real_date.start) : utils.date.utc2local($scope.workorder.real_date),
                widget: 'date'
            },
            real_end_date: {
                name: 'Real End Date',
                value: $scope.workorder.real_date ? 
                        utils.date.utc2local($scope.workorder.real_date.end) : utils.date.utc2local($scope.workorder.real_date),
                widget: 'date'
            }
        }

        // Extend fields.dates with data defaults
        angular.forEach($scope.fields.dates, function(field, key) {
            field[key] = angular.extend({}, configDefault, field);
        });

        $scope.fields.impactSrv = {
            imp_srv: {
                name: 'Impact on Service',
                paramName: "impact_on_srv",
                value: $scope.workorder.impact_on_srv,
                editable: true,
                widget: 'textarea'
            }
        };

        // Extend fields.impactSrv with data defaults
        angular.forEach($scope.fields.impactSrv, function(field, key) {
            field[key] = angular.extend({}, configDefault, field);
        });

        $scope.fields.specialData = {
            responsible_name: {
                name: 'Resp. name',
                value: $scope.workorder.responsible.name,
                responsible: true,
                paramName: "name",
                editable: true,
                widget: 'text'
            },
            responsible_mobile: {
                name: 'Resp. mobile',
                value: $scope.workorder.responsible.mobile,
                responsible: true,
                paramName: "mobile",
                editable: true,
                widget: 'text'
            },
            responsible_organization: {
                name: 'Resp. organization',
                value: $scope.workorder.responsible.organization,
                responsible: true,
                paramName: "organization",
                editable: true,
                widget: 'text'
            },
            responsible_email: {
                name: 'Resp. email',
                value: $scope.workorder.responsible.email,
                responsible: true,
                paramName: "email",
                editable: true,
                widget: 'text'
            },
            responsible_telephone: {
                name: 'Resp. phone',
                value: $scope.workorder.responsible.phone,
                responsible: true,
                paramName: "phone",
                editable: true,
                widget: 'text'
            }
        }

        // Extend fields.specialData with data defaults
        angular.forEach($scope.fields.specialData, function(field, key) {
            field[key] = angular.extend({}, configDefault, field);
        });

    };

    function disableFields() {
        $scope.fields.subject.subject.editable = false;
        $scope.fields.impactSrv.imp_srv.editable = false;
        angular.forEach($scope.fields.mainData, function (value, index) {
            if (index !== "status") $scope.fields.mainData[index].editable = false;
        });    
        angular.forEach($scope.fields.specialData, function (value, index) {
            $scope.fields.specialData[index].editable = false;
        });
    }

    function viewMode() {
        //Disable fields
        angular.forEach($scope.fields, function (model, index){
            angular.forEach(model, function (field, index){
                field.editable = false;
            });
        });
        // Hide Buttons in sidebar
        angular.forEach($rootScope.sidebarLinks, function (button, index){
            if(button.onlyReadHide) button.visible = false;
        });

    }
    // ------------------------------------------------------------------------
    // TABS MODEL
    // ------------------------------------------------------------------------
    var buildTabsModel = function() {
        // Tabs
        $scope.fields.tabs = [
            {
                title:"Description",
                icon: 'icon-list',
                contentUrl:"betacompany/udo_ui/core/views/tabs/description.html", 
                data: $scope.workorder.description
            },
            {
                title:"Attachments",
                icon: 'icon-file-text',
                contentUrl:"betacompany/udo_ui/core/views/tabs/attachments.html", 
                data: $scope.workorder.attachments,
                editable: true
            }
        ];
        $scope.navType = 'pills'; 
    };

    // Show data for array, date or time field selection called from view:
    //  <a editable-select="field.value">{{showData(status)}}</a>
    //  <a editable-bsdatetime="field.value">{{showData(date)}}</a>
    $scope.showData = function(param) {
        return common.editable.showData(param);
    };

    // Show work order history modal
    var showWorkOrderHistory = function() {
        var getWorkOrderDetail = udoAPI.getWorkOrderDetail($scope.workorder._id);
        $q.all([getWorkOrderDetail]).then(function(response){
            var wo = response[0];

            common.history.showHistory(wo, 
                                       $scope.workorder.eid, 
                                       'woContHistModal', 
                                       'Work Order History');
        });
    };
    // Update data in server called from view (onbeforesave in editable directive)
    $scope.updateData = function(field, newValue) {
        var url,
            payload,
            oldValue = field.value;

        var successFn = function() {
            field.onchange(newValue);
        };

        var cancelFn = function() {
            field.value = oldValue;
        };

        if (field.name === 'Status') {
            createStatusChangeDialog(newValue, 
                                     "workorders", 
                                     $scope.workorder._id, 
                                     successFn,
                                     cancelFn);
        }
        else {
            url = '/api/tt/workorders/' + $scope.workorder._id;
            payload = newValue;
            if (field.keySave) url += "/" + field.keySave;
            if (field.paramName) {
                payload = {};
                payload[field.paramName] = newValue;
            }
            if (field.responsible) payload = {"responsible": payload};
            
            var d = $q.defer();
            $http.put(url, angular.toJson(payload)).success(function(res) {
                    d.resolve();
                }).error(function(e) {
                    d.reject('Error');
                });
            return d.promise;
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
            {
                name: 'Change to Planned',
                icon: 'icon-play-circle', 
                visible: ($scope.workorder.status === 'New'),
                onlyReadHide: true, 
                action: function() {refreshStatusWo('Planned')}
            },
            {
                name: 'Active',
                icon: 'icon-play-circle',
                visible: !($.inArray($scope.workorder.status, ['New', 'Active', 'Finished', 'Canceled']) !== -1),
                onlyReadHide: true,
                action: function() {refreshStatusWo('Active')}
            },
            {
                name: 'Replan',
                icon: 'icon-calendar',
                visible: !($.inArray($scope.workorder.status, ['Active', 'Finished', 'Canceled']) !== -1),
                onlyReadHide: true,
                action: replanWo
            },
            {
                name: 'Finish',
                icon: 'icon-play-circle', 
                visible: ($scope.workorder.status === 'Active'),
                onlyReadHide: true,
                action: function() {refreshStatusWo('Finished')}
            },
            {
                name: 'Cancel',
                icon: 'icon-play-circle', 
                visible: !($.inArray($scope.workorder.status, ['Active', 'Finished', 'Canceled']) !== -1),
                onlyReadHide: true,
                action: function() {refreshStatusWo('Canceled')}
            },
            {name: 'Attach Document', icon: 'icon-paperclip', action: attachDocument, onlyReadHide: true},
            {name: 'Add Note', url: '#', icon: 'icon-file-text', action: addNotes, onlyReadHide: true},
            {name: 'Work Order History', icon: 'icon-time', action: showWorkOrderHistory},
            {name: 'Help', icon: 'icon-info-sign', action: common.portal.help, apply: false}
        ];

        // Extends $rootScope.sidebarLinks with default sidebar config
        common.toolbar.build($rootScope.sidebarLinks);
    };

    // Build bar (toolbar -links and icons- and sidebar)
    var buildBar = function() {
        $rootScope.toolbarLinks = [
            // active should be 'active' (if active section) or ''
            {type: 'link', title: '#' + $scope.workorder.eid, url: '#', active: '', class: 'brand'},
            {type: 'linki18n', title: 'Work Order', url: '/ui#/tt/workorders/' + $scope.workorder._id, active: 'active', class: ''}
        ]; 

        $rootScope.toolbarIcons = [
            {type: 'action', name: 'Print', url: '#', icon: 'icon-print', active: '', action: common.portal.print},
            {type: 'action', name: 'Refresh', url: '#', icon: 'icon-refresh', active: '', action: common.portal.refresh}
        ]; 

        buildSideBar();
    };
    
    var init = function() {
        udoAPI.getDetailWO($routeParams.eid).then(
            // Success
            function(response) {
                $scope._id = response._id;
                $scope.workorder = response;
                $scope.upload_detail_wos_url = '/api/dms/workorder/' + $scope.workorder._id + '/oldupload';
                buildBar();
                buildModel();
                buildTabsModel();
                buildAttachments(response);
                // Set current wo as a recented visited
                $scope.pushRecentEntityId('workorders', $scope.workorder.eid);

                if(!$scope.workorder.can_modify)  viewMode(); //Only View Mode
                //Disable fields if Active status
                else if ($.inArray($scope.workorder.status, ['Active', 'Finished', 'Canceled']) !== -1) {
                    disableFields();
                }
            },
            // Error
            function(response) {
                //TODO: Handle error. Redirect to error page
            });
    };
    init();

}]);
