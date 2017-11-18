
 /**
 * @ngdoc service
 * @name udoModule.service.udoAPI
 * @description UDo service to perform request to API
 */
udoModule.service('udoAPI', function udoAPI($http, $q, errors) {
    /*
     * Performs a requests and controls errors
     */
    var forceReload = false;
    var _request = function(method) {
        method = method.toLowerCase();
        arguments = Array.prototype.slice.call(arguments, 1); // Remove method from arguments
        return $http[method].apply(null, arguments)
                   .success(function(response) {
                        return response.data;
                    })
                    .error(function(response) {
                        if(response.code === 403) {
                            errors.forbidden();
                        }
                        else {
                            // TODO: handle other errors
                        }
                    });
    };
    var _get = function() {
        arguments = Array.prototype.slice.apply(arguments);
        arguments.splice(0, 0, 'get');
        return _request.apply(null, arguments);
    };
    var _post = function() {
        arguments = Array.prototype.slice.apply(arguments);
        arguments.splice(0, 0, 'post');
        return _request.apply(null, arguments);
    };
    var _put = function() {
        arguments = Array.prototype.slice.apply(arguments);
        arguments.splice(0, 0, 'put');
        return _request.apply(null, arguments);
    };

    return {
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#request
         * @param {string} method
         * @description
         */
        request: _request,
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#get
         * @description
         */
        get: _get,
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#post
         * @description
         */
        post: _post,
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#put
         * @description
         */
        put: _put,
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getScenarioyByCs
         * @param {string} CSservice
         * @description
         */
        getScenarioByCS: function(CSservice) {
            var URL = "/api/tt/scenarios/";
            return _get(URL + CSservice, {cache: !forceReload}).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getCSfromCatalogue
         * @param {string} CSservice
         * @description
         */
        getCSfromCatalogue: function(CSservice) {
            var URL = "/api/catalogue/service/customer/";
            if (typeof CSservice !== "undefined") {
                URL = URL + CSservice;
            }
            return _get(URL, {cache: !forceReload}).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getParamsScenario
         * @param {string} scenario
         * @description
         */
        getParamsScenario: function(scenario) {
            var URL = "/api/tt/parameters/";
            return _get(URL + scenario + '?rows=100', {cache: !forceReload}).then(function (response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getCSsfromUser
         * @description
         */
        getCSsfromUser: function() {
            var URL = "/api/tt/customer_service/";
            return _get(URL, {cache: !forceReload}).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getCSsfromWO
         * @description
         */
        getCSsfromWO: function() {
            var URL = "/api/tt/workorders/customerservices";
            return _get(URL, {cache: !forceReload}).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getAffectedResource
         * @param {string} affected
         * @description
         */
        getAffectedResource: function(affected) {
            var URL = "/api/catalogue/resource/" + affected + "/instances/";
            return _get(URL, {cache: !forceReload}).then(function (response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getSymptoms
         * @param {string} CSservice
         * @description
         */
        getSymptoms: function(CSservice) {
            var URL = "/api/catalogue/service/customer/" + CSservice + "/symptoms/";
            return _get(URL, {cache: !forceReload}).then(function (response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getProblemTypes
         * @description
         */
        getProblemTypes: function() {
            var URL = "/api/tt/problemtypes/?rows=100";
            return _get(URL, {cache: !forceReload}).then(function (response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getTemplates
         * @param {string} CSservice
         * @param {string} currentLanguage
         * @description
         */
        getTemplates: function (CSservice, currentLanguage) {
            var URL = '/api/templates/?tags='+CSservice+'&lang=' + currentLanguage;
            return _get(URL, {cache: !forceReload}).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getTextFreeTemplate
         * @param {string} currentLanguage
         * @description
         */
        getTextFreeTemplate: function (currentLanguage) {
            var URL = '/api/templates/?code=free_text_template&lang=' + currentLanguage;
            return _get(URL, {cache: !forceReload}).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getTicketDetail
         * @param {string} idTicket
         * @description
         */
        getTicketDetail: function(idTicket) {
            var URL = 'api/tt/contacts/' + idTicket + "?detailed=true&next=actions";
            return _get(URL).then(function (response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getIncidenceDetail
         * @param {string} idIncidence
         * @description
         */
        getIncidenceDetail: function(idIncidence) {
            var URL = 'api/tt/incidences/' + idIncidence +
                "?detailed=true&slainfo=true&next=statuses&next=actions"
            return _get(URL).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getWorkOrderDetail
         * @param {string} idWo
         * @description
         */
        getWorkOrderDetail: function(idWo) {
            var URL = 'api/tt/workorders/' + idWo +
                "?detailed=true&slainfo=true&next=statuses&next=actions"
            return _get(URL).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getDetailSymptom
         * @param {string} code
         * @description
         */
        getDetailSymptom: function(code) {
            var URL = 'api/tt/symptoms/' + code;
            return _get(URL).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getDetailWO
         * @param {string} idWO
         * @description
         */
        getDetailWO: function(idWO) {
            var URL = 'api/tt/workorders/' + idWO + "?detailed=true";
            return _get(URL).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getDetailProblem
         * @param {string} idProblem
         * @description
         */
        getDetailProblem: function(idProblem) {
            var URL = 'api/tt/problems/' + idProblem + "?detailed=true&next=actions";
            return _get(URL).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getDetailProblemType
         * @param {string} code
         * @description
         */
        getDetailProblemType: function(code) {
            var URL = 'api/tt/problemtypes/' + code;
            return _get(URL).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getNextStatusesContact
         * @param {string} idContact
         * @description
         */
        getNextStatusesContact: function(idContact) {
            var URL = 'api/tt/contacts/' + idContact + "/nextstatus";
                return _get(URL, {cache: !forceReload}).then(function (response) {
            return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getNextStatusesIncidence
         * @param {string} idIncidence
         * @description
         */
        getNextStatusesIncidence: function(idIncidence) {
            var URL = 'api/tt/incidences/' + idIncidence + "/nextstatus";
            return _get(URL, {cache: !forceReload}).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#saveTicket
         * @param {object} newTicket
         * @description
         */
        saveTicket: function(newTicket) {
            var URL = "/api/tt/contacts/?retrieve_param=eid";
            return _post(URL, newTicket, {cache: !forceReload }).then(function(response){
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#saveKPI
         * @param {object} newKPI
         * @description
         */
        saveKPI: function(newKPI) {
            var URL = "/api/sla/measures/kpi/isunavailable";
            return _post(URL, newKPI, {cache: !forceReload}).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#saveWorkOrder
         * @param {object} newWorkOrder
         * @description
         */
        saveWorkOrder: function(newWorkOrder) {
            var URL = "/api/tt/workorders/";
            return _post(URL, newWorkOrder, {cache: !forceReload}).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#saveReplanWO
         * @param {object} planned_date
         * @description
         */
        saveReplanWO: function (id, planned_date) {
            var URL = "/api/tt/workorders/" + id;
            return $http.put(URL, planned_date, { cache: !forceReload }).then(
                function (response) {
                    return response.data;
                }
            );
        },

        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#saveSymptom
         * @param {object} newSymptom
         * @description
         */
        saveSymptom: function(symptom) {
            var URL = "/api/tt/symptoms/";
                return _post(URL, symptom, {cache: !forceReload}).then(function(response) {
            return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#saveProblemType
         * @param {object} newProblemType
         * @description
         */
        saveProblemType: function(problemtype) {
            var URL = "/api/tt/problemtypes/";
            return _post(URL, problemtype, {cache: !forceReload}).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#saveProblem
         * @param {object} newProblem
         * @description
         */
        saveProblem: function(newProblem) {
            var URL = "/api/tt/problems/";
            return _post(URL, newProblem, {cache: !forceReload}).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#updateDataContact
         * @param {string} url
         * @param {object} newValue
         * @description
         */
        //TODO: is this an alias for put?
        updateDataContact: function(url, newValue) {
            var URL = url;
            return _put(URL, newValue, {cache: !forceReload}).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getRelatedIncidences
         * @param {string} idProblem
         * @description
         */
        getRelatedIncidences: function(idProblem) {
            var URL = 'api/tt/incidences/?detailed=true&problem=' + idProblem + '&rows=100';
            return _get(URL).then(function(response) {
                return response.data;
            });
        },
        /**
         * TBD
         * @ngdoc method
         * @methodOf udoModule.service.udoAPI
         * @name udoModule.service.udoAPI#getRelatedProblems
         * @param {string} idIncidence
         * @param {object} newValue
         * @description
         */
        getRelatedProblems: function(idIncidence) {
            var URL = 'api/tt/problems/?incidence=' + idIncidence + '&rows=100';
            return _get(URL).then(function(response) {
                return response.data;
            });
        }

    };
});


