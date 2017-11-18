/**
 * @ngdoc controller
 * @name udoModule.controller:translatorCtrl
 * @description Translator controller is in charge of loading all translation dictionaries
 * and set up user language
 */
udoModule.controller('translatorCtrl', ['$scope', '$rootScope', '$http', 'LANG_FORMAT',
function($scope, $rootScope, $http, LANG_FORMAT) {
    $rootScope.translations = {};
    // Change languague
    $scope.changeLanguage = function (lang) {
        $rootScope.currentLanguage = lang;
        $rootScope.formatLanguage = LANG_FORMAT[lang];
        trPromise = $scope.load_translations();
        // Show loading page while changing language
        if (typeof(trPromise) !== 'undefined') {
            $rootScope.showLoadingPage = true;
            trPromise.then(function() {
                // Remove loading page when language is changed
                $rootScope.showLoadingPage = false;
            });
        }
    };

    // Load translation json file into
    $rootScope.load_translations = function() {
        var translations_file = "language_" + $rootScope.currentLanguage + ".json",
            translations_path = "/betacompany/js/i18n/" + translations_file;
        
        $rootScope.currentLanguage = $rootScope.currentLanguage || 'en';
        $rootScope.availableLangs = ['es', 'pt', 'en'];
        //remove the selected user lang
        $rootScope.availableLangs.splice($.inArray($rootScope.currentLanguage,
                                                   $rootScope.availableLangs), 1);
        if (!$rootScope.translations[$rootScope.currentLanguage]) {
            return $http.get(translations_path)
                .success(function(data) {
                    $rootScope.translations[$rootScope.currentLanguage] =
                        data[$rootScope.currentLanguage];
                })
                .error(function(data) {
                    //Handle with error log
            });
        }
    };                    
}]);


/**
 * @ngdoc filter
 * @name udoModule.filter:i18n
 * @description Filter to be used in view html code
 *  Use in angular html:
 *  <pre>
 *    {{'some_word' | i18n }}       <-- For default gender
 *    {{'some_word' | i18n:'fs'}}   <-- For a explicit gender:
 *                                                 'ms' - Single Male
 *                                                 'fs' - Single Female
 *                                                 'mp' - Plural Male
 *                                                 'fp' - Plural Female
 *  </pre>
 */

udoModule.filter('i18n', ['$rootScope', function($rootScope) {
    /**
     * @description
     *
     * Function to translate a word into current user language
     *
     * @param {input} word to be translated
     * @param {i18n} gender
     * @return  {string} translated word
     */
    return function (input, i18n) {
        var currentLanguage = $rootScope.currentLanguage || 'en';
        var translated_word;
        if ($rootScope.translations && $rootScope.translations[currentLanguage]) {
            translated_word = $rootScope.translations[currentLanguage][input];
        }
        if (translated_word === undefined) {
            // Only put [!!] characters if DEBUG mode is enabled
            if (window['DEBUG_MODE']) {
                translated_word = "[!!] " + input;
            } else {
                translated_word = input;
            }
        }
        
        if (typeof(translated_word) == typeof({})) {
            var gender = 'ms';
            if (i18n !== undefined){
                gender = i18n
            }
            translated_word = $rootScope.translations[currentLanguage][input][gender];
        }
        return translated_word;
    };
}]);


