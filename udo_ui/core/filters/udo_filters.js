/**
 * @ngdoc filter
 * @name udoModule.filter:udoDate
 * @description Filter to obtain the proper format for a date depending on the
 * current language.
 *
 * Usage:
 *
 * <pre>
 * {{ utcdate || udoDate }}
 * </pre>
 *
 * ``utcdate`` should be a date in UTC with format 'yyyy-MM-DD HH:mm:ss.ssss'
 */
udoModule.filter('udoDate', ['$rootScope', '$filter', 'utils', function($rootScope, $filter, utils) {    
    return function(input){
        if (input) {
            if (typeof(input) === "string") {
                input = utils.date.utc2local(input);
            }

            if (input instanceof Date) {
                var angularDateFilter = $filter('date');
                return angularDateFilter(input, $rootScope.formatLanguage);
            }
        }
    };
}]);

/**
 * @ngdoc filter
 * @name udoModule.filter:replace
 * @description Filter to replace some words in a string
 *
 * Usage:
 *
 * <pre>
 * {{ str|replace:{'from1': 'to1, 'from2', 'to2'} }}
 * </pre>
 */
udoModule.filter('replace', ['$rootScope', function($rootScope) {
    return function(input, replacements){
        // Handle invalid replacements
        if (!angular.isObject(replacements)) {
            return input;
        }
        // Perform replacements
        angular.forEach(replacements, function (to, from) {
            if (to) {
                // Convert to regular expression for global replacement
                var regex = new RegExp(from, "g");
                input = input.replace(regex, to);
            }
        });
        return input;
    };
}]);

/**
 * @ngdoc filter
 * @name udoModule.filter:sortDeclared
 * @description Filter to order in which the objects were declared
 *
 * Usage:
 *
 * <pre>
 * {{ objects || sortDeclared }}
 * </pre>
 */
udoModule.filter('sortDeclared', ['$rootScope', function($rootScope) {
    return function(input){
        if (!input) { return []; }

        delete input.$$hashKey;
        return Object.keys(input);
    };
}]);


