/**
 * @ngdoc directive
 * @name udoModule.directive:gridDatePicker
 * @description Directive that returns a Datepicker with range dates style (From --- to ---).
 */

udoModule.directive('gridDatePicker', function($compile, $filter, $rootScope, $route) { 
    var params  = {},
        query   = "",
        firstTime = true;

    return {
        restrict: 'E',
        transclude: true,
        scope: true,
        link: function(scope, element, attrs) {
            var subDict = {},
                rangeTime,
                insertedRangeTime;

            var children = element.children("input.input-date-grid");//put the datepickers in its inputs
            var paramName = attrs.dateFilter;   //Atribute from the view
            /**
             * 
             * ! intern undocumented method !
             * @name udoModule.directive.gridDatePicker:link#clearDate
             * @description Removes the filter inserted and GETS the data without the filter
             * from the API (Normally is used at click in a trash button at the side of the datepicker).
             * It calls to the function dateQuery of the parent scope, the controller where you want to use it
             * to manipulate
             */

            scope.clearDate = function() {
                $(children).val(""); //Remove values from inputs
                var regexp = "&_date_" + paramName;
                var re = new RegExp(regexp + ".*?(&|$)", "g");
                query = query.replace(re, ""); //Remove from the query
                delete params[paramName];   //Remove param from json
                subDict = {};   //Remove the subDict
                scope.$parent.dateQuery(query); //Send the new query
            }
            //Binds a datepicker to the children divs of the template and initialize it with
            //default values passed as options.
            $(children).datepicker({
                'format': $rootScope.formatLanguage.toLowerCase(),
                'autoclose' : true,
                'todayHighlight': true,
                'todayBtn': true,
                'orientation': 'top',
            }).on('changeDate', function(e){    //Triggers when the date is changed
                insertedRangeTime = $(this).context.name;
                //Get the date
                var y = e.date.getFullYear(),
                    _m = e.date.getMonth() + 1,
                    m = (_m > 9 ? _m : '0'+_m),
                    _d = e.date.getDate(),
                    d = (_d > 9 ? _d : '0'+_d),
                    date = y + '-' + m + '-' + d;
                
                subDict[insertedRangeTime] = date;
                params[paramName] = subDict;
                if (params[paramName]) {   //Exist a param in the params with this key
                    rangeTime = insertedRangeTime === 'start' ? 'end' : 'start'; //For looking if the opposite existsin params dict
                    if (params[paramName][rangeTime]) {    //CASE 1: Exist the other value for the range. Create the query
                        var queryExisting = RegExp("&_date_" + paramName + "{1}[^&]*&?", "g");
                        //Controls if the new query is already in the actual query and removes it to not repeat it
                        query = query.replace(queryExisting, "");
                        query +=  '&_date_' + paramName + '=' + params[paramName].start + ' 00:00:00.0000,' + params[paramName].end + ' 23:59:59.9999';
                        scope.$parent.dateQuery(query);    //Call function dateFilter from parent controller
                    }
                }
            });
            
            //Injects a new function in to the datepicker to add the format lang dynamically
            $(children).data().datepicker.setFormat = function(format) {
                this.o.format = format;
                this.setValue();
            };

            // Watch for the change of language
            scope.$watch('formatLanguage', function() {
                if (!firstTime) { //Not trigger when changes at first time
                    var start = $(children)[0].value,
                        end = $(children)[1].value;
                    $(children).datepicker("setFormat", $rootScope.formatLanguage.toLowerCase());
                    if (start === "") $(children)[0].value = start; // If not data do not use today, use ""
                    if (end === "") $(children)[1].value = end;     // If not data do not use today, use ""
                }
                firstTime = false;
            });

            //Reset params var when change from one grid to another one
            scope.$on('$routeChangeStart', function(next, current) { 
                params = {};
            });
        },
        template:
            '<div class="input-daterange" id="datepicker">' +
            '   <input type="text" class="input-date-grid readonly-white" name="start" readonly/>' +
            '   <span class="add-on">to</span>' +
            '   <input type="text" class="input-date-grid readonly-white" name="end" readonly/>' +
            '   <span class="add-on garbage-button"><div ng-click="clearDate()"><i class="icon-trash"></i></div></span>' +
            '</div>'
        ,
        replace: true
    };
});
