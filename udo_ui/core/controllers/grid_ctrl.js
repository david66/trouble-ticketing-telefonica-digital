
/**
 * @ngdoc controller
 * @name udoModule.controller:gridCtrl
 * @description
 * gridCtrl is a generic controller to generate grids, it is used in entity grids as incidence grid, contact grid
 * and is used too in some modules inside detail views, for example, the history of the incidence.
 * 
 * This controller is initialized from the view calling the $scope.initGrid(params) method using an "ng-init" call
 * from the view.
 * See the initGrid method documentation for more info of how to initialize the grid.   
 */

udoModule.controller('gridCtrl', 
['$rootScope', '$scope', '$routeParams', '$http','$location', '$filter', 'SEVERITY_LABELS', 'SEVERITY_LABELS_WOS', 'TRANSLATION_MAP', 'utils', 'configs',
function($rootScope, $scope, $routeParams, $http, $location, $filter, SEVERITY_LABELS, SEVERITY_LABELS_WOS, TRANSLATION_MAP, utils, configs) {

    var queryProperties = {}; //Properties for build the API query
    
    /** SCOPE VARS **/
    $scope.query = '';              //API query
    $scope.locationPath = $location.path();
    $scope.filterValue= "";         //Select filter model
    //$scope.pagingOptions =        // Asigned in initGrid
    $scope.filterOptions = { filterText: '' };

    ////////////////////////////////////////////// FUNCTIONS CONTROLLER

    /**
     * @ngdoc method
     * @methodOf udoModule.controller:gridCtrl
     * @name udoModule.controller:gridCtrl#formatCodeHistory
     * @param {Object:JSON} description The description subdictionary of the history doc
     * @description If the description of the history is bigger than 100 chars the icon color of the
     * grid will turns blue (enabled) else will be grey (disabled)
     */
    $scope.iconColor = function(description){
            if(description.type === "status")
                return description.cause ? 'enabled' : 'disabled'; 
            return (description.value && description.value.length > 100 || description.type) ? 'enabled' : 'disabled';
    };
    /**
     * @ngdoc method
     * @methodOf udoModule.controller:gridCtrl
     * @name udoModule.controller:gridCtrl#formatCodeHistory
     * @param {Object:JSON} concept The JSON with the history and status change mixed data.
     * @description Format the code data from the history json to be shown in the FE.
     */
    $scope.formatCodeHistory = function(concept) {
        if (concept.type === 'status') return 'Change of status';
        return TRANSLATION_MAP[concept.code] ?
            TRANSLATION_MAP[concept.code] : 'Change of ' + concept.code;
    }
    /**
     * @ngdoc method
     * @methodOf udoModule.controller:gridCtrl
     * @name udoModule.controller:gridCtrl#formatDescriptHistory
     * @param {Object:JSON} concept The JSON with the history and status change mixed data.
     * @description Format Description data from the history json to be shown in the FE.
     */
    $scope.formatDescriptHistory = function(concept) {
        var data, uri, severityScale;
        if (concept.code === 'severity') {
            
            //Determine the scale of the severities to use
            severityScale = ($location.path().indexOf("workorders") === -1) ?  SEVERITY_LABELS : SEVERITY_LABELS_WOS;
            
            return (typeof(concept.old_value) !== "undefined") ?
                $filter('i18n')(severityScale[concept.old_value]) + ' -> ' + $filter('i18n')(severityScale[concept.value])
                : 
                $filter('i18n')(severityScale[concept.value]);
        }

        if (concept.code === 'priority') {
            var oldValue = concept.old_value;
            var newValue = concept.value;

            return (typeof(oldValue) !== "undefined") ? oldValue + ' -> ' + newValue : newValue;
        }

        //NEW UI: TO-DO -> return it with the proper format or solve this in the template
        //Only for incidenceDetail
        if (concept.code === 'target_date') {
            return $filter('date')($scope.utc2local(concept.value), $rootScope.formatLanguage);
        }

        if (concept.type === 'status') {
            data = '<div class="blueTitles">' + $filter('i18n')('Changed to Status') + ': </div>' +
                $filter('i18n')(concept.code);

            //Cause of Status Change
            if (concept.delayed_reason) {
                data += '<br /><div class="blueTitles">' + $filter('i18n')('Cause') + ': </div>' +
                    $filter('i18n')(concept.delayed_reason.code);
            }
            //Description of Status Change
            if (concept.cause) {
                data += '<br /><div class="blueTitles">' + $filter('i18n')('Description') + ': </div>' +
                    concept.cause;
            }
            return data;
        }
        /**
         * @ngdoc method
         * @methodOf udoModule.controller:gridCtrl
         * @name udoModule.controller:gridCtrl#formatDescriptHistoryWos
         * @param {Object:JSON} concept The JSON with the history and status change mixed data.
         * @description Specialization of formatDescriptHistory for WorkOrders to use the severity labels of the WOS
         * 
         */
        $scope.formatDescriptHistoryWos = function(concept) {
            if (concept.code === 'severity') {
                return (typeof(concept.old_value) !== "undefined") ?
                    $filter('i18n')(SEVERITY_LABELS_WOS[concept.old_value]) + ' -> ' + $filter('i18n')(SEVERITY_LABELS_WOS[concept.value])
                    : 
                    $filter('i18n')(SEVERITY_LABELS_WOS[concept.value]);
            }
            $scope.formatDescriptHistory(concept);
        }

        //NEW UI: Insert this for WOS
        //Only for WOs
        // if (concept.concept === 'planned_date_start' || concept.concept === 'planned_date.start' ||
        //     concept.concept === 'planned_date_end' || concept.concept === 'planned_date.end') {
        //     var paramModifiedInfo = getParamModifiedBy(self.workOrder, parameter);
        //     dataValue.html(sanitize(_('$datetime', utc2local(concept.data.value))));
        //     return data.append(dataValue).append(paramModifiedInfo);
        // }
        if (concept.concept === 'annotations') {
            //NEW UI: Remember this for the code column
            // var annotation = $("<div>").addClass("blackText").text(_('Change of') + ' ' + concept.data.value.code + ': ');
            return concept.value.value;
        }

        if (concept.code === 'ATTACHMENT_ADDED' || concept.code === 'ATTACHMENT_DELETED') {
            uri = concept.value.replace(/\[[\S\d]*\]\s*/g, ""); //uri
            uri = location.protocol + '//' + location.host + uri; //Complete URL
            return '<a href="' + uri + '">' + uri + '</a>';    
        }
        return utils.html.escape(concept.value);
    }
    /**
     * @ngdoc method
     * @methodOf udoModule.controller:gridCtrl
     * @name udoModule.controller:gridCtrl#showSideBar
     * @param {Object:JSON} description The data of the row.
     * @description This function shows The data of a history row in the right sidebar container.
     * The right sidebar is defined in the udo.html and is hidden by default.
     */
    $scope.showSideBar = function (description) {
        var headers,
            counter = 0;
        $rootScope.sidebarRightContent = $rootScope.sidebarRightContent || {};
         $rootScope.sidebarRightContent.description = '<h2 class="blueColorSidebar">Extended Info</h2><br />'; //Titles traslated
        if (description.value && description.value.length > 100) { //Normal History
            angular.forEach(description, function(entity, index) {
                headers = ['Date', 'Modified By', 'Type', 'Description'];
                $rootScope.sidebarRightContent.description += '<div class="rightbarTitles">' + $filter('i18n')(headers[counter]) + '</div>';
                if(headers[counter] === 'Date') {
                    $rootScope.sidebarRightContent.description += $filter('date')($scope.utc2local(entity), $rootScope.formatLanguage) + '<br /><br />'; //Date filter
                }
                else {
                    $rootScope.sidebarRightContent.description += utils.html.escape(entity) + '<br /><br />';
                }
                counter++;
            });
            $rootScope.sidebarRightContent.show = "true";
        }
        else if (description.type && description.cause) { //Status change hist
            $rootScope.sidebarRightContent.description += '<div class="rightbarTitles">' + $filter('i18n')("Date") + '</div>';
            $rootScope.sidebarRightContent.description += $filter('date')($scope.utc2local(description.start), $rootScope.formatLanguage) + '<br /><br />'; //Date filter
            $rootScope.sidebarRightContent.description += '<div class="rightbarTitles">' + $filter('i18n')("Modified By") + '</div>';
            $rootScope.sidebarRightContent.description += utils.html.escape(description.starting_operator) + '<br /><br />'; //Translate filter
            $rootScope.sidebarRightContent.description += '<div class="rightbarTitles">' + $filter('i18n')("Code") + '</div>';
            $rootScope.sidebarRightContent.description += $filter('i18n')("Change of status") + '<br /><br />'; //Translate filter
            $rootScope.sidebarRightContent.description += '<div class="rightbarTitles">' + $filter('i18n')("Description") + '</div>';
            $rootScope.sidebarRightContent.description += $scope.formatDescriptHistory(description) + '<br /><br />'; //Translate filter
            
            $rootScope.sidebarRightContent.show = "true";
        }
    };
    /**
     * @ngdoc method
     * @methodOf udoModule.controller:gridCtrl
     * @name udoModule.controller:gridCtrl#showRawData
     * @param {Object:JSON} description The data of the row.
     * @description This function shows The raw data of a history row in a new tab.
     */
    $scope.showRawData = function (description) {
        myWindow = window.open('', '_newtab');
        var headers = ['Date', 'Modified By', 'Type', 'Description'],
            counter = 0;
        var data = '';
        angular.forEach(description, function(entity, index) {
            data += '<div class="rightbarTitles">' + $filter('i18n')(headers[counter]) + '</div>';
            if(headers[counter] === 'Date') {
                data += $filter('date')($scope.utc2local(entity), $rootScope.formatLanguage) + '<br /><br />'; //Date filter
            }
            else {
                data += '<div style="white-space: pre-wrap">' + utils.html.escape($filter('i18n')(entity)) + '</div><br /><br />'; //Translate filter
            }
            counter++;
        });
        myWindow.document.write(data);
        myWindow.document.close();
    }
    /**
     * @ngdoc method
     * @methodOf udoModule.controller:gridCtrl
     * @name udoModule.controller:gridCtrl#getFilterType
     * @param {Object:JSON} parameters gets the parameters var with the configuration of all the parameters that
     * can be show in the grids.
     * @description Assigns to $scope.paramsForFilters the array of the parameters that 
     * are going to be used in the grid.
     * $scope.paramsForFilters is a variable used for discriminate the type of field displayed in the view.
     * (See header.html)
     */
    $scope.getFilterType = function (parameters) {
        var params = [],
            position;

        angular.forEach(parameters, function(parameter){
            position = $.inArray(parameter.name, configs.grid.config[$scope.locationPath].parametersNames);
            if (position >= 0) {
                params.splice(position, 0, parameter);
            }
        });
        $scope.paramsForFilters = params;
    }

    /**
     * @ngdoc method
     * @methodOf udoModule.controller:gridCtrl
     * @name udoModule.controller:gridCtrl#available_slas
     * @param {string} sla_info The value of the JSON entity with the info of the sla.
     * @return {string} inc_available_slas that represents in the view the $scope.inc_available_slas variable, that
     * can take two possible values, available or not_available
     * @description Function to set in the context a variable that indicates if the sla is available or not.
     * (See semaphores.html)
     */
    $scope.available_slas = function(sla_info) {
        if (sla_info === "no_data") $scope.inc_available_slas = "no_data";
        else $scope.inc_available_slas = sla_info ? 'available' :'not_available';
        return "inc_available_slas";
    }

    $scope.showOpenInTab = function(tabShow) {
        $scope.showTab = (tabShow) ? 'not_available': 'available';
        return "showTab";
    }

    /**
     * @ngdoc method
     * @methodOf udoModule.controller:gridCtrl
     * @name udoModule.controller:gridCtrl#getSeverityLabel
     * @param {number} severityNumber the number that represents the severity value.
     * @return {string} The string that represents the severity in the SEVERITY_LABELS array.
     * @description Function to set in the context a variable that indicates if the sla is available or not.
     * (See semaphores.html)
     */
    $scope.getSeverityLabel = function(severityNumber) {
        return SEVERITY_LABELS[severityNumber]; 
    };

    /**
     * ! intern function undocumented !
     * @functionOf udoModule.controller:gridCtrl
     * @name udoModule.controller:gridCtrl#queryGenerator
     * @param {Object:JSON} col Represents the data of the column that is going to be filtered.
     * @param {bool} sort true if the query is for sorting functionality.
     * @return {string} $scope.query The string generated query.
     * @description This function generates a query for filtering and sorting columns (All kind of data except datepickers)
     */
    function queryGenerator(col, sort) {
        var isIncidence = $location.path().indexOf("incidences") >= 0,  //Incidences have some _g_ specials
            severityLabelPosition, prefix,
            sortMode, notG;

        //Special transformation for SEVERITY
        if (col.field == 'severity') {
            severityLabelPosition = $.inArray(col.filter, SEVERITY_LABELS);
            col.filter = severityLabelPosition >= 0 ?  severityLabelPosition : undefined;
        }

        col.field = col.field.replace("contact.", "").replace(".code", "");     //Remove prefix contact
        notG = isIncidence ? ["customer_name", "type","leading_ob", "customerservice"] : ["customer_name", "leading_ob"]; //Not need the prefix _g_ for search
        prefix  = $.inArray(col.field, notG) === -1 ? '_g_' : "";               //Use _g_,
        
        if (col.filter != undefined && !queryProperties[col.field]) {                   //New field to add at the end of the query
            $scope.query += '&' + prefix + col.field + "=" + col.filter + '&sord=desc'; //insert the new
            queryProperties[col.field] = col.filter;
        }
        else {
            //Modify a previous existing query : delete a filter in the query
            col.filter ? queryProperties[col.field] = col.filter : delete queryProperties[col.field];
            $scope.query = '';
            angular.forEach(queryProperties, function(filter, field){
                prefix = $.inArray(field, notG) === -1 ? '_g_' : "";        //Use _g_
                $scope.query += '&' + prefix + field + "=" + filter + '&sord=desc';
            });

        }
        //Sorting
        if (sort) {
            col.sort();                                                  //function for trigger show down/up button on view
            sortMode = col.showSortButtonDown() ? 'asc' : 'desc';
            if (col.colDef.dateSorter) {
                $scope.query += "&sidx=" + col.colDef.dateSorter + '&sord=' + sortMode;
            } 
            else {
                $scope.query += "&sidx=" + prefix + col.field + '&sord=' + sortMode;
            }
            if($scope.dateQry) $scope.query =  $scope.dateQry + $scope.query;
        }
        return $scope.query.toLowerCase();
    }

    /**
     * @ngdoc method
     * @methodOf udoModule.controller:gridCtrl
     * @name udoModule.controller:gridCtrl#columnSort
     * @param {Object:JSON} col Represents the data of the column that is going to be Sorted.
     * @description This function is called to sort by column clicking on the header of the grid.
     */ 
    $scope.columnSort = function (col) {
        $scope.pagingOptions.currentPage = 1;   //Ensure show the first page when filtering
        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, queryGenerator(col, true));
    };

    /**
     * @ngdoc method
     * @methodOf udoModule.controller:gridCtrl
     * @name udoModule.controller:gridCtrl#columnFilter
     * @param {Object:JSON} col Represents the data of the column that is going to be filtered.
     * @param {string} filter For selectBoxes, value passed by the view when the user changes the value of the select.
     * @description This function is called for filtering (all filters except date type).
     */ 
    $scope.columnFilter = function (col, filter) {
        $scope.pagingOptions.currentPage = 1;   //Ensure show the first page when filtering
        if (filter || filter === null) col.filter = filter; //For selectboxes

        $scope.query = queryGenerator(col);
        if($scope.dateQry) $scope.query = $scope.query + $scope.dateQry;
        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.query);
    };

    /**
     * @ngdoc method
     * @methodOf udoModule.controller:gridCtrl
     * @name udoModule.controller:gridCtrl#dateQuery
     * @param {string} query The query generated for data filtering.
     * @description This function is called for Date filtering.
     */
    $scope.dateQuery = function(query) {
        $scope.pagingOptions.currentPage = 1; //Ensure show the first page when filtering
        $scope.dateQry = query;
        if($scope.query) $scope.dateQry = $scope.query + $scope.dateQry;
        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.dateQry);
    };

    /**
     * @ngdoc method
     * @methodOf udoModule.controller:gridCtrl
     * @name udoModule.controller:gridCtrl#setPagingData
     * @param {Object:JSON} data The data of the rows from the API.
     * @description Set the data from the API in the grid configuration.
     */ 
    $scope.setPagingData = function(data){
        $scope.myData = data.data ? data.data : data;

        if (data.meta_pagination) $scope.totalServerItems = data.meta_pagination.totalitems;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };

    /**
     * @ngdoc method
     * @methodOf udoModule.controller:gridCtrl
     * @name udoModule.controller:gridCtrl#getPagedDataAsync
     * @param {number} pageSize The number of rows of the page
     * @param {number} page The number of the current Page
     * @param {string} query The query for the uri get from the API
     * @description Get the paged data from the api filtered using the query argument (To use in the URI)
     */ 
    $scope.getPagedDataAsync = function (pageSize, page, query) {
        if (!query) query = '&sidx=&sord=desc'; //Ordenation by id descendent in default query
        var api = configs.grid.config[$scope.locationPath].api + '&rows=' + pageSize + '&page=' + $scope.pagingOptions.currentPage + query;
        $http.get(api).success(function (largeLoad) {
            if (largeLoad.data.length === 0) largeLoad = [{tab: true, sla_info: "no_data", contact: "no_data"}];
            $scope.setPagingData(largeLoad);
        });
    };

    $scope.openInTab = function(row, $event, key) {
        var id = row.getProperty(key),
            myWindow;
        if ($event.stopPropagation) $event.stopPropagation();
        if ($event.preventDefault) $event.preventDefault();
        $event.cancelBubble = true;
        $event.returnValue = false;
        myWindow = window.open('ui#' + $scope.locationPath + id, '_blank');
        myWindow.document.close();
    }

    // ============= INIT ============= //

    /**
     * @doc property
     * @propertyOf udoModule.controller:gridCtrl
     * @name udoModule.controller:gridCtrl#gridOptions
     * @description Variable with the default configuration of the grids
     */
    $scope.gridOptions = {
        data: 'myData',
        enablePaging: true,
        showFooter: true,
        totalServerItems: 'totalServerItems',
        pagingOptions:  { //Pagination grid Config
                            pageSizes: [10, 20, 40],
                            pageSize: 10,
                            currentPage: 1
                        },
        headerRowHeight: 80,
        rowHeight: 40,
        // filterOptions: { filterText: '', useExternalFilter: false },
        enableSorting: true,
        enableCellSelection: false,
        enableRowSelection: true,
        enableCellEditOnFocus: false,
        enableColumnResize: true,
        enableColumnReordering: true,
        enableHighlighting: true,
        enableRowReordering: false, //Only works on html5  ---
        multiSelect: false, //default is true
        plugins: [new ngGridFlexibleHeightPlugin()],
        selectWithCheckboxOnly: true, // (to disable select on row..)
        showColumnMenu: true, 
        showFilter: false,
        showGroupPanel: true,
        filterOptions: $scope.filterOptions,
        showSelectionCheckbox: false //Checkbox when we had the eye to open the row       
    };

    //Copying in grid scope some utils needed for grid templates
    $scope.getRepairDate = utils.date.getRepairDate;
    $scope.isSolved = utils.date.isSolved;
    $scope.utc2local = utils.date.utc2local;
    $scope.getSemaphoreImageUrl = utils.tt.getSemaphoreImageUrl;
    $scope.jsonLength = utils.json.length;

    /**
     * @ngdoc method
     * @methodOf udoModule.controller:gridCtrl
     * @name udoModule.controller:gridCtrl#initGrid
     * @param {Object:JSON} params 
     * @example
     *  {
            data: array of jsons with the data of the grid rows, 
            configKey: The string name of the key in the config var to get the specific configuration of this grid, 
            useLocation: true if the configKey of the grid is the location path
        }
     * @description
     * This is the init interface for the grid. Now we have two tipe of grid configurations,
     * Static: His config key in the config var is the location path to show them (For Normal grids that uses apis to get data)
     * Dynamic: His config key is passed from the view (For use grids in components for example in detail components as history)
     *
     * Depending of the params sended by the view to this method, the configuration of the grid will be different,
     * If the view calls the initGrid with the param useLocation with a falsy value, the grid will be using the data
     * passed by the view to fill the grid, and the key to get the config of the grid in the config var will be the
     * obtained in the configKey.
     * This kind of grids don't have filters and they don't use an specific api, the data is passed by the parent and the
     * fintering and pagination is done in the FE.
     *
     * If the view calls the initGrid with the param useLocation with true value, the grid will use the location path
     * as key in the config var. The data will come from an udo API, and filtering, paging will be made by the API.
     */
    $scope.initGrid = function (params) {
        if (params.useKey){
            //Not location
            $scope.locationPath = params.configKey; // Used for load configuration
            params.useLocation = true;
        }

        if (params.useLocation){
            //Extends the gridOptions default with the specific options of the grid
            if (params.useAfterSelectionChange){
                //configs.grid.config[$scope.locationPath].gridConfig.afterSelectionChange = $scope.$parent.$parent.afterSelectionChange;
                configs.setAfterSelectionChange($scope.locationPath, $scope.$parent.$parent.afterSelectionChange);
            }
            $scope.gridOptions = angular.extend($scope.gridOptions, configs.grid.config[$scope.locationPath].gridConfig);
            $scope.pagingOptions = $scope.gridOptions.pagingOptions; // pagingOptions by gridOptions
            //Discriminate parameters aren't in the grid.
            $scope.getFilterType(configs.grid.parameters);
            //First call to getPagedDataAsync
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

            // toolbarIcons
            if (typeof(configs.grid.config[$scope.locationPath].csv) != "undefined") {
                var newIcon = {type: 'link', name: 'Save', 
                                url: configs.grid.config[$scope.locationPath].csv, icon: 'icon-save', active: ''};
                $rootScope.toolbarIcons.unshift(newIcon);
            }
        }
        else {
            //Extends the gridOptions default with the specific options of the grid
            if (params.useAfterSelectionChange){
                //configs.grid.config[params.configKey].gridConfig.afterSelectionChange = $scope.$parent.$parent.afterSelectionChange;
                configs.setAfterSelectionChange(params.configKey, $scope.$parent.$parent.afterSelectionChange);
            }
            $scope.gridOptions = angular.extend($scope.gridOptions, configs.grid.config[params.configKey].gridConfig);
            $scope.pagingOptions = $scope.gridOptions.pagingOptions; // pagingOptions by gridOptions
            //Add data to the grid
            $scope.setPagingData(params.data);  
        }
    }

    /**
     * ! internal watcher function
     *
     * @description Watches for changes in the pagination number to call the API.
     */
    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        var query = $scope.query;
        if (newVal !== oldVal) {
            if($scope.dateQry)  query += $scope.dateQry;
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, query.toLowerCase());
        }
    }, true);
}]);
