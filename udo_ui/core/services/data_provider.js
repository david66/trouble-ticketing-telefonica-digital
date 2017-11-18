/**
 * @ngdoc service
 * @name udoModule.service:dataProvider
 * @description UDo service to provide common and cached data.
 *
 * We use promises to guarantee that data is properly loaded before using it. So,
 * in order to load and cache data using _dataProvider_ service we need to use it
 * like this:
 *
 * <pre>
 * dataProvider.loadUserData().then(function() {
 *     userData = dataProvider.userData(); // This code executes just after the request(s)
 * });
 * </pre>
 *
 * Normally, the first time the data is loaded it is cached. Therefore, after that, no more
 * request will be performed to obtain the data.
 */
udoModule.service('dataProvider', ['$http', '$q', 'utils', '$filter',
                                   function dataProvider($http, $q, utils, $filter) {

    // Private vars to cache responses
    var _userData = undefined;
    var _customerServices = undefined; // CS list (for oeprator)
    var _requesterCustomerServices = undefined; // CS list (for requester)
    var _scenarios = {};
    var _parameters = {};
    var _customerServiceDetails = {};
    var _symptoms  = {};
    var _delayReasons = {};

    // ------------------------------
    // 
    // ------------------------------
    var api2model = function(newObject) {
        // Variables
        var stringResponsibleGroup = 'responsible_group';
        var stringOriginatorGroup  = 'originator_group';

        // Parameter
        function ParameterContactWizard(data)
        {
            /////////////
            // Methods //
            /////////////

            // Method getId
            if (typeof this.getId != "function")
            {
                ParameterContactWizard.prototype.getId = function() 
                {
                    return this._id;
                };
            }

            // Method getName
            if (typeof this.getName != "function")
            {
                ParameterContactWizard.prototype.getName = function() 
                {
                    return this._name;
                };
            }

            // Method getObjReferenced
            if (typeof this.getObjReferenced != "function")
            {
                ParameterContactWizard.prototype.getObjReferenced = function() 
                {
                    return this._objReferenced;
                };
            }

            // Method clearObjReferenced
            if (typeof this.clearObjReferenced != "function")
            {
                ParameterContactWizard.prototype.clearObjReferenced = function() 
                {
                    this._objReferenced = undefined;
                };
            }

            // Method isMandatory
            if (typeof this.isMandatory != "function")
            {
                ParameterContactWizard.prototype.isMandatory = function() 
                {
                    if ((typeof(this._mandatoryField) === "undefined") || (typeof(this._mandatoryValueField) === "undefined"))
                    {
                        return this._mandatory;
                    }
                    else
                    {
                        // Mandatory dependence WIP
                        return this._mandatory;
                    }
                };
            }

            // Method isEnabled
            if (typeof this.isEnabled != "function")
            {
                ParameterContactWizard.prototype.isEnabled = function() 
                {
                    return this._enabled;
                };
            }

            // Method isEditable
            if (typeof this.isEditable != "function")
            {
                ParameterContactWizard.prototype.isEditable = function() 
                {
                    return this._editable;
                };
            }

            // Method isEmpty
            if (typeof this.isEmpty != "function")
            {
                ParameterContactWizard.prototype.isEmpty = function() 
                {
                    var value = this.getValue();

                    return (((value === '') || (typeof(value) === "undefined")) ? true : false);
                };
            }

            // Method isString
            if (typeof this.isString != "function")
            {
                ParameterContactWizard.prototype.isString = function()
                {
                    return (typeof(this._type) === "string");
                };
            }

            // Method isInteger
            if (typeof this.isInteger != "function")
            {
                ParameterContactWizard.prototype.isInteger = function()
                {
                    return ((typeof(this._type) === "number") && (this._type)%1 == 0);
                };
            }

            // Method isDate
            if (typeof this.isDate != "function")
            {
                ParameterContactWizard.prototype.isDate = function()
                {
                  return (this._type instanceof Date &&
                          this._type.getHours() === 0 && 
                          this._type.getMinutes() === 0);  // Date has fixed 00:00:00 time
                }
            }

            // Method isTime
            if (typeof this.isTime != "function")
            {
                ParameterContactWizard.prototype.isTime = function()
                {
                  return (this._type instanceof Date);
                };
            }

            // Method isArray
            if (typeof this.isArray != "function")
            {
                ParameterContactWizard.prototype.isArray = function() 
                {
                    return (this._type instanceof Array);
                };
            }

            // Method isVisible
            if (typeof this.isVisible != "function")
            {
                ParameterContactWizard.prototype.isVisible = function() 
                {
                    return (this._visible);
                };
            }

            // Method setVisible
            if (typeof this.setVisible != "function")
            {
                ParameterContactWizard.prototype.setVisible = function(visible) 
                {
                    this._visible = visible;
                };
            }

            // Method getType
            if (typeof this.getType != "function")
            {
                ParameterContactWizard.prototype.getType = function() 
                {
                    return this._type;
                };
            }

            // Method getOrder
            if (typeof this.getOrder != "function")
            {
                ParameterContactWizard.prototype.getOrder = function() 
                {
                    return this._order;
                };
            }

            // Method getValue
            if (typeof this.getValue != "function")
            {
                ParameterContactWizard.prototype.getValue = function() 
                {
                    var value = undefined;

                    if (typeof(this._reference) != "undefined")
                    {
                        value = '';

                        if (typeof(this._type) === "string") // String (value)
                        {
                            value = this._reference.val().trim();
                        }
                        else if (typeof(this._type) === "number") // Number
                        {
                            value = this._reference.val();

                            if (!value) { value = 0; }

                            value = parseInt(value);
                        }
                        else if (this._type instanceof Date) // Date
                        {
                            value = this._reference.val();

                            if (value) 
                            {
                                value = utils.date.local2utc(this._reference.datepicker("getDate"));
                            }
                        }
                        else if (this._type instanceof Array) 
                        {
                            var element = this._type[0];

                            if ((element instanceof Array) && (element.length == 2)) // 2 dimension Array 
                            {
                                value = this._reference.val();
                            }
                            else if (typeof(element) === "string") // 1 dimension Array
                            {
                                value = this._reference.val();
                            }
                            else
                            {
                                // What is it? No String, no Integer, no Date, no 1 or 2 dimension Array
                                // EXCEPTION WIP
                            }
                         }
                         else
                         {
                            // What is it? No String, No Date, No Array 
                            // EXCEPTION WIP
                         }
                    }    
                        
                    return value; 
                };
            }

            // Method getIndexDefaultValue
            if (typeof this.getIndexDefaultValue != "function")
            {
                ParameterContactWizard.prototype.getIndexDefaultValue = function() 
                {
                    var index = 0;

                    if (this._type instanceof Array) 
                    {
                        var element = this._type[0];

                        if ((element instanceof Array) && (element.length == 2)) // 2 dimension Array 
                        {
                            for (var i=0; i<this._type.length; i++)
                            {
                                if (this._type[i][0] === this._defaultValue)
                                {
                                    index = i;
                                    break;
                                }
                            }
                        }
                        else if (typeof(element) === "string") // 1 dimension Array
                        {
                            index = $.inArray(this._defaultValue, this._type);
                        }
                        else
                        {
                            // What is it? No String, no Integer, Date, no 1 or 2 dimension Array
                            // EXCEPTION WIP: declaration var index = 0
                        }
                    }

                    return index;
                };
            }

            // Method getDefaultValue
            if (typeof this.getDefaultValue != "function")
            {
                ParameterContactWizard.prototype.getDefaultValue = function() 
                {
                        return this._defaultValue;
                };
            }

            // Method getCheckValue
            if (typeof this.getCheckValue != "function")
            {
                ParameterContactWizard.prototype.getCheckValue = function() 
                {
                    var value = this.getValue();

                    if (typeof(value) === "undefined")
                    {
                        value = this.getDefaultValue();
                    }
                        
                    return value;
                };
            }

            // Method fillValue
            if (typeof this.fillValue != "function")
            {
                ParameterContactWizard.prototype.fillValue = function(cs_code, translate) 
                {
                    // PENDING originator_group & responsible_group ...
                    var element_options = "";
                    var paramId         = this._id;

                    // EXCEPTION PROCEDURE: responsible_group & originator_group
                    if (paramId === stringResponsibleGroup)  // Responsible group
                    {
                        var cs_info = this._details;

                        this._type = cs_info.assurance.operator.operator_groups; // Fill responsible_group
                    } 
                    else if (paramId === stringOriginatorGroup) // Originator group
                    {
                        var arrayParameters = [];

                        var urlCS = "/api/groups/originator/customer_service/<code>/";
                        urlCS = urlCS.replace('<code>', cs_code);
                        $.ajax({
                            url : urlCS,
                            type: "GET",
                            async: false,
                            contentType : 'application/json',
                            success : function(parameters) {
                                arrayParameters = parameters;
                            }
                        });

                        this._type = arrayParameters; // Fill originator_group
                        // Fix default value for originator group
                        this._defaultValue = arrayParameters[0];
                        this._value = this._defaultValue;

                        var arrayParameters2 = [];

                        var urlCS2 = "/api/groups/originator/customer_service/<code>/all";
                        urlCS2 = urlCS2.replace('<code>', cs_code);
                        $.ajax({
                            url : urlCS2,
                            type: "GET",
                            async: false,
                            contentType : 'application/json',
                            success : function(parameters) {
                                arrayParameters2 = parameters;
                            }
                        });

                        this._typeExtended = arrayParameters2; // Fill originator_group

                        for (i=0; i<this._typeExtended.length; i++) {
                                var newObject = {};
                                newObject['key']  = this._typeExtended[i];
                                newObject['name'] = this._typeExtended[i];

                                this._typeExtended[i] = newObject;
                        }
                    }
                };
            }

            // Method convertType
            if (typeof this.convertType != "function")
            {
                ParameterContactWizard.prototype.convertType = function() 
                {
                    if (this._type instanceof Array) // Array
                    {
                        var element = this._type[0];

                        if ((element instanceof Array) && (element.length == 2)) // 2 dimension Array 
                        {
                            for (i=0; i<this._type.length; i++)
                            {
                                var newObject = {};
                                newObject['key']  = this._type[i][0];
                                newObject['name'] = $filter("i18n")(this._type[i][1]);

                                this._type[i] = newObject;
                            }
                        }
                        else if (typeof(element) === "string") // 1 dimension Array
                        {
                            for (i=0; i<this._type.length; i++)
                            {
                                var newObject = {};
                                newObject['key']  = this._type[i];
                                newObject['name'] = $filter("i18n")(this._type[i]);

                                this._type[i] = newObject;
                            }
                        }
                        else
                        {
                            // What is it? No String, no Integer, no Date, no 1 or 2 dimension Array
                            // EXCEPTION WIP
                        }
                    }
                };
            }

            // Method getReference
            if (typeof this.getReference != "function")
            {
                ParameterContactWizard.prototype.getReference = function() 
                {
                    return this._reference;
                };
            }

            // Method setReference
            if (typeof this.setReference != "function")
            {
                ParameterContactWizard.prototype.setReference = function(reference) 
                {
                    this._reference = reference;
                };
            }

            // Method setApply
            if (typeof this.setApply != "function")
            {
                ParameterContactWizard.prototype.setApply = function(apply) 
                {
                    this._apply = apply;
                    this.setVisible(apply);
                };
            }

            // Method isApplied
            if (typeof this.isApplied != "function")
            {
                ParameterContactWizard.prototype.isApplied = function() 
                {
                    return this._apply;
                };
            }

            // Method setDefaultValue
            if (typeof this.setDefaultValue != "function")
            {
                ParameterContactWizard.prototype.setDefaultValue = function(defaultValue) 
                {
                     if (typeof(defaultValue) != "undefined")
                     {
                        this._defaultValue = defaultValue;
                     }
                     else
                     {
                        if (typeof(this._type) === "string") // String (value)
                        {
                            this._defaultValue = this._type;
                        }
                        else if (typeof(this._type) === "number") // Integer (value)
                        {
                            this._defaultValue = this._type;
                        }
                        else if (this._type instanceof Date) // Date
                        {
                            this._defaultValue = "";
                        }
                        else if (this._type instanceof Array) // Array
                        {
                            var element = this._type[0];

                            if ((element instanceof Array) && (element.length == 2)) // 2 dimension Array 
                            {
                                this._defaultValue = element[0];
                            }
                            else if (typeof(element) === "string") // 1 dimension Array
                            {
                                this._defaultValue = element;
                            }
                            else
                            {
                                // What is it? No String, no Integer, no Date, no 1 or 2 dimension Array
                                // EXCEPTION WIP responsible_group & originator_group set undefined in called constructor
                            }
                        }
                        else
                        {
                            // What is it? No String, No Date, No Array 
                            // EXCEPTION WIP
                        }    
                    }

                    // AngularJS
                    if (typeof(this._defaultValue) != "undefined")
                    {
                        this._value = this._defaultValue;
                    }
                    else if (this._type.length > 0)
                    {
                        this._value = this._type[0]['key'];
                    }
                };
            }


            // Method setWidget
            if (typeof this.setWidget != "function")
            {
                ParameterContactWizard.prototype.setWidget = function() 
                {
                    if (this.isArray())
                    {
                        this._widget = "array";
                    }
                    else if (this.isInteger())
                    {
                        this._widget = "integer";
                    }
                    else if (this.isDate())
                    {
                        this._widget = "date";
                    }
                    else if (this.isTime())
                    {
                        this._widget = "time";
                    }
                    else if (this.isString())
                    {
                        this._widget = "text";
                    }
                    else
                    {
                        this._widget = "text";
                    }
                };
            }

            // Method setMandatory
            if (typeof this.setMandatory != "function")
            {
                ParameterContactWizard.prototype.setMandatory = function(mandatory) 
                {
                    this._mandatory = mandatory;
                };
            }

            // Constructor

            ////////////////
            // Attributes //
            ////////////////
            this._id            = data.id;
            this._name          = data.name;
            this._mandatory     = data.mandatory; // WIP Clone object?
            this._enabled       = data.enabled;
            this._editable      = data.editable;
            this._type          = data.type; // WIP Clone the object
            this._defaultValue  = data.defaultValue;
            this._defaultPValue = data.defaultValue;
            this._order         = data.order;
            this._reference     = undefined;
            this._visible       = data.visible;
            this._objReferenced = data.objReferenced;
            this._apply         = true;
            this._details       = data.details;

            // For mandatory dependence WIP
            // This parameter is mandatory if the field "_mandatoryField" has the value "_mandatoryValueField"
            this._mandatoryField      = undefined;
            this._mandatoryValueField = undefined;

            // EXCEPTION for responsible_group & originator_group
            if ((this._id === stringResponsibleGroup) || (this._id == stringOriginatorGroup)) 
            {
                // The "type" is String => change to Array
                this._type = [];
            }

            // WIP: Not insert blank
            if (typeof(defaultValue) != "undefined")
            {
                this.setDefaultValue(defaultValue);
            }
            // WIP End
            this.setWidget();
        }

        function ContactWizard(newContact)
        {
            /////////////
            // Methods //
            /////////////

            // Method addParameter
            if (typeof this.addParameter != "function")
            {
                ContactWizard.prototype.addParameter = function(parameter) 
                {
                    var parameterOrder = parameter.getOrder();

                    var lastIndex = this._parameters.length;
                    if (lastIndex > 0) // Not empty array
                    {
                        var lastOrder = this._parameters[lastIndex-1].getOrder();

                        if (lastOrder <= parameterOrder) // Last parameter
                        {
                            this._parameters.push(parameter);
                        }
                        else
                        {
                            for (var index = lastIndex-1 ; index >=0 ; index --)
                            {
                                var indexOrder = this._parameters[index].getOrder(); 

                                if (indexOrder <= parameterOrder) // Insert parameter
                                {
                                    this._parameters.splice(index+1, 0, parameter);

                                    return; // Exit loop
                                }
                            }

                            this._parameters.unshift(parameter); // First parameter
                        }
                    }
                    else // Empty array
                    {
                        this._parameters.push(parameter); // Last parameter
                    }
                };
            }

            // Method setScenario
            if (typeof this.setScenario != "function")
            {
                ContactWizard.prototype.setScenario = function(scenario) 
                {
                    this._scenario = scenario;
                };
            }

            // Method setWizard
            if (typeof this.setWizard != "function")
            {
                ContactWizard.prototype.setWizard = function(wizard) 
                {
                    this._wizard = wizard;
                };
            }

            // Method getHTMLContainer
            if (typeof this.getHTMLContainer != "function")
            {
                ContactWizard.prototype.getHTMLContainer = function() 
                {
                    return this._intNewW;
                };
            }

            // Method getParamsByScenario
            if (typeof this.getParamsByScenario != "function")
            {
                ContactWizard.prototype.getParamsByScenario = function()
                {
                    return this._params_by_scenario;
                };
            }

            // Method fillAreaContact
            if (typeof this.fillAreaContact != "function")
            {
                ContactWizard.prototype.fillAreaContact = function(CSservice)
                {
                    // For each parameter => if Array => fill field
                    for (var index=0; index<this._parameters.length; index++)
                    {
                        var param = this._parameters[index];

                        if (param.isArray()) // Array
                        {
                            param.fillValue(CSservice);
                            param.convertType();
                        }
                    }
                };
            }

            // Method clear
            if (typeof this.clear != "function")
            {
                ContactWizard.prototype.clear = function()
                {
                    // For each parameter => clear value
                    for (var index=0; index<this._parameters.length; index++)
                    {
                        var param = this._parameters[index];

                        if (param.isApplied()) // Check for M2MJasper contactType 'change' event. Called from OrderContactNew
                        {
                            var paramReference = param.getReference();
                            var defaultValue = param.getDefaultValue();

                            if (param.isString() || param.isDate() || param.isTime()) // String, Date or Time
                            {
                                if (typeof(defaultValue) != "undefined") 
                                {
                                    paramReference.val(defaultValue);
                                }
                                else
                                {
                                    paramReference.val(''); // Not default value
                                }
                            }
                            else if (param.isInteger()) // Integer
                            {
                                if (typeof(defaultValue) != "undefined") 
                                {
                                    paramReference.val(defaultValue);
                                }
                                else
                                {
                                    paramReference.val(''); // Not default value
                                }
                            }
                            else if (param.isArray()) // Array
                            {
                                var i = param.getIndexDefaultValue();

                                paramReference.udo_selectIndex(i);
                            }
                            else
                            {
                                // What is it? No String, No Date, No Array
                                // EXCEPTION WIP
                            }
                        }
                    }

                    if (this._attachFile) // M2MJasper & GlobalSIM don't attach file
                    {
                        this._attachDocReference.val('');
                    }
                };
            }

            // Method isMandatory
            if (typeof this.isMandatory != "function")
            {
                ContactWizard.prototype.isMandatory = function(id)
                {
                    var res = false;

                    // Search parameter => isMandatory
                    for (var index=0; index<this._parameters.length; index++)
                    {
                        var param = this._parameters[index];

                        if (param.getId() === id)
                        {
                            return param.isMandatory(); // Exit function
                        }
                    }

                    return res;
                };
            }

            // Method getDefaultValue
            if (typeof this.getDefaultValue != "function")
            {
                ContactWizard.prototype.getDefaultValue = function(id)
                {
                    var defaultValue = undefined;

                    // Search parameter => getDefaultValue or getIndexDefaultValue
                    for (var index=0; index<this._parameters.length; index++)
                    {
                        var param = this._parameters[index];

                        if (param.getId() === id)
                        {
                            if (param.isArray()) // Array
                            {
                                defaultValue = param.getIndexDefaultValue();
                            }
                            else if (param.isInteger()) // Integer
                            {
                                defaultValue = parserInt( param.getDefaultValue() );
                            }
                            else // String or Date or ... EXCEPTION WIP
                            {
                                defaultValue = param.getDefaultValue();
                            }
                        }
                    }

                    return defaultValue;
                };
            }


            // Method getParam
            if (typeof this.getParam != "function")
            {
                ContactWizard.prototype.getParam = function(id)
                {
                    var param = undefined;

                    // Search parameter => return parameter
                    for (var index=0; index<this._parameters.length; index++)
                    {
                        var param = this._parameters[index];

                        if (param.getId() === id) { break; } // Exit loop
                    }

                    return param;
                };
            }

            // Method getDeatils
            if (typeof this.getDetails != "function")
            {
                ContactWizard.prototype.getDetails = function(id)
                {
                    return (this._details);
                };
            }

            // Method checkMandatory
            if (typeof this.checkMandatory != "function")
            {
                ContactWizard.prototype.checkMandatory = function()
                {
                    // For each parameter => check mandatory
                    for (var index=0; index<this._parameters.length; index++)
                    {
                        var param = this._parameters[index];

                        if (param.isApplied() && param.isMandatory() && param.isEmpty()) // Don't save the ticket !!!!!
                        {
                            return param.getName(); // Exit function
                        }
                    }

                    var field = '';
                    return field; // ALL fields OK. Don't exit before (loop)
                };
            }

            // NEW FOR TESTING FE
            // Method checkMandatories
            if (typeof this.checkMandatories != "function")
            {
                ContactWizard.prototype.checkMandatories = function()
                {
                    var mandatories = new Array();

                    // For each parameter => check mandatory
                    for (var index=0; index<this._parameters.length; index++)
                    {
                        var param = this._parameters[index];

                        if (param.isApplied() && param.isMandatory() && param.isEmpty()) // Don't save the ticket !!!!!
                        {
                            mandatories.push(param.getId()); // Exit function
                        }
                    }

                    return mandatories;
                };
            }
            //

            // Method checkParamsApply
            if (typeof this.checkParamsApply != "function")
            {
                ContactWizard.prototype.checkParamsApply = function()
                {
                    // Check dependencies and clear the fields that do not apply
                    var self = this;

                    // For each parameter => check dependence
                    $.each(this._parameters, function(index, param) {
                        //var param      = this._parameters[index];
                        var referenced = param.getObjReferenced();

                        for (var nameReferenced in referenced)
                        {
                            if (typeof(nameReferenced) != "undefined")
                            {
                                var paramReferenced = self.getParam(nameReferenced);

                                if (typeof(paramReferenced) != "undefined")
                                {
                                    if ( (paramReferenced.getCheckValue() != referenced[nameReferenced]) ||
                                         (!paramReferenced.isApplied()) )
                                    {
                                        param.setApply(false);
                                    }
                                }
                            }
                        }
                    });

                };
            }


            // Method checkMandatoryDependencies
            if (typeof this.checkMandatoryDependencies != "function")
            {
                ContactWizard.prototype.checkMandatoryDependencies = function()
                {
                    // Check dependencies and clear the fields that do not apply
                    var self = this;

                    // For each parameter => check dependence
                    $.each(this._parameters, function(index, param) {
                        //var param      = this._parameters[index];
                        var referenced = param.getObjReferenced();

                        for (var nameReferenced in referenced)
                        {
                            if (typeof(nameReferenced) != "undefined")
                            {
                                var paramReferenced = self.getParam(nameReferenced);

                                if (typeof(paramReferenced) != "undefined")
                                {
                                    var mandatory = ( paramReferenced.isApplied() && 
                                                      (paramReferenced.getCheckValue() === referenced[nameReferenced]) );
                                    
                                    param.setMandatory(mandatory);
                                }
                            }
                        }
                    });

                };
            }


            // Method saveNewContact
            if (typeof this.saveNewContact != "function")
            {
                ContactWizard.prototype.saveNewContact = function(newContact)
                {
                    var fieldNOK = '';

                    fieldNOK = this.checkMandatory();

                    if (fieldNOK === '') // ALL fields OK
                    {
                        // For each parameter => fill value
                        for (var index=0; index<this._parameters.length; index++)
                        {
                            var param = this._parameters[index];

                            if ( param.isApplied() ) // If applied => save the param
                            {
                                var id    = param.getId();
                                var value = param.getValue();

                                // US UDO-3079: For select fields: if combo and empty => don't save
                                if ( !( param.isArray() && param.isEmpty() ) )
                                {
                                    if (param.isDate() || param.isTime()) // Date field 
                                    {
                                        if (value != "") // Not blank => send (EXCEPTION)
                                        {
                                            newContact[id] = value;
                                        }
                                    }
                                    else // Not Date field
                                    {
                                        newContact[id] = value;
                                    }
                                }
                            }
                        }
                    }
                };
            }

            // Method isClear
            if (typeof this.isClear != "function")
            {
                ContactWizard.prototype.isClear = function()
                {
                    var check = true;


                    // For each parameter => check default value
                    for (var index=0; index<this._parameters.length; index++)
                    {
                        var param = this._parameters[index];

                        if (param.isApplied()) // Check for M2MJasper contactType 'change' event. Called from OrderContactNew
                        {
                            var defaultValue = param.getDefaultValue();
                            var value = param.getValue();

                            check = check && (value === defaultValue);

                            if (check === false)
                            {
                                break; // False => exit loop & function
                            }
                        }
                    }

                    return check;
                };
            }

            // Method setParameterValue
            if (typeof this.setParameterValue != "function")
            {
                ContactWizard.prototype.setParameterValue = function(name, value)
                {
                    $.each(this._parameters, function(index, value) {
                        if (this.getId() === name)
                        {
                            this.setDefaultValue(value);
                            return false; // Break loop
                        }
                    });
                };
            }

            // Method setParameterDisplay
            if (typeof this.setParameterDisplay != "function")
            {
                ContactWizard.prototype.setParameterDisplay = function(name, visible)
                {
                    $.each(this._parameters, function(index, value) {
                        if (this.getId() === name)
                        {
                            this._visible = visible;
                            return false; // Break loop
                        }
                    });
                };
            }

            // Method getHeightWizard
            if (typeof this.getHeightWizard != "function")
            {
                ContactWizard.prototype.getHeightWizard = function()
                {
                    if (typeof(this._heightWizard) === "undefined")
                    {
                        var class_newContactBg = ".newContactBg";

                        this._heightWizard = $(class_newContactBg).height();
                    }

                    return this._heightWizard;
                };
            }

            // Method getParameters
            if (typeof this.getParameters != "function")
            {
                ContactWizard.prototype.getParameters = function()
                {
                    return this._parameters;
                };
            }

            // Method applyAttachFile
            if (typeof this.applyAttachFile != "function")
            {
                ContactWizard.prototype.applyAttachFile = function(apply)
                {
                    this._attachFile = apply;
                };
            }

            // Method setType
            if (typeof this.setType != "function")
            {
                ContactWizard.prototype.setType = function()
                {
                    var type  = "type";
                    var param = this.getParam(type); 
                    if (typeof(param) != "undefined")
                    {
                        if ((param._type instanceof Array) && (param._type.length === 1)) // Array and only 1 value
                        { 
                            if (typeof(param._type[0]) === "string") // Array 1 dimension
                            {
                                param.setDefaultValue(param._type[0]); // set default value by api value (Claim, Order, Query, ...)
                            }
                            else // Array 2 dimension
                            {
                                param.setDefaultValue(param._type[0][0]); // set default value by api value (Claim, Order, Query, ...)
                            }
                        }
                        else
                        {
                            param.setDefaultValue(this._type);    // set default value by value constructor (Claim or Order)
                        }
                    }
                };
            }

            // Method api2model
            if (typeof this.api2model != "function")
            {
                ContactWizard.prototype.api2model = function()
                {
                    this._dataValues = [];
                    this._dataParams = {};

                    for (var index=0; index<this._parameters.length; index++) 
                    {
                        this._dataParams[this._parameters[index]._id] = this._parameters[index];

                        var data =  {
                                        _value:        this._parameters[index]._value,
                                        _defaultValue: this._parameters[index]._defaultValue,
                                        _id:           this._parameters[index]._id,
                                        _name:         this._parameters[index]._name,
                                        _mandatory:    this._parameters[index]._mandatory,
                                        _widget:       this._parameters[index]._widget,
                                        _type:         this._parameters[index]._type,
                                        _disabled:     !this._parameters[index]._enabled
                                    };

                        switch (data._widget)
                        {
                            case "array":
                                data._selectOption = true;

                                if ( (data._mandatory) && (data._type.length === 1) ) // Mandatory & 1 element only => selected
                                {
                                    data._selectOption = false;
                                }
                                else if (typeof(data._defaultValue) != "undefined") // Default value => selected
                                {
                                    data._selectOption = false;
                                    data._value = data._defaultValue;
                                }
                            
                                break;
                            case "date":
                                data._openCalendar = false;
                                break;
                            case "time":
                                data._openCalendar = false;
                                break;
                            default:
                                break;
                        }
                        
                        this._dataValues.push(data);
                        this._dataParams[this._parameters[index]._id]._ref = this._dataValues.length - 1;
                    }
                };
            }

            // If newContact is undefined => inherit methods from Contact Wizard, not constructor
            if (typeof(newContact) != "undefined")
            {
                // Constructor

                var CSservice = newContact._CSservice;
                var scenario  = newContact._scenario;
                var type      = "Claim";
                var data      = {};

                ////////////////
                // Attributes //
                ////////////////
                this._parameters         = new Array();
                this._wizard             = undefined;
                this._newContactBg       = undefined;
                this._attachDocReference = undefined;
                this._params_by_scenario = newContact._parameters;
                this._heightWizard       = undefined;
                this._attachFile         = true;
                this._type               = type;
                this._details            = newContact._details;

                var params_by_scenario = this._params_by_scenario;

                for (var i=0; i<params_by_scenario.length; i++)
                {
                    data.name = params_by_scenario[i].name;

                    // Find attributes for this scenario
                    data.mandatory     = false;
                    data.enabled       = true;
                    data.editable      = true;
                    data.defaultValue  = undefined;
                    data.visible       = true;
                    data.objReferenced = undefined;

                    for (var j=0; j<params_by_scenario[i].scenarios.length; j++)
                    {
                        if (scenario === params_by_scenario[i].scenarios[j].code)
                        {
                            data.defaultValue = params_by_scenario[i].scenarios[j]['default'];

                            // Visible
                            if (typeof(params_by_scenario[i].scenarios[j].wizard_visible) != "undefined")
                            {
                                data.visible = params_by_scenario[i].scenarios[j].wizard_visible;
                            }

                            // Enabled
                            if (typeof(params_by_scenario[i].scenarios[j].wizard_enabled) == "boolean") 
                            {
                                data.enabled = params_by_scenario[i].scenarios[j].wizard_enabled;
                            }

                            // Editable
                            if (typeof(params_by_scenario[i].scenarios[j].editable) == "boolean") 
                            {
                                data.editable = params_by_scenario[i].scenarios[j].editable;
                            }

                            // Mandatory
                            if (typeof(params_by_scenario[i].scenarios[j].mandatory) == "boolean")
                            {
                                data.mandatory = params_by_scenario[i].scenarios[j].mandatory;
                            }
                            else if (params_by_scenario[i].scenarios[j].mandatory instanceof Object)
                            {
                                // Depends on another field and value
                                //mandatory     = false; //undefined;
                                data.mandatory     = true; //WIP Testing New UI;
                                data.objReferenced = params_by_scenario[i].scenarios[j].mandatory;
                            }
                            else
                            {
                                // What is it? No boolean, No object ("Claim", "Order" or "Query")
                                // EXCEPTION
                            }

                            break; // Find & exit loop
                        }
                    }

                    // Values: String" (Input Field), Date (Input Field with Date format), Array (ComboBox) 
                    if (params_by_scenario[i].type === "String") // String
                    {
                        data.type = "";
                    }
                    else if (params_by_scenario[i].type === "Integer") // Integer
                    {
                        data.type = 0;
                    }
                    else if (params_by_scenario[i].type === "Date") // Date
                    {
                        data.type = new Date(0,0,0,0,0,0) // Date has fixed 00:00:00 time
                    }
                    else if (params_by_scenario[i].type === "Time") // Time
                    {
                        data.type = new Date(1,1,1,1,1,1); // Time with some hour
                    }
                    else // Array
                    {
                        data.type = params_by_scenario[i].type; 
                    }

                    // Id, Name and Order
                    data.id    = params_by_scenario[i].name;
                    data.name  = params_by_scenario[i].short_description;
                    data.order = params_by_scenario[i].wizard_order; 

                    // Details
                    data.details = newContact._details;

                    // Add parameter
                    var parameter = new ParameterContactWizard(data);
                    this.addParameter(parameter);
                }

                // Set type
                this.setType();
            
                // Check params apply => don't show and not save the parameters that don't apply
                this.checkParamsApply();

                // Check mandatory dependencies
                //this.checkMandatoryDependencies(); // WIP Testing

                // Fill area Contact
                this.fillAreaContact(CSservice);

                // Convert parameter to model
                this.api2model();
            }
        }

        // Create contact
        var contact = new ContactWizard(newObject);

        return { 
                 dataValues: contact._dataValues, 
                 dataParams: contact._dataParams, 
                 details:    contact._details 
               };
    }

    // ------------------------------
    // Load functions implementation
    // ------------------------------
    var _loadUserData = function() {
        var operations = [];
        if (typeof(_userData) === 'undefined') {
            // Chain calls to make get first user data and then permissions
            var getUserData = $http.get('/api/customer/userdata', {cache: false})
                                   .then(function(response) {
                                        _userData = response.data;
                                   });
            getUserData = getUserData.then(function() {
                return $http.get('/permissions', {cache: false}).then(
                    function(response) {
                        _userData.permissions = {};
                        _userData.permissions.data = response.data;
                        _userData.permissions.check = function(permission) {
                            return $.inArray(permission, 
                                        _userData.permissions.data) !== -1 ||
                                   $.inArray('frontend.' + permission,
                                        _userData.permissions.data) !== -1;
                        }
                        _userData.permissions.check_wos = function(permission) {
                            var wos_matched = false;
                            for (var i = 0; !wos_matched && i < _userData.permissions.data.length; i++) {
                                var item_permission = _userData.permissions.data[i];
                                wos_matched = item_permission.indexOf('frontend.' + permission) > -1
                            }
                            return wos_matched;

                        }
                    }
                );
            });
            operations = [getUserData];
        }
        return $q.all(operations);
    }

    var _loadCustomerServices = function() {
        var operations = [];
        if (typeof(_customerServices) === 'undefined') {
            var getCustomerServices =
                $http.get('/api/tt/customer_service/?full_entry=true', {cache: false})
                     .then(function(response) {
                         _customerServices = response.data;
                     }
                );
            operations = [getCustomerServices];
        }
        return $q.all(operations);
    };

    var _loadRequesterCustomerServices = function() {
        var operations = [];
        if (typeof(_requesterCustomerServices) === 'undefined') {
            var getRequesterCustomerServices =
                $http.get('/api/tt/customer_service/?full_entry=true&requester=true', {cache: false})
                     .then(function(response) {
                         _requesterCustomerServices = response.data;
                     }
                );
            operations = [getRequesterCustomerServices];
        }
        return $q.all(operations);
    };

    var _loadScenario = function(cs) {
        var operations = [];
        if (typeof(_scenarios[cs]) === 'undefined') {
            var getScenario = $http
                .get('/api/tt/scenarios/' + cs, {cache: false})
                .then(function(response) {
                    _scenarios[cs] = angular.fromJson(response.data);
                });
            operations = [getScenario];
        }
        return $q.all(operations);
    };

    
    var _loadParameters = function(cs) {
        var operations = [];
        if (typeof(_parameters[cs]) === 'undefined') {
            // Uses scenario and details promise (caching it if needed)
            var getScenario   = _loadScenario(cs);
            var getDetails    = _loadCustomerServiceDetails(cs);
            var getParameters = getScenario.then(function() {
                var url = '/api/tt/parameters/' + _scenarios[cs]+'?rows=100';
                return $http.get(url, {cache: false})
                            .then(function(response) {
                                // Parameters from API
                                _parameters[cs] = {
                                                    api: response.data, // from API
                                                    model: {}           // for MODEL
                                                  };
                                

                                // Parameters for MODEL
                                var newObject = {
                                                    _CSservice:  cs,
                                                    _scenario:   _scenarios[cs],
                                                    _parameters: _parameters[cs].api,
                                                    _details:    _customerServiceDetails[cs]
                                                };
                                
                                _parameters[cs].model = api2model(newObject);
                            });
            });
            operations = [getParameters];
        }
        return $q.all(operations);
    };

    var _loadCustomerServiceDetails = function(cs) {
        var operations = [];
        if (typeof(_customerServiceDetails[cs]) === 'undefined') {
            var url = '/api/catalogue/service/customer/' + cs;
            var getCS = $http.get(url, {cache: false}).then(function(response) {
                _customerServiceDetails[cs] = response.data;
            });
            operations = [getCS];
        }
        return $q.all(operations);
    };

    var _loadSymptoms = function(cs) {
        var url = '/api/catalogue/service/customer/' + cs + '/symptoms/';
        return $http.get(url, {cache: false}).then(function(response) {
            _symptoms[cs] = response.data;
        });
    };
    
    var _loadDelayReasons = function(lan) {
        var operations = [];
        if (typeof(_delayReasons[lan]) === 'undefined') {
            var getDelayReasons =
                $http.get('/api/templates/?tags=delayed_reason&lang=' + lan, {cache: false})
                     .then(function(response) {
                         _delayReasons[lan] = response.data;
                     }
                );
            operations = [getDelayReasons];
        }
        return $q.all(operations);
    };

    return {
        /**
         * @ngdoc method
         * @methodOf udoModule.service:dataProvider
         * @name udoModule.service:dataProvider#loadUserData
         * @description Returns a promise of loading user data, when it is
         * performed, it can be accessed via
         * {@link udoModule.service:dataProvider#userData userData} function.
         */
        loadUserData: _loadUserData,

        /**
         * @ngdoc method
         * @methodOf udoModule.service:dataProvider
         * @name udoModule.service:dataProvider#loadCustomerServices
         * @description Returns a promise of loading customer services,
         * when it is performed, it can be accessed via
         * {@link udoModule.service:dataProvider#customerServices customerServices}
         * function.
         */
        loadCustomerServices: _loadCustomerServices,

        /**
         * @ngdoc method
         * @methodOf udoModule.service:dataProvider
         * @name udoModule.service:dataProvider#loadRequesterCustomerServices
         * @description Returns a promise of loading customer services,
         * when it is performed, it can be accessed via
         * {@link udoModule.service:dataProvider#requesterCustomerServices requesterCustomerServices}
         * function.
         */
        loadRequesterCustomerServices: _loadRequesterCustomerServices,

        /**
         * @ngdoc method
         * @methodOf udoModule.service:dataProvider
         * @name udoModule.service:dataProvider#loadScenario
         * @param {string} cs Customer service code.
         * @description Returns a promise of loading scenario,
         * when it is performed, it can be accessed via
         * {@link udoModule.service:dataProvider#scenario scenario}
         * function.
         */
        loadScenario: _loadScenario,

        /**
         * @ngdoc method
         * @methodOf udoModule.service:dataProvider
         * @name udoModule.service:dataProvider#loadParameters
         * @param {string} cs Customer service code.
         * @description Returns a promise of loading parameters,
         * when it is performed, it can be accessed via
         * {@link udoModule.service:dataProvider#parameters parameters}
         * function.
         */
        loadParameters: _loadParameters,

        /**
         * @ngdoc method
         * @methodOf udoModule.service:dataProvider
         * @name udoModule.service:dataProvider#loadCustomerServiceDetails
         * @param {string} cs Customer service code.
         * @description Returns a promise of loading customer service details,
         * when it is performed, it can be accessed via
         * {@link udoModule.service:dataProvider#customerServiceDetails customerServiceDetails}
         * function.
         */
        loadCustomerServiceDetails: _loadCustomerServiceDetails,

        /**
         * @ngdoc method
         * @methodOf udoModule.service:dataProvider
         * @name udoModule.service:dataProvider#loadSymptoms
         * @param {string} cs Customer service code.
         * @description Returns a promise of loading symptoms,
         * when it is performed, it can be accessed via
         * {@link udoModule.service:dataProvider#symptoms symptoms}
         * function.
         */
        loadSymptoms: _loadSymptoms,

       /**
         * @ngdoc method
         * @methodOf udoModule.service:dataProvider
         * @name udoModule.service:dataProvider#userData
         * @description Returns the user data if it is available, otherwise
         * returns undefined. The user data includes permissions information and an utility
         * to check if the user has a specific permission. Example:
         * <pre>
         * dataProvider.loadUserData().then(function() {
         *     userData = dataProvider.userData();
         *     userData.permissions.check('can_access_assurance');
         *     userData.premissions.check('frontend.can_create_udott_contacts');
         * });
         * </pre>
         */
        userData: function() {
            return _userData;
        },
        /**
         * @ngdoc method
         * @methodOf udoModule.service:dataProvider
         * @name udoModule.service:dataProvider#customerServices
         * @description Returns the customer services data if it is available,
         * otherwise returns undefined.
         */
        customerServices: function() {
            return _customerServices;
        },
        /**
         * @ngdoc method
         * @methodOf udoModule.service:dataProvider
         * @name udoModule.service:dataProvider#requesterCustomerServices
         * @description Returns the customer services data if it is available,
         * otherwise returns undefined.
         */
        requesterCustomerServices: function() {
            return _requesterCustomerServices;
        },
        /**
         * @ngdoc method
         * @methodOf udoModule.service:dataProvider
         * @name udoModule.service:dataProvider#scenario
         * @param {string} cs Customer service code.
         * @description Returns the scenario for a cs if it is available,
         * otherwise returns undefined.
         */
        scenario: function(cs) {
            return _scenarios[cs];
        },
        /**
         * @ngdoc method
         * @methodOf udoModule.service:dataProvider
         * @name udoModule.service:dataProvider#parameters
         * @param {string} cs Customer service code.
         * @description Returns the parameters for a cs if it is available,
         * otherwise returns undefined.
         */
        parameters: function(cs) {
            return _parameters[cs];
        },
        /**
         * @ngdoc method
         * @methodOf udoModule.service:dataProvider
         * @name udoModule.service:dataProvider.customerServiceDetails
         * @param {string} cs Customer service code.
         * @description Returns details from catalogue for a cs if it is available,
         * otherwise returns undefined.
         */
        customerServiceDetails: function(cs) {
            return _customerServiceDetails[cs];
        },
        /**
         * @ngdoc method
         * @methodOf udoModule.service:dataProvider
         * @name udoModule.service:dataProvider.symptoms
         * @param {string} cs Customer service code.
         * @description Returns symptoms from catalogue for a cs if it is available,
         * otherwise returns undefined. It is important to not that **symptoms**
         * are never cached.
         */
        symptoms: function(cs) {
            var symptoms = _symptoms[cs];
            _symptoms[cs] = undefined;
            return symptoms;
        },
        loadDelayReasons: function(lan) {
                return _loadDelayReasons(lan);
        },
        delayReasons: function(lan) {
                return _delayReasons[lan];
        }     
    }
}]);
