/**
 * @ngdoc module
 * @name udoModule
 * @id index
 * @description
 * Main module of the New udo trouble ticketing
 */
// Declare app level module which depends on filters, and services
var udoModule = angular.module('udoApp', [
    'ngRoute', 'ui.bootstrap', 'ngGrid', 'fileUpload', 'fundoo.services',
    'ngSanitize', 'ui.bootstrap.datetimepicker', 'xeditable',  'truncate', 'UDo.services'
]);

udoModule.value('VERSION', '2.6.7');

udoModule.constant('LANG_FORMAT', {
    'es': "dd/MM/yyyy HH:mm:ss",
    'pt': "dd/MM/yyyy HH:mm:ss",
    'en': "MM/dd/yyyy HH:mm:ss"
});

udoModule.constant('TRANSLATION_MAP', {
    'DELEGATED' : 'Delegated to group',
    'DELEGATION_ENDED': 'End of delegation',
    'TRANSFERRED': 'Transferred to group',
    'RESPONSIBLE_ASSIGNMENT': 'Responsible assigned',
    'RESPONSIBILITY_RETURNED': 'Return of responsibility to the group',
    'EXTERNAL_SYSTEM_WAITING': 'Waiting for external system result',
    'EXTERNAL_SYSTEM_RESULT': 'External system result',
    'ANNOTATION_ADDED': 'New Annotation',
    'ANNOTATION_UPDATED': 'Annotation Updated',
    'CREATOR_EXTERNAL_SYSTEM_NOTIFIED_OK': 'CREATOR_EXTERNAL_SYSTEM_NOTIFIED_OK',
    'CREATOR_EXTERNAL_SYSTEM_NOTIFIED_NOK': 'CREATOR_EXTERNAL_SYSTEM_NOTIFIED_NOK',
    'ATTACHMENT_ADDED': 'Attachment Added',
    'ATTACHMENT_DELETED': 'Attachment Deleted'
});

udoModule.constant('SEVERITY_LABELS', [
    'Cosmetic', 'Slight', 'Minor', 'Major', 'Major high', 'Critical'
]);

udoModule.constant('SEVERITY_LABELS_WOS', [
    'Minor', '', '', 'Major', '', 'Critical'
]);

udoModule.constant('OBS_WOS', [
    {key: "UK", name: "UK"}, 
    {key: "DE", name: "DE"},
    {key: "CZ", name: "CZ"},
    {key: "IE", name: "IE"},
    {key: "US", name: "US"},
    {key: "ES", name: "ES"},
    {key: "TMS", name: "TMS"},
    {key: "AR", name: "AR"},
    {key: "CL", name: "CL"},
    {key: "CO", name: "CO"},
    {key: "MX", name: "MX"},
    {key: "BR", name: "BR"},
    {key: "PA", name: "PA"},
    {key: "EC", name: "EC"},
    {key: "CR", name: "CR"},
    {key: "SV", name: "SV"},
    {key: "GT", name: "GT"},
    {key: "PE", name: "PE"},
    {key: "UY", name: "UY"},
    {key: "VE", name: "VE"}]
);

udoModule.config(['$httpProvider', function($httpProvider) { // Add csrf_token to http requests
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrf_token = getCookie('csrftoken');
    $httpProvider.defaults.headers.common['X-CSRFToken'] = csrf_token;
}]);

udoModule.run(function(editableOptions, editableThemes) {
    // Editable theme
    editableOptions.theme = 'bs2'; // bootstrap2 theme. Can be also 'bs3', 'default'

    // Submit button template for enable/disable (aka form) submit button
    editableThemes[editableOptions.theme].submitTpl = 
        '<button type="submit" class="btn btn-udo-save" ng-init="$root.xeditable.backup($data)" ng-disabled="$root.xeditable.isUnchanged($data)">' +
          '<span class="icon-ok icon-white"></span>' +
        '</button>';
    // Control template for remove control-group class
    editableThemes[editableOptions.theme].controlsTpl = 
        '<div class="editable-controls controls" ng-class="{\'error\': $error}"></div>';

    // Control template for add btn-danger class
    editableThemes[editableOptions.theme].cancelTpl =
        '<button type="button" class="btn btn-danger" ng-click="$form.$cancel()">'+
            '<span class="icon-remove"></span>'+
        '</button>';
});

