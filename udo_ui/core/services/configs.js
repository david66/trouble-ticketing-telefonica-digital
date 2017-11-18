/**
 * @ngdoc service
 * @name udoModule.service:configs
 * @description Udo service that holds configuration relative to
 * some elements of the app
 */
udoModule.service('configs', function configs(TRANSLATION_MAP) {

    var _headerCellTemplate =
        '<div class="ngHeaderSortColumn {{col.headerClass}}" ng-style="{height: col.headerRowHeight}" ng-class="{ ngSorted: !noSortVisible }">' +
            '<div ng-click="columnSort(col)" class="ngHeaderText">{{col.displayName | i18n}}</div>' +
            '<div class="ngSortButtonDown"  ng-show="col.showSortButtonDown()"></div>' +
            '<div class="ngSortButtonUp" ng-show="col.showSortButtonUp()"></div>' +
            '<div class="ngSortPriority">{{col.sortPriority}}</div>' +
            '<div ng-class="col.colIndex()" class="paddingP">' +
                '<div ng-switch="paramsForFilters[col.index].widget">' +
                    '<input class="filter" on-keyup="columnFilter(col)" keys="[13]" ng-model="col.filter" ng-switch-when="text" type="text" />' +
                    '<select class="filter" ng-change="columnFilter(col, filterValue)" name="select" ng-switch-when="array" ng-model="filterValue" ng-options="cc | i18n for cc in paramsForFilters[col.index].type">' +
                        '<option value="">---</option>' +
                    '</select>' +
                    '<div ng-switch-when="datepicker">' +
                        '<grid-date-picker date-filter="{{ col.colDef.dateFilter }}"></grid-date-picker>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div ng-show="col.resizable" class="ngHeaderGrip" ng-click="col.gripClick($event)" ng-mousedown="col.gripOnMouseDown($event)"></div>';
    var _repairDateTemplate =
        '<div ng-switch="" on={{isSolved(row.entity[col.field])}}>' +
            '<div ng-switch-when="no" class="ngCellText nowrap">' +
              '<span ng-cell-text>{{"Not available" | i18n}}</span>' +
            '</div>' +
            '<div ng-switch-when="yes" class="ngCellText nowrap">' +
              '<span ng-cell-text>{{utc2local(getRepairDate(row.entity[col.field]))| date: formatLanguage}}</span>' +
            '</div>' +
            '<div ng-switch-when="no_data" class="ngCellText nowrap">' +
        '</div>';
    var _rowTemplate =
        '<div style="height: 100%" ng-class="{warning_red: row.getProperty(\'responsible.delegations.current.group\') != Undefined}">' +
            '<a href="ui#{{locationPath}}{{row.getProperty(\'_id\')}}" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell nodecorate">' +
                '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }"></div>' +
                '<div ng-cell></div>' +
            '</a>' +
        '</div>';
    var _rowTemplate_code =
        '<div style="height: 100%" ng-class="{warning_red: row.getProperty(\'responsible.delegations.current.group\') != Undefined}">' +
            '<a href="ui#{{locationPath}}{{row.getProperty(\'code\')}}" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell nodecorate">' +
                '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }"></div>' +
                '<div ng-cell></div>' +
            '</a>' +
        '</div>';
    var _semaphoresTemplate =
        '<div ng-switch="" on={{available_slas(row.entity[col.field])}}>' +
            '<div ng-switch-when="not_available" title="{{\'Not available\' | i18n}}" class="ngCellText nowrap" ng-class="col.colIndex()">' +
                '<button title="{{\'SLA response indicator\' | i18n}}" class="btn btn-small default" disabled="disabled"><i class="icon-reply"></i></button> '+
                '<button title="{{\'SLA restoration indicator\' | i18n}}" class="btn btn-small default" disabled="disabled"><i class="icon-time"></i></button> '+
                '<button title="{{\'SLA resolution indicator\' | i18n}}" class="btn btn-small default" disabled="disabled"><i class="icon-ok"></i></button> '+
            '</div>' +
            '<div ng-switch-when="available" class="ngCellText nowrap" ng-class="col.colIndex()">' +
                '<button ng-if="row.entity[col.field].response_time.value" title="{{\'SLA response indicator\' | i18n}}" class="btn btn-small semaphore \
                {{getSemaphoreImageUrl(row.entity[col.field].response_time.value,row.entity[col.field].response_time.max_time)}}"><i class="icon-reply"></i></button> '+
                '<button ng-if="!(row.entity[col.field].response_time.value)" title="{{\'SLA response indicator\' | i18n}}" class="btn btn-small default" disabled="disabled"><i class="icon-reply"></i></button> '+
                '<button ng-if="row.entity[col.field].restoration_time.value" title="{{\'SLA restoration indicator\' | i18n}}" class="btn btn-small semaphore \
                {{getSemaphoreImageUrl(row.entity[col.field].restoration_time.value,row.entity[col.field].restoration_time.max_time)}}"><i class="icon-time"></i></button> '+
                '<button button ng-if="!(row.entity[col.field].restoration_time.value)" title="{{\'SLA restoration indicator\' | i18n}}" class="btn btn-small default" disabled="disabled"><i class="icon-time"></i></button> '+
                '<button ng-if="row.entity[col.field].resolution_time.value" title="{{\'SLA resolution indicator\' | i18n}}" class="btn btn-small semaphore \
                {{getSemaphoreImageUrl(row.entity[col.field].resolution_time.value,row.entity[col.field].resolution_time.max_time)}}"><i class="icon-ok"></i></button> '+
                '<button ng-if="!(row.entity[col.field].resolution_time.value)" title="{{\'SLA resolution indicator\' | i18n}}" class="btn btn-small default" disabled="disabled"><i class="icon-ok"></i></button> '+
            '</div>' +
            '<div ng-switch-when="no_data" class="ngCellText nowrap" ng-class="col.colIndex()"></div>' +
        '</div>';
    var _openInTabTemplate =
        '<div ng-switch="" on={{showOpenInTab(row.entity.tab)}}>' +
            '<div ng-switch-when="available" class="ngCellText nowrap" ng-class="col.colIndex()">' +
                '<center>'+
                    '<button class="btn btn-small default" title="Open in a new Tab" type="button" ng-cell-text ng-click="openInTab(row, $event, \'_id\')">' + 
                        '<i class="icon-external-link"></i>' + 
                    '</button>' +
                '</center>' +
            '<div>' +
            '<div ng-switch-when="not_available" class="ngCellText nowrap" ng-class="col.colIndex()"><div>' +
        '</div>';
    var _openInTabTemplate_code =
        '<div ng-switch="" on={{showOpenInTab(row.entity.tab)}}>' +
            '<div ng-switch-when="available" class="ngCellText nowrap" ng-class="col.colIndex()">' +
                '<center>'+
                    '<button type="button" class="btn btn-small default" title="Open in a new Tab" ng-cell-text ng-click="openInTab(row, $event, \'code\')">' + 
                        '<i class="icon-external-link"></i>' + 
                    '</button>' +
                '</center>' +
            '<div>' +
            '<div ng-switch-when="not_available" class="ngCellText nowrap" ng-class="col.colIndex()"><div>' +
        '</div>';

    return {
        grid: {
            /** Configurantion of the grid rows, apis..*/
            config: {
                '/tt/incidences/': {
                    'api': '/api/tt/incidences/?operator=acceptable&detailed=true&slainfo=true',
                    'csv': '/api/tt/reports/csv/incidences',
                    'parametersNames': [
                        'openInTab', 'sla', 'type', 'status', 'eid','customer_name', 'leading_ob', 
                        'customer_service', 'severity', 'priority', 'status_change',
                        'repair_date', 'responsible_operator', 'responsible_group',
                        'delegate_user', 'delegate_group', 'subject', 'description'
                    ],
                    'gridConfig': {
                        columnDefs: [
                            {
                                displayName: '·', resizable:'false', width: '50px', headerCellTemplate: _headerCellTemplate,
                                sortable: false,
                                cellTemplate: _openInTabTemplate
                            },
                            {
                                field: 'sla_info', displayName: 'SLA', resizable:'true', width: '133px', headerCellTemplate: _headerCellTemplate,
                                sortable: false, cellTemplate: _semaphoresTemplate
                            },
                            {
                                field: 'contact.type', displayName: 'Type', width: '140px', headerCellTemplate: _headerCellTemplate,
                                sortable: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.contact.type | i18n}}</span></div>'
                            },
                            {
                                field: 'status', displayName: 'status', sortable: true, width: '140px', headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity[col.field] | i18n}}</span></div>'
                            },
                            {
                                field: 'contact_eid', displayName: 'Id', width: '65px', headerCellTemplate: _headerCellTemplate,
                                sortable: true, enableCellEdit: false
                            },
                            {
                                field: 'contact.customer_name', displayName: 'Customer Name', width: '200px', headerCellTemplate: _headerCellTemplate,
                                sortable: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.contact.customer_name}}</span></div>'
                            },
                            {
                                field: 'contact.leading_ob', displayName: 'Leading OB', width: '105px', headerCellTemplate: _headerCellTemplate,
                                sortable: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.contact.leading_ob}}</span></div>'
                            },
                            {
                                field: 'contact.customerservice.code', displayName: 'Service', width: '100px', headerCellTemplate: _headerCellTemplate,
                                sortable: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.contact.customerservice.code}}</span></div>'
                            },
                            {
                                field: 'severity', displayName:'Severity', headerCellTemplate: _headerCellTemplate,
                                sortable: true, width: '130px',
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{getSeverityLabel(row.entity[col.field]) | i18n}}</span></div>'
                            },
                            {
                                field: 'priority', displayName:'Priority', width: '90px',
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true
                            },
                            {
                                field: 'status_change', dateSorter: '_date_status_change.0.start', dateFilter: 'status_change.0.start', displayName:'Submission Date Table Header', width: '264px', 
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true, enableCellEdit: false,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{utc2local(row.entity[col.field][0]["start"]) | date: formatLanguage}}</span></div>'
                            },
                            {
                                field: 'contact', dateSorter: '_date_repairDate', dateFilter: 'contact.status_change.start', displayName:'Repair Date', enableCellEdit: false, sortable: true,
                                width: '264px', cellTemplate: _repairDateTemplate, 
                                headerCellTemplate: _headerCellTemplate, visible: true
                            }, //'<div>{{utc2local(repair_date(row.entity[col.field]))| date:"yyyy-MM-dd HH:mm:ss"}}</div>'},
                            {
                                field: 'responsible.current.operator', displayName: 'Responsible',
                                width: '220px', sortable: true, visible: true,
                                headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.responsible.current.operator}}</span></div>'
                            },
                            {
                                field: 'responsible.current.group', displayName: 'Responsible Group',
                                width: '220px', sortable:true, visible: true,
                                headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.responsible.current.group}}</span></div>'
                            },
                            {
                                field: 'responsible.delegations.current.operator', displayName: 'Deleg. User', width: '150px', sortable: true, visible: true,
                                headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.responsible.delegations.current.operator}}</span></div>'
                            },
                            {
                                field: 'responsible.delegations.current.group', displayName: 'Deleg. Group', width: '150px', sortable: true, visible: true,
                                headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.responsible.delegations.current.group}}</span></div>'
                            },
                            {
                                field: 'contact.subject', displayName: 'Subject', width: '300px',
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true, visible: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.contact.subject}}</span></div>'
                            },
                            {
                                field: 'contact.description', displayName: 'Description', width: '300px',
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true, visible: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.contact.description}}</span></div>'
                            }
                        ],
                        rowTemplate: _rowTemplate
                    }
                },
                '/tt/contacts/': {
                    'api': '/api/tt/contacts/?customer=current',
                    'parametersNames': [
                        'openInTab', 'type', 'status', 'severity', 'eid', 'customer_name', 'originator_user', 'originator_group',
                        'customer_service', 'priority', 'status_change', 'subject', 'description'
                    ],
                    'gridConfig': {
                        columnDefs: [
                            {
                                displayName: '·', resizable:'false', width: '50px', headerCellTemplate: _headerCellTemplate,
                                sortable: false,
                                cellTemplate: _openInTabTemplate
                            },
                            {
                                field: 'type', displayName: 'Type', width: '100px',
                                sortable: true, headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.type | i18n}}</span></div>'
                            },
                            {
                                field: 'status', displayName: 'status', sortable: true, width: '75px', headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity[col.field] | i18n}}</span></div>'
                            },
                            {
                                field: 'severity', displayName:'Severity',
                                sortable: true, width: '110px', headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{getSeverityLabel(row.entity[col.field]) | i18n}}</span></div>'
                            },
                            {
                                field: 'eid', displayName: 'Id', width: '65px', headerCellTemplate: _headerCellTemplate,
                                sortable: true, enableCellEdit: false
                            },
                            {
                                field: 'customer_name', displayName: 'Customer Name', width: '200px',
                                sortable: true, headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'customer', displayName: 'Originator User', width: '200px',
                                sortable: true, headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'originator_group', displayName: 'Originator Group', width: '150px',
                                sortable: true, headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'customerservice', displayName: 'Customer Service', width: '120px',
                                sortable: true, headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'status_change', dateSorter: '_date_status_change.0.start', dateFilter: 'status_change.0.start', displayName:'Submission Date Table Header', width: '264px',
                                sortable: true, enableCellEdit: false, headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{utc2local(row.entity[col.field][0]["start"]) | date: formatLanguage}}</span></div>'
                            },
                            {
                                field: 'subject', displayName: 'Subject', width: '300px',
                                sortable: true, headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'description', displayName: 'Description', width: '300px',
                                sortable: true, headerCellTemplate: _headerCellTemplate
                            }
                        ],
                        rowTemplate: _rowTemplate
                    }
                },
                '/tt/kpis/': {
                    'api': '/api/sla/measures/kpi/isunavailable?detailed=true',
                    'parametersNames': [
                        'openInTab', 'customer_service', 'kpi_type', 'start_date', 'end_date', 'comment'
                    ],
                    'gridConfig': {
                        columnDefs: [
                            {
                                displayName: '·', resizable:'false', width: '50px', headerCellTemplate: _headerCellTemplate,
                                sortable: false,
                                cellTemplate: _openInTabTemplate
                            },
                            {
                                field: 'instance.shortname', displayName: 'Customer Service', sortable: false, width: '140px',
                                headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'code', displayName: 'KPI Type', width: '120px',
                                sortable: false, headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'period_of_time.start', dateSorter: '_date_period_of_time.start', dateField:'period_of_time.start', displayName: 'Start Date', width: '264px',
                                sortable: true, headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{utc2local(row.entity.period_of_time.start) | date: formatLanguage}}</span></div>'

                            },
                            {
                                field: 'period_of_time.end', dateSorter: '_date_period_of_time.end', dateField:'period_of_time.end', displayName: 'End Date', width: '264px',
                                sortable: true, headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{utc2local(row.entity.period_of_time.end) | date: formatLanguage}}</span></div>'

                            },
                            {
                                field: 'comment', displayName: 'Comment', width: '360px',
                                sortable: false, headerCellTemplate: _headerCellTemplate
                            },
                        ],
                        rowTemplate: _rowTemplate
                    }
                },
                '/tt/workorders/': {
                    'api': '/api/tt/workorders/?_search=false',
                    'csv': '/api/tt/reports/csv/workorders',
                    'parametersNames': [
                        'openInTab', 'eid', 'subject', 'status_wo', 'customer_service', 'responsible_name', 'impact_on_srv',
                        'planned_date_start', 'planned_date_end', 'real_date_date_start', 'real_date_date_end'
                    ],
                    'gridConfig': {
                        columnDefs: [
                            {
                                displayName: '·', resizable:'false', width: '50px', headerCellTemplate: _headerCellTemplate,
                                sortable: false,
                                cellTemplate: _openInTabTemplate
                            },
                            {
                                field: 'eid', displayName: 'Id', sortable: true, width: '60px',
                                headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'subject', displayName: 'Subject', width: '120px',
                                sortable: true, headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'status', displayName: 'Status', width: '120px',
                                sortable: true, headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity[col.field] | i18n}}</span></div>'
                            },
                            {
                                field: 'customerservice', displayName: 'Service', width: '190px',
                                sortable: true, headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'responsible.name', displayName: 'Resp. name', width: '120px',
                                sortable: true, headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'impact_on_srv', displayName: 'Impact on Service', width: '190px',
                                sortable: true, headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'planned_date.start', dateSorter: '_date_planned_date.start', dateFilter: 'planned_date.start', displayName: 'Planned Start Date', width: '264px',
                                sortable: true, headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{utc2local(row.entity.planned_date.start) | date: formatLanguage}}</span></div>'
                            },
                            {
                                field: 'planned_date.end', dateSorter: '_date_planned_date.end', dateFilter: 'planned_date.end', displayName: 'Planned End Date', width: '264px',
                                sortable: true, headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{utc2local(row.entity.planned_date.end) | date: formatLanguage}}</span></div>'
                            },
                            {
                                field: 'real_date.start', dateSorter: '_date_real_date.start', dateFilter: 'real_date.start', displayName: 'Real Start Date', width: '264px',
                                sortable: true, headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{utc2local(row.entity.real_date.start) | date: formatLanguage}}</span></div>'
                            },
                            {
                                field: 'real_date.end', dateSorter: '_date_real_date.end', dateFilter: 'real_date.end', displayName: 'Real End Date', width: '264px',
                                sortable: true, headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{utc2local(row.entity.real_date.start) | date: formatLanguage}}</span></div>'
                            }
                        ],
                        rowTemplate: _rowTemplate
                    }
                },
                '/tt/groupinvolvedincidences/': {
                    'api': '/api/tt/incidences/?involving_user_groups=true&detailed=true&slainfo=true',
                    'csv': '/api/tt/reports/csv/incidences',
                    'parametersNames': [
                        'openInTab', 'sla', 'type', 'status', 'eid','customer_name', 'leading_ob', 
                        'customer_service', 'severity', 'priority', 'status_change',
                        'repair_date', 'responsible_operator', 'responsible_group',
                        'delegate_user', 'delegate_group', 'subject', 'description'
                    ],
                    'gridConfig': {
                        columnDefs: [
                            {
                                displayName: '·', resizable:'false', width: '50px', headerCellTemplate: _headerCellTemplate,
                                sortable: false,
                                cellTemplate: _openInTabTemplate
                            },
                            {
                                field: 'sla_info', displayName: 'SLA', resizable:'true', width: '133px', headerCellTemplate: _headerCellTemplate,
                                sortable: false, cellTemplate: _semaphoresTemplate
                            },
                            {
                                field: 'contact.type', displayName: 'Type', width: '140px', headerCellTemplate: _headerCellTemplate,
                                sortable: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.contact.type | i18n}}</span></div>'
                            },
                            {
                                field: 'status', displayName: 'status', sortable: true, width: '140px', headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity[col.field] | i18n}}</span></div>'
                            },
                            {
                                field: 'contact_eid', displayName: 'Id', width: '65px', headerCellTemplate: _headerCellTemplate,
                                sortable: true, enableCellEdit: false
                            },
                            {
                                field: 'contact.customer_name', displayName: 'Customer Name', width: '200px', headerCellTemplate: _headerCellTemplate,
                                sortable: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.contact.customer_name}}</span></div>'
                            },
                            {
                                field: 'contact.leading_ob', displayName: 'Leading OB', width: '105px', headerCellTemplate: _headerCellTemplate,
                                sortable: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.contact.leading_ob}}</span></div>'
                            },
                            {
                                field: 'contact.customerservice.code', displayName: 'Service', width: '100px', headerCellTemplate: _headerCellTemplate,
                                sortable: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.contact.customerservice.code}}</span></div>'
                            },
                            {
                                field: 'severity', displayName:'Severity', headerCellTemplate: _headerCellTemplate,
                                sortable: true, width: '110px',
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{getSeverityLabel(row.entity[col.field]) | i18n}}</span></div>'
                            },
                            {
                                field: 'priority', displayName:'Priority', width: '90px',
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true
                            },
                            {
                                field: 'status_change', dateSorter: '_date_status_change.0.start', dateFilter: 'status_change.0.start', displayName:'Submission Date Table Header', width: '264px', 
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true, enableCellEdit: false,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{utc2local(row.entity[col.field][0]["start"]) | date: formatLanguage}}</span></div>'
                            },
                            {
                                field: 'contact', dateSorter: '_date_repairDate', displayName:'Repair Date', enableCellEdit: false, sortable: true,
                                width: '264px', cellTemplate: _repairDateTemplate, 
                                headerCellTemplate: _headerCellTemplate, visible: true
                            },
                            {
                                field: 'responsible.current.operator', displayName: 'Responsible',
                                width: '200px', sortable: true, visible: true,
                                headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.responsible.current.operator}}</span></div>'
                            },
                            {
                                field: 'responsible.current.group', displayName: 'Responsible Group',
                                width: '200px', sortable:true, visible: true,
                                headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.responsible.current.group}}</span></div>'
                            },
                            {
                                field: 'responsible.delegations.current.operator', displayName: 'Deleg. User', width: '150px', sortable: true, visible: true,
                                headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.responsible.delegations.current.operator}}</span></div>'
                            },
                            {
                                field: 'responsible.delegations.current.group', displayName: 'Deleg. Group', width: '150px', sortable: true, visible: true,
                                headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.responsible.delegations.current.group}}</span></div>'
                            },
                            {
                                field: 'contact.subject', displayName: 'Subject', width: '300px',
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true, visible: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.contact.subject}}</span></div>'
                            },
                            {
                                field: 'contact.description', displayName: 'Description', width: '300px',
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true, visible: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.contact.description}}</span></div>'
                            }
                        ],
                        rowTemplate: _rowTemplate
                    }
                },
                '/tt/problems/': {
                    'api': '/api/tt/problems/?',
                    'parametersNames': [
                        'openInTab', 'eid', 'problem_type', 'status_problem',
                        'status_change', 'scheduled_date', 'target_date', 'affected_customer', 'annotation', 'rel_customers', 'rel_incidences'
                    ],
                    'gridConfig': {
                        columnDefs: [
                            {
                                displayName: '·', resizable:'false', width: '50px', headerCellTemplate: _headerCellTemplate,
                                sortable: false,
                                cellTemplate: _openInTabTemplate
                            },
                            {
                                field: 'eid', displayName: 'Id', resizable:'true', width: '80px', headerCellTemplate: _headerCellTemplate,
                                sortable: true
                            },
                            {
                                field: 'type', displayName: 'Problem Type', width: '150px', headerCellTemplate: _headerCellTemplate,
                                sortable: true
                            },
                            {
                                field: 'status', displayName: 'Status', sortable: true, width: '85px',
                                headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity[col.field] | i18n}}</span></div>'
                            },
                            {
                                field: 'status_change', dateSorter: '_date_status_change.0.start', dateFilter: 'status_change.0.start', displayName:'Submission Date Table Header', width: '264px', 
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true, enableCellEdit: false,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{utc2local(row.entity[col.field][0]["start"]) | date: formatLanguage}}</span></div>'
                            },
                            {
                                field: 'scheduled_date', dateSorter: '_date_scheduled_date', dateField: 'scheduled_date', displayName: 'Scheduled', sortable: true, width: '264px',
                                headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{utc2local(row.entity.scheduled_date) | date: formatLanguage}}</span></div>'

                            },
                            {
                                field: 'target_date', dateSorter: '_date_target_date', dateField: 'target_date', displayName: 'Target Date', sortable: true, width: '264px',
                                headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{utc2local(row.entity.target_date) | date: formatLanguage}}</span></div>'

                            },
                            {
                                field: 'affected.0.code', displayName: 'Affected', width: '100px', 
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.affected.0.code}}</span></div>'
                            },
                            {
                                field: 'annotations.0.value', displayName: 'Notes', width: '100px', 
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.annotations.0.value}}</span></div>'
                            },
                            {
                                field: 'customers', displayName: 'Affected Customer', sortable: true, width: '150px',
                                headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{jsonLength(row.entity[col.field])}}</span></div>'
                            },
                            {
                                field: 'incidences', displayName: 'Related Incidences', sortable: true, width: '150px',
                                headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{jsonLength(row.entity[col.field])}}</span></div>'
                            }
                        ],
                        rowTemplate: _rowTemplate
                    }
                },
                '/tt/symptoms/': {
                    'api': '/api/tt/symptoms/?',
                    'parametersNames': [
                        'openInTab', 'code', 'name', 'symptom', 'description', 'problems'
                    ],
                    'gridConfig': {
                        columnDefs: [
                            {
                                displayName: '·', resizable:'false', width: '50px', headerCellTemplate: _headerCellTemplate,
                                sortable: false,
                                cellTemplate: _openInTabTemplate_code
                            },
                            {
                                field: 'code', displayName: 'Code', resizable:'true', width: '300px', headerCellTemplate: _headerCellTemplate,
                                sortable: true
                            },
                            {
                                field: 'name', displayName: 'Name', width: '300px', headerCellTemplate: _headerCellTemplate,
                                sortable: true
                            },
                            {
                                field: 'description', displayName: 'Description', sortable: true, width: '300px',
                                headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'problems', displayName: 'Problem Types', sortable: true, width: '200px',
                                headerCellTemplate: _headerCellTemplate
                            }
                        ],
                        rowTemplate: _rowTemplate_code
                    }
                },
                '/tt/problemtypes/': {
                    'api': '/api/tt/problemtypes/?',
                    'parametersNames': [
                        'openInTab', 'code', 'problemtype_description', 'affected_customer', 'symptoms', 'solvingprocedures', 'count'
                    ],
                    'gridConfig': {
                        columnDefs: [
                            {
                                displayName: '·', resizable:'false', width: '50px', headerCellTemplate: _headerCellTemplate,
                                sortable: false,
                                cellTemplate: _openInTabTemplate_code
                            },
                            {
                                field: 'code', displayName: 'Code', resizable:'true', width: '300px', 
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true
                            },
                            {
                                field: 'description', displayName: 'Description', sortable: true, width: '300px',
                                headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'affected.0.code', displayName: 'Affected', width: '100px', 
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.affected.0.code}}</span></div>'
                            },
                            {
                                field: 'symptoms', displayName: 'Symptoms', width: '300px', 
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true
                            },
                            {
                                field: 'solvingprocedures.0', displayName: 'Solving Procedures', width: '200px', 
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.solvingprocedures.0}}</span></div>'
                            },
                            {
                                field: 'count', displayName: 'Count', sortable: true, width: '300px',
                                headerCellTemplate: _headerCellTemplate
                            },
                        ],
                        rowTemplate: _rowTemplate_code
                    }
                },
                'history': {
                    'gridConfig': {
                        sortInfo:{ fields: ['start'], directions: ['desc'] },
                        rowHeight: 60,
                        showFooter: false,
                        rowTemplate: undefined,
                        enableColumnReordering: false,
                        headerRowHeight: 40,
                        plugins: [new ngGridFlexibleHeightPlugin(), new ngGridCsvExportPlugin('modal', null, TRANSLATION_MAP)],
                        columnDefs: [
                            {
                                displayName: '', resizable:'false', width: '100px',
                                sortable: true,
                                cellTemplate: '<div class="multilineCellText" ng-class="col.colIndex()">' +
                                                '<center>' +
                                                    '<div class="btn-group">'+
                                                        '<button ng-class="iconColor(row.entity)" ng-mouseover="showSideBar(row.entity)" ng-mouseleave="sidebarRightContent.show = false" class="btn btn-small default"><i ng-cell-text class="icon-plus-sign-alt"></i></button>' + 
                                                        '<button class="btn btn-small default" ng-click="showRawData(row.entity)"> <i class="icon-external-link"></i></button>' +
                                                    '</div>' +
                                                '<center>' +
                                              '</div>'
                            },
                            {
                                field: 'start', displayName: 'Date', resizable:'false', width: '15%',
                                sortable: true,
                                cellTemplate: '<div class="multilineCellText" ng-class="col.colIndex()"><span ng-cell-text>{{utc2local(row.entity[col.field]) | date: formatLanguage}}</span></div>'
                            },
                            {
                                field: 'starting_operator', displayName: 'Modified By', width: '15%', resizable:'false',
                                cellTemplate: '<div class="multilineCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity[col.field]}}</span></div>'
                            },
                            {
                                field: 'code', displayName: 'Code', width: '25%', resizable:'false',
                                cellTemplate: '<div class="multilineCellText" ng-class="col.colIndex()"><span ng-cell-text>{{formatCodeHistory(row.entity) | i18n}}</span></div>'
                            },
                            {
                                field: 'value', displayName: 'Description', minwidth: '45%', resizable:'false',
                                cellTemplate: '<div class="multilineCellText descript" ng-class="col.colIndex()"><span ng-cell-text><span ng-bind-html="formatDescriptHistory(row.entity)"></span></span></div>'
                            }
                        ]
                    }
                },
                'notes': {
                    'api': '/api/tt/annotations/?',
                    'gridConfig': {
                        headerRowHeight: 37,
                        showFooter: false,
                        plugins: [new ngGridFlexibleHeightPlugin()],
                        multiSelect: false,
                        showColumnMenu: false,
                        showGroupPanel: false,
                        selectWithCheckboxOnly: true,
                        showSelectionCheckbox: true,
                        showFilter: false,
                        keepLastSelected: false,
                        selectedItems: [],
                        afterSelectionChange: undefined, // Set by setAfterSelectionChange function
                        pagingOptions: { //Pagination grid Config
                            pageSize: 1000,
                            currentPage:1
                        },
                        columnDefs: [
                            {
                                field: 'code', displayName: 'Code', resizable: false, width: '33%', 
                                sortable: true
                            },
                            {
                                field: 'description', displayName: 'Description', resizable: false, width: '67%',
                                sortable: true
                            }
                        ]
                    }
                },
                'relatedIncidences': {
                    'gridConfig': {
                        headerRowHeight: 37,
                        showFooter: false,
                        plugins: [new ngGridFlexibleHeightPlugin()],
                        multiSelect: false,
                        showColumnMenu: false,
                        showGroupPanel: false,
                        selectWithCheckboxOnly: false,
                        showSelectionCheckbox: false,
                        showFilter: false,
                        keepLastSelected: false,
                        selectedItems: [],
                        afterSelectionChange: undefined, // Set by setAfterSelectionChange function
                        pagingOptions: { //Pagination grid Config
                            pageSize: 1000,
                            currentPage:1
                        },
                        columnDefs: [
                            {
                                field: 'contact_eid', displayName: 'ID', resizable: false, width: '10%',
                                cellTemplate:  '<div class="ngCellText"><a href="/ui#/tt/incidences/{{row.entity[col.field]}}" class="ng-binding"><button title="Incidence ID" class="btn btn-small default">{{row.entity[col.field]}}</button></a></div>',
                                sortable: true, headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'contact.customerservice.code', displayName: 'Customer Service', resizable: false, width: '25%', 
                                sortable: true, headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'contact.description', displayName: 'Description', resizable: false, width: '40%',
                                sortable: true, headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'status', displayName: 'Status', resizable: false, width: '25%',
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity[col.field] | i18n}}</span></div>',
                                sortable: true, headerCellTemplate: _headerCellTemplate,
                            }
                        ]
                    }
                },
                'relatedProblems': {
                    'gridConfig': {
                        headerRowHeight: 37,
                        showFooter: false,
                        plugins: [new ngGridFlexibleHeightPlugin()],
                        multiSelect: false,
                        showColumnMenu: false,
                        showGroupPanel: false,
                        selectWithCheckboxOnly: false,
                        showSelectionCheckbox: false,
                        showFilter: false,
                        keepLastSelected: false,
                        selectedItems: [],
                        afterSelectionChange: undefined, // Set by setAfterSelectionChange function
                        pagingOptions: { //Pagination grid Config
                            pageSize: 1000,
                            currentPage:1
                        },
                        columnDefs: [
                            {
                                field: 'eid', displayName: 'Id', resizable:'true', width: '5%', headerCellTemplate: _headerCellTemplate,
                                cellTemplate:  '<div class="ngCellText"><a href="/ui#/tt/problems/{{row.entity[col.field]}}" class="ng-binding"><button title="Incidence ID" class="btn btn-small default">{{row.entity[col.field]}}</button></a></div>',
                                sortable: true, headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'type', displayName: 'Problem Type', width: '20%', headerCellTemplate: _headerCellTemplate,
                                sortable: true, headerCellTemplate: _headerCellTemplate
                            },
                            {
                                field: 'status', displayName: 'Status', sortable: true, width: '15%',
                                headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity[col.field] | i18n}}</span></div>'
                            },
                            {
                                field: 'affected.0.code', displayName: 'Affected', width: '20%', 
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.affected.0.code}}</span></div>'
                            },
                            {
                                field: 'annotations.0.value', displayName: 'Notes', width: '25%', 
                                headerCellTemplate: _headerCellTemplate,
                                sortable: true,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.annotations.0.value}}</span></div>'
                            },
                            {
                                field: 'customers', displayName: 'Affected Customer', sortable: true, width: '15%',
                                headerCellTemplate: _headerCellTemplate,
                                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{jsonLength(row.entity[col.field])}}</span></div>'
                            }
                        ]
                    }
                }
            },
            /** Parameters information for filtering */
            parameters: [
                {'name': 'openInTab'},
                {'name': 'sla'},
                {'name': 'type', 'type': ['Claim', 'Query', 'Order'], 'widget' : 'array'},
                {'name': 'problem_type', 'widget': 'text'},
                {'name': 'status', 'type': ['New', 'Active', 'Delayed', 'Restored', 'Solved','Closed', 'Canceled'], 'widget': 'array'},
                {'name': 'status_wo', 'type': ['New', 'Planned', 'Active', 'Finished', 'Canceled'], 'widget': 'array'},
                {'name': 'status_problem', 'type': ['Active', 'Delayed', 'Solved', 'Closed'], 'widget': 'array'},
                {'name': 'eid', 'widget' : 'text'},
                {'name': 'impact_on_srv', 'widget': 'text'},
                {'name': 'customer_name', 'widget': 'text'},
                {'name': 'leading_ob', 'widget': 'text'},
                {'name': 'customer_service', 'widget': 'text'},
                {'name': 'severity', 'type': ['Cosmetic', 'Slight', 'Minor', 'Major', 'Major high', 'Critical'], 'widget': 'array'},
                {'name': 'priority', 'widget': 'text'},
                {'name': 'status_change', 'widget': 'datepicker'},
                {'name': 'responsible_operator', 'widget': 'text'},
                {'name': 'responsible_group', 'widget': 'text'},
                {'name': 'responsible_name', 'widget': 'text'},
                {'name': 'delegate_user', 'widget': 'text'},
                {'name': 'delegate_group', 'widget': 'text'},
                {'name': 'originator_group', 'widget': 'text'},
                {'name': 'description', 'widget': 'text'},
                {'name': 'repair_date'},
                {'name': 'start_date', 'widget': 'datepicker'},
                {'name': 'end_date', 'widget': 'datepicker'},
                {'name': 'planned_date_start', 'widget': 'datepicker'},
                {'name': 'planned_date_end', 'widget': 'datepicker'},
                {'name': 'real_date_date_start', 'widget': 'datepicker'},
                {'name': 'real_date_date_end', 'widget': 'datepicker'},
                {'name': 'scheduled_date', 'widget': 'datepicker'},
                {'name': 'target_date', 'widget': 'datepicker'},
                {'name': 'subject', 'widget': 'text'},
                {'name': 'kpi_type','widget': 'text'},
                {'name': 'rel_incidences',' widget': 'text'},
                {'name': 'problemtype_description', 'widget': 'text'},
                {'name': 'symptom_description', 'widget': 'text'},
                {'name': 'affected_customer', 'widget': 'text'},
                {'name': 'comment', 'widget': 'text'},
                {'name': 'code', 'widget': 'text'},
                {'name': 'name', 'widget': 'text'},
                {'name': 'target_date', 'widget': 'datepicker'},
                {'name': 'rel_customers', 'widget': 'text'},
                {'name': 'annotation', 'widget': 'text'},
                {'name': 'solvingprocedures', 'widget': 'text'}
            ],
            /** templates for grids */
            templates: {
                headerCellTemplate: _headerCellTemplate,
                repairDateTemplate: _repairDateTemplate,
                rowTemplate: _rowTemplate,
                semaphoresTemplate: _semaphoresTemplate
            }
        },
        setAfterSelectionChange: function(key, afterSelectionChangeFn) {
            this.grid.config[key].gridConfig.afterSelectionChange = afterSelectionChangeFn
        }
    }
});


