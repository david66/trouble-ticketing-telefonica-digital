udoModule.directive('fieldDispatcher', [function() {
    var _template =    
    //Order in which the objects were declared
    '<div ng-repeat="key in fields | sortDeclared" ng-init="field = fields[key]">'                  +
        // <div class="span3 controls" ng-if="!notApplyField(key, record.data)">
        '<div class="span3 wizard-control">'                                                        +
            '<label>{{ field.name | i18n }}</label>'                                                +
            '<div class="wizard-field" ng-switch="field._widget">'                                  +
                // !editable
                '<div ng-if="!field.editable" class="noteditable-fields" ng-switch="field.widget">' +
                    //Array
                    '<div class="{{field.info.class}}" ng-switch-when="array">'                     +
                        '<input type="text" value="{{showData(field)}}"                             \
                        class="ui-autocomplete-input" autocomplete="off" role="textbox"             \
                        aria-autocomplete="list" aria-haspopup="true" disabled>'                    +
                        '<button ng-if="hasInfo(field)" ng-disabled="!hasInfoCause(field)"          \
                        bs-popover="/betacompany/udo_ui/core/views/components/status_info.html"     \
                        data-title="{{field.info.title}}"  data-placement="bottom"                  \
                        class="btn semaphore"><i ng-class="field.info.btn"></i></button>'           +
                    '</div>'                                                                        +
                    // date
                    '<input ng-switch-when="date" type="text"                                       \
                    value="{{ field.value|udoDate }}" class="ui-autocomplete-input"                 \
                    autocomplete="off" role="textbox"                                               \
                    aria-autocomplete="list" aria-haspopup="true" disabled>'                        +
                    //time
                    '<input ng-switch-when="time" type="text" value="{{ field.value|udoDate }}"     \
                    class="ui-autocomplete-input" autocomplete="off" role="textbox"                 \
                    aria-autocomplete="list" aria-haspopup="true" disabled>'                        +
                    //sla_info
                    '<div ng-switch-when="sla_info" class="sla-info">'                              +
                        '<div ng-switch="field.available_sla">'                                     +                        
                            '<div ng-switch-when="not_available" title="Not available">'            + 
                                '<button title="{{\'SLA response indicator\' | i18n}}"              \
                                class="btn btn-small default" disabled="disabled">                  \
                                    <i class="icon-reply"></i>                                      \
                                </button> '                                                         +
                                '<button title="{{\'SLA restoration indicator\' | i18n}}"                          \
                                class="btn btn-small default" disabled="disabled">                  \
                                    <i class="icon-time"></i>                                       \
                                </button> '                                                         +
                                '<button title="{{\'SLA resolution indicator\' | i18n}}"                           \
                                class="btn btn-small default" disabled="disabled">                  \
                                    <i class="icon-ok"></i>                                         \
                                </button> '                                                         + 
                            '</div>'                                                                +
                            '<div ng-switch-when="available">'                                      +
                                '<button ng-if="field.value.response_time.value"                    \
                                Popover-animation="true" popover="{{\'Is the Response Time that an operator takes to assign the incidence\' | i18n}}" \
                                popover-title="{{\'SLA response indicator\' | i18n}}" popover-trigger="hover"      \
                                class="btn semaphore                                                \
                                {{getSemaphoreImageUrl(field.value.response_time.value,             \
                                field.value.response_time.max_time)}}">                             \
                                    <i class="icon-reply"></i>                                      \
                                </button> '                                                         +
                                '<button ng-if="!(field.value.response_time.value)"                 \
                                title="{{\'SLA response indicator\' | i18n}}"                                      \
                                class="btn default" disabled="disabled">                            \
                                    <i class="icon-reply"></i>                                      \
                                </button> '                                                          +
                                '<button ng-if="field.value.restoration_time.value"                 \
                                Popover-animation="true" popover="{{\'Is the Time that an operator takes to restore the incidence\' | i18n}}" \
                                popover-title="{{\'SLA restoration indicator\' | i18n}}" popover-trigger="hover"   \
                                class="btn semaphore                                                \
                                {{getSemaphoreImageUrl(field.value.restoration_time.value,          \
                                field.value.restoration_time.max_time)}}">                          \
                                    <i class="icon-time"></i>                                       \
                                </button> '                                                          +
                                '<button ng-if="!(field.value.restoration_time.value)"              \
                                title="{{\'SLA restoration indicator\' | i18n}}"                                   \
                                class="btn default" disabled="disabled">                            \
                                    <i class="icon-time"></i>                                       \
                                </button> '                                                          +
                                '<button ng-if="field.value.resolution_time.value"                  \
                                Popover-animation="true" popover="{{\'Is the Time that an operator takes to solve the incidence\' | i18n}}" \
                                popover-title="{{\'SLA resolution indicator\' | i18n}}" popover-trigger="hover"    \
                                class="btn semaphore                                                \
                                {{getSemaphoreImageUrl(field.value.resolution_time.value,           \
                                field.value.resolution_time.max_time)}}">                           \
                                    <i class="icon-ok"></i>                                         \
                                </button> '                                                         +
                                '<button ng-if="!(field.value.resolution_time.value)"               \
                                title="{{\'SLA resolution indicator\' | i18n}}"                                    \
                                class="btn default" disabled="disabled">                            \
                                    <i class="icon-ok"></i>                                         \
                                </button> '                                                          +
                            '</div>'                                                                +
                        '</div>'                                                                    +

                    '</div>'                                                                        +           
                    //otherwise
                    '<input ng-switch-default type="text" value="{{ field.value }}"                 \
                    class="ui-autocomplete-input" autocomplete="off" role="textbox"                 \
                    aria-autocomplete="list" aria-haspopup="true" disabled>'                        +
                '</div>'                                                                            +
                // editable
                '<div ng-if="field.editable">'                                                      +
                    // xeditable
                    '<div class="editable-fields" ng-if="isXEditable(field)" ng-switch="field.widget">' +
                        //Array
                        '<div class="{{field.info.class}}" ng-switch-when="array">'                                 +
                            '<a class="btn disabled" href="#" editable-select="field.value"                         \
                            e-ng-options="o.key as o.name for o in field.type"                                      \
                            onbeforesave="updateData(field, $data)">{{showData(field)}}</a>                         \
                            <button ng-if="hasInfo(field)" ng-disabled="!hasInfoCause(field)"                       \
                            bs-popover="/betacompany/udo_ui/core/views/components/status_info.html"                 \
                            data-title="{{field.info.title}}"  data-placement="bottom" \
                            class="btn semaphore"><i ng-class="field.info.btn"></i></button>'                       +
                        '</div>'                                                                                    +
                        //Text
                        '<div class="{{field.info.class}}" ng-switch-when="text">'                                  +
                            '<a class="btn disabled" href="#" editable-text="field.value"                           \
                            onbeforesave="updateData(field, $data)">{{ field.value || \'empty\' }}</a>              \
                            <button ng-if="hasInfo(field)" ng-disabled="!hasInfoCause(field)"                       \
                            bs-popover="/betacompany/udo_ui/core/views/components/status_info.html"                 \
                            data-title="{{field.info.title}}" data-customplacement="Status" data-placement="bottom" \
                            class="btn semaphore"><i ng-class="field.info.btn"></i></button>'                       +
                        '</div>'                                                                                    +
                        //Integer
                        '<a class="btn disabled" ng-switch-when="integer" href="#"                      \
                        editable-number="field.value"                                                   \
                        onbeforesave="updateData(field, $data)">{{ field.value || \'empty\' }}</a>'     +
                        // Date (datetimepicker used from editableBsdatetime)
                        '<a class="btn disabled" ng-switch-when="date" href="#"                         \
                        editable-bsdatetime="field.value"                                               \
                        onbeforesave="updateData(field, $data)"                                         \
                        e-datetimepicker-config="{ dropdownSelector: \'.my-toggle-select\',             \
                        startView: \'day\',  minView: \'day\' }" ng-required="field._mandatory">        \
                        {{showData(field)}}</a>'                                                        +
                        // Time (datetimepicker used from editableBsdatetime)
                        '<a class="btn disabled" ng-switch-when="time" href="#"                         \
                        editable-bsdatetime="field.value" e-ng-required="field._mandatory"              \
                        onbeforesave="updateData(field, $data)"                                         \
                        e-datetimepicker-config="{ dropdownSelector: \'.my-toggle-select\',             \
                        startView: \'day\',  minView: \'hour\' }" ng-required="field._mandatory">       \
                        {{showData(field)}}</a>'                                                        +
                    '</div>'                                                                            +
                    // not xeditable
                    '<div class="editable-fields" ng-if="!isXEditable(field)" ng-switch="field.widget">'+
                        //Array
                        '<select name="select_field" ng-switch-when="array" ng-model="field.value"'     +
                        'ng-required="field._mandatory"'                                                +
                        'ng-options="o.key as o.name for o in field._type"'                             +
                        'ng-disabled="field._disabled">'                                                +
                            '<option value="" ng-if="field._selectOption">{{selectOption|i18n}}</option>'+
                        '</select>'                                                                     +                                                   
                        //Text
                        '<input name="text_field" ng-switch-when="text" type="text"'                    +
                        'ng-model="field.value" ng-required="field._mandatory"'                         +
                        'ng-disabled="field._disabled"/>'                                               +
                        //Integer
                        '<input name="number_field" ng-switch-when="integer" type="number"'             +
                        'ng-model="field.value" ng-required="field._mandatory"'                         +
                        'ng-disabled="field._disabled"/>'                                               +
                        // Date (datetimepicker used from editableBsdatetime)
                        '<div class="form-horizontal date" ng-switch-when="date">' +
                            '<div class="dropdown">' +
                                '<a class="dropdown-toggle my-toggle-select" id="dLabel" role="button"' +
                                'data-target="#" href="#">' +
                                    '<div class="input-append">' +
                                        '<input type="text" class="input-date" data-ng-model="field.value" readonly>' +
                                        '<span class="add-on"><i class="icon-calendar"></i></span>' +
                                    '</div>' +
                                '</a>' +
                                '<ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">' +
                                    '<datetimepicker data-ng-model="field.value"' +
                                        'data-datetimepicker-config="{ dropdownSelector: \'.my-toggle-select\', startView: \'day\',  minView: \'day\'}">' +
                                    '</datetimepicker>' +
                                '</ul>' +
                            '</div>' +
                        '</div>' +
                        // Time (datetimepicker used from editableBsdatetime)
                        '<div class="form-horizontal date" ng-switch-when="time">' +
                            '<div class="dropdown">' +
                                '<a class="dropdown-toggle my-toggle-select" id="dLabel" role="button"' +
                                'data-target="#" href="#">' +
                                '<div class="input-append">' +
                                    '<input type="text" class="input-date" data-ng-model="field.value" readonly>' +
                                    '<span class="add-on"><i class="icon-calendar"></i></span>' +
                                '</div>' +
                                '</a>' +
                                '<ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">' +
                                    '<datetimepicker data-ng-model="field.value"' +
                                     'data-datetimepicker-config="{ dropdownSelector: \'.my-toggle-select\', startView: \'day\',  minView: \'hour\'}">' +
                                    '</datetimepicker>' +
                                '</ul>' +
                            '</div>' +
                        '</div>' +
                    '</div>'                                                                            +
                '</div>'                                                                            +
            '</div>'                                                                                +
        '</div>'                                                                                    +
    '</div>';


    return {
        restrict: 'EA',
        scope: {
            fields: '=',
            updateData: '=',
            showData: '=',
            getSemaphoreImageUrl: '='
        },
        template: _template,
        link: function(scope, element, attrs) {
            // Return FALSE if field.xeditable === false, return TRUE when otherwise
            scope.isXEditable = function(field) {
                if (typeof(field.xeditable) !== "undefined") {
                    return (field.xeditable === false) ? false : true;
                }
                else {
                    return true; // Default
                }
            }

            // Return TRUE if field.info is defined
            scope.hasInfo = function(field) {
                return (field.info);
            }

            // Return TRUE if field.info.cause is defined
            scope.hasInfoCause = function(field) {
                return (field.info.cause != "");
            }
        }
    }
}]);
