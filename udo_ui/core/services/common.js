/**
 * @ngdoc service
 * @name udoModule.service:common
 * @description UDo service to provide common functions to UDo portal.
 */
angular.module('UDo.services', []).factory('common',
['$window', '$rootScope', '$route', '$q', '$http', '$filter', '$location',
 'udoAPI', 'utils', 'modalGen', 'annotationsOp', 'createDialog',
 function common($window, $rootScope, $route, $q, $http, $filter, $location,
                 udoAPI, utils, modalGen, annotationsOp, createDialog) {

    return {
        portal: { 
           /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#portal.print
             * @description Print the current window (route). Example:
             * <pre>
             * common.portal.print();
             * </pre>
             */
            print: function() {
                $window.print();
            },
           /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#portal.href
             * @description Redirect url
             * @param {url} URL. Example:
             * <pre>
             * common.portal.href(url);
             * </pre>
             */
            href: function(url) {
                $window.location.href = url;
            },
           /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#portal.refresh
             * @description Refresh the current window (route)
             * <pre>
             * common.portal.refresh();
             * </pre>
             */
            refresh: function() {
                $route.reload();
            },
           /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#portal.help
             * @description Show the help
             * <pre>
             * common.portal.help();
             * </pre>
             */
            help: function() {
                $location.path('/help');
            }
        },
        attachments: {
           /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#attachments.add
             * @description Add attachment in dst
             * @param {resp} Doc attach 
             * @param {dst} Dst. 
             * <pre>
             * common.attachments.add(resp, $scope.entity.attachments);
             * </pre>
             */
            add: function(resp, dst) {
                var data = angular.fromJson(resp);
        
                var documentURI = '/api/dms/' + data.document_id + '/download/';
                var newAttach   = { name: resp.name, uri: documentURI };

                dst.push(newAttach);
            },
           /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#attachments.attach
             * @description File upload button
             * <pre>
             * common.attachments.attach();
             * </pre>
             */
            attach: function() {
                if ($.browser.msie) {
                    createDialog({
                        template: '<p file-upload' +
                        ' action="{{upload_detail_url}}" btn-class="btn"' +
                        ' btn-label="{{buttons.file}}" input-name="file"' +
                        ' on-success="addAttachment(responseText)" progress-class="btn"/>' +
                        '</p>',
                        id: 'attachDialog',
                        title: 'Attach document',
                        backdrop: true,
                        success: {'label': 'Ok', fn: function() {
                            //Just for IE, avoid refreshing like this
                            $route.reload();
                        }},
                        footerTemplate: '<button class="btn btn-udo-save"' +
                        ' ng-click="$modalSuccess()">' +
                        '   {{ $modalSuccessLabel }}' +
                        '</button>'
                    });
                }
                else {
                    $('.fake-uploader').click(); // Required "file-upload" directive in view
                }
                
            },
            /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#attachments.removeConfirmationDialog
             * @description Shows a confirmation dialog when removing an attachment.
             * @param {function} fn Action to perfom when the dialog is confirmed
             * @param {object} attachment New attachment object
             */
            removeConfirmationDialog: function(fn, attachment, attachmentsList) {
                createDialog({
                   template: '<p>Are you sure you want to delete the Attachment?</p>',
                    id: 'removeAttachmentConfirmation',
                    title: 'Attachment',
                    backdrop: true,
                    success: {label: 'Ok', fn: function() {
                        fn(attachment, attachmentsList);
                    }},
                    cancel: {label: 'Cancel', fn: null}
                });
            },
            /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#attachments.removeWithActions
             * @description Creates a function to remove an attachment from a
             * list performed defined and default actions.
             * @param {function} fn Actions to perform when deleting attachments
             * @param {boolean} confirmation Optional parameter, if it is true
             * a confirmation dialgo will be shown when deleting.
             */
            removeWithActions: function(fn, confirmation) {
                var removeConfirmationDialog = this.removeConfirmationDialog;
                if (typeof confirmation === 'undefined') {
                    confirmation = true; // default value
                }
                var removeAttachment = function(attachment, attachmentsList) {
                    fn(attachment); // Perform the action
                    var index = attachmentsList.indexOf(attachment);
                    attachmentsList.splice(index, 1);
                }
                // Append confirmation attribute if required
                if (confirmation) {
                    return function(attachment, attachmentsList) {
                        removeConfirmationDialog(removeAttachment, attachment, attachmentsList);
                    }
                }
                return removeAttachment;
            }
        },
        notes: {
           /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#detail.add
             * @description Add notes in entity detail. Valid for entities of type ticket, 
             incidence, workorder, problem
             * @param {scope} Controller scope caller 
             * @param {url} Url annotations 
             * @param {id} ID of the entity 
             * @param {result} array with the objects to update with all annotations once
             updated in BE. The new annotations will be stored in each item.annotations
             * @param {function} callback A function to execute after loading the annotation
             * <pre>
             * common.notes.add($scope, '/api/tt/contacts/', $scope.contact._id, result)
             * </pre>
             */
            add: function(scope, url, id, result, callback) {
                var updateResult = function() {
                    $http.get(url + id + '/annotations/', {cache: false})
                        .success(function(data) {
                            annotations = annotationsOp.buildAnnotations(data);
                            // Assign results
                            angular.forEach(result, function(param, key) {
                                param.annotations = annotations;
                            });
                            if (typeof callback === 'function') {
                                callback();
                            }
                        })
                        .error(function(data) {
                        });
                };
                annotationsOp.launchAddNotesModal(scope, 'annotations', function() {
                    var newNote = scope.annotations[scope.annotations.length - 1];
                    $http.post(url + id + '/annotations/', newNote)
                    .success(function() {
                        updateResult();
                    })
                    .error(function(data) {
                        updateResult();
                    });
                });
            },
           /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#notes.changeAnnotation
             * @description Add notes in entity detail. Called from udo-annotations directive in view (on-change event)
             Valid for entities of type ticket, incidence, workorder, problem
             * @param {url} Url annotations
             * @param {id} ID
             * @param {index} Index of annotation to be updated
             * @param {annotation} Annotation to be updated (to extract the annotation code)
             * @param {data} New text for the annotation 
             * @param {result} array with the objects to update with all annotations once
             updated in BE. The new annotations will be stored in each item.annotations 
             * @param {function} callback A function to execute after loading the annotation
             * <pre>
             * common.notes.changeAnnotation('/api/tt/contacts/', $scope.contact._id, index, annotation, data, result)
             * </pre>
             */
            changeAnnotation: function(url, id, index, annotation, data, result, callback) {
                var updateResult = function() {
                    $http.get(url + id + '/annotations/', {cache: false})
                        .success(function(data) {
                            annotations = annotationsOp.buildAnnotations(data);
                            // Assign results
                            angular.forEach(result, function(param, key) {
                                param.annotations = annotations;
                            });
                            if (typeof callback === 'function') {
                                callback();
                            }
                        })
                        .error(function(data) {
                        });
                };

                var requestUrl = url + id + '/annotations/' + index;
                var annotationData = {code: annotation.code, value: data};
                $http.post(requestUrl, annotationData)
                .success(function() {
                    updateResult();
                })
                .error(function(data)  {
                    updateResult();
                });
            }
        },
        history: { 
           /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#history.showHistory
             * @description Show the incidence history
             * @param {dataContact} Ticket contact or Incidence contact 
             * @param {eid} EID 
             * @param {idOpts} ID options 
             * @param {titleOpts} Title options. Example:
             * <pre>
             * common.history.showHistory(contact, eid, idIncidenceOpts, titleIncidenceOpts);
             * </pre>
             */
            showHistory: function(dataContact, eid, idOpts, titleOpts) {
                // Add type to status_change to be used by grids
                angular.forEach(dataContact.status_change, function(status, index){
                    status.type = "status";
                });
                // Ensure that contact history exists
                if (! dataContact.history) {
                    dataContact.history = [];
                }
                var history = dataContact.history.concat(dataContact.status_change);

                var dataContactOpts = { 
                                        id: idOpts, 
                                        title: '#' + eid + ' ' + titleOpts 
                                      };

                var passedLocals =  { 
                                        histData: history 
                                    };

                modalGen.history(dataContactOpts, passedLocals);
            },
           /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#history.showStatusHistory
             * @description Show the incidence history
             * @param {dataContact} Ticket contact or Incidence contact 
             * @param {eid} EID 
             * @param {idIncidenceOpts} ID incidence options 
             * @param {titleIncidenceOpts} Title incidence options. Example:
             * <pre>
             * common.history.showIncidenceHistory(contact, eid, idIncidenceOpts, titleIncidenceOpts);
             * </pre>
             */
            showStatusHistory: function(dataContact, eid, idOpts, titleOpts) {
                // Add type to status_change to be used by grids
                angular.forEach(dataContact.status_change, function(status, index){
                    status.type = "status";
                });
    
                var dataContactOpts = { 
                                        id: idOpts, 
                                        title: '#' + eid + ' ' + titleOpts 
                                      };

                var passedLocals =  { 
                                        histData: dataContact.status_change 
                                    };

                modalGen.history(dataContactOpts, passedLocals);
            }
        },
        status: {
            get: function(url, id) {
                var possibleStatuses = [];
                url = url + id + "/status";

                $http.get(url).then(function (response) {
                    var data = response.data;

                    // Fill possibleStatuses
                    for(i=0; i<data.length; i++) {
                        var newStatus = {key: data[i], name: $filter('i18n')(data[i])};
                        possibleStatuses.push(newStatus);
                    }

                    return possibleStatuses;
                }, function (response) {
                    // WIP Exception
                });

                return possibleStatuses;
            },
           /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#status.next
             * @description Show the incidence history
             * @param {url} URL 
             * @param {id} ID (ticket or incidence) 
             * <pre>
             * common.status.next('api/tt/contacts/', $scope.contact._id);
             * </pre>
             */
            next: function(url, id) {
                var possibleStatuses = [];
                url = url + id + "/nextstatus";

                $http.get(url).then(function (response) {
                    var data = response.data;

                    // Fill possibleStatuses
                    for(i=0; i<data.length; i++) {
                        var newStatus = {key: data[i], name: $filter('i18n')(data[i])};
                        possibleStatuses.push(newStatus);
                    }

                    return possibleStatuses;
                }, function (response) {
                    // WIP Exception
                });

                return possibleStatuses;
            }
        },
        editable: {
           /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#editable.showData
             * @description Show data for array, date or time field used in xeditable directive. Called from detailX view
             * @param {param} Object with type attibute (dataset) and value attribute 
             * <pre>
             * <a editable-select="param.value">{{common.editable.showData(param)}}</a>
             * </pre>
             */
            showData: function(param) {
                switch (param.widget) {
                    case "array" :
                        if (param) {
                            if (param.type && param.type) {
                                var selected = $filter('filter')(param.type, {key: param.value});
                                if (selected.length) {
                                    return selected[0].name;
                                }
                                else {
                                    return $filter('i18n')(param.value);
                                }
                            }
                            else {
                                return $filter('i18n')(param);
                            }
                        }
                        else
                        {
                            return $filter('i18n')('empty');
                        }
                        break;
                    case "date" :
                    case "time" :
                        if (param.value instanceof Date) { // Date                    
                            //var date = utils.date.date2string(param.value); 
                            var angularDateFilter = $filter('date'); // Don't udoDate filter (local date, no utc)
                            return angularDateFilter(param.value, $rootScope.formatLanguage);
                        }
                        else {
                            if ((typeof(param.value) === "string") && (param.value != "")) { // String
                                var date = utils.date.string2date(param.value);
                                var angularDateFilter = $filter('date'); //$filter('udoDate');
                                return angularDateFilter(date, $rootScope.formatLanguage);
                            }
                            else { // Otherwise
                                return (param.value) || 'empty';
                            }
                        }
                        break;
                    default:
                        return (param.value) || 'empty';
                        break;
                }
            },
           /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#editable.updateData
             * @description Update data in server. Called from detail view
             * @param {field} Data field 
             * @param {newValue} New value
             * @param {url} URL 
             * @param {id} ID (ticket or incidence) 
             * <pre>
             * <a editable-select="field.value" onbeforesave="updateData(field, $data)">{{common.editable.showData(param)}}</a>
             * </pre>
             */
//// WIP
            updateData: function(field, newValue, url, id) {
                if (field.name === 'Status') {
                    $scope.previousState = field.value;
                    createStatusChangeDialog(newValue, "contacts", $scope.contact._id, $scope.resUpdateStatus);
                }
                else {
                    var url = url + id + '/' + field.keySave;

                    // Convert newValue
                    switch(field.widget) {
                        case "number":
                            newValue = new String(newValue);
                            break;
                        case "date":
                            newValue = utils.date.local2utc(newValue);
                            break;
                    }

                    var d = $q.defer();
                    $http.put(url, angular.toJson(newValue)).success(function(res) {
                            d.resolve();
                        }).error(function(e) {
                            d.reject('Error');
                        });
                    return d.promise;
                }
            }
        },
        toolbar: {
           /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#toolbar.build
             * @description Build toolbar (toolbar, sidebar, ...)
             * @param {data} Object with data config for toolbar 
             * <pre>
             * common.toolbar.build(data);
             * </pre>
             */
            build: function(data) {
                var configDefault = { 
                                        url: '#',
                                        active: '',
                                        apply: true,
                                        visible: true
                                    };

                // Extend data with data defaults
                angular.forEach(data, function(field, key) {
                    data[key] = angular.extend({}, configDefault, field);
                });
            },
           /**
             * @ngdoc method
             * @methodOf udoModule.service:common
             * @name udoModule.service:common#toolbar.enable
             * @description Enable/disable (data.apply boolean) toolbar (data) by nextActions config
             * @param {data} Object with data toolbar 
             * @param {nextActions} Array with data.id enables 
             * <pre>
             * common.toolbar.enable(data, nextActions);
             * </pre>
             */
            enable: function(data, nextActions) {
                // Reset apply in data
                angular.forEach(data, function(field, key) {
                    field.apply = false;
                });

                // Set apply 
                for (var i=0; i<nextActions.length; i++) {
                    for (var j=0; j<data.length; j++) {
                        if (data[j].id === nextActions[i]) {
                            data[j].apply = true;
                            break;
                        }
                    }
                };
            }
        }
    }
}]);
