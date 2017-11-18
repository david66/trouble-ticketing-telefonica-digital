/**
 * @ngdoc directive
 * @name udoModule.directive:udoAttachments
 *
 * @param {object} attachments The attachments list
 *
 * @param {function} remove Function to perform the 'delete
 * attachment' actions for each attachment. It should be a function which
 * receives the attachment object and the attachment list as arguments.
 *
 * @param {string} buttons Defines what buttons will be shown. It will contain
 * a 'D' to show download button, a 'R' to show remove button and a 'L' to
 * show link button. If it's not provided, all buttons will be shown by
 * default. Example:
 *
 * <pre>
 * 'DL' // --> Will show only download an lik buttons
 * </pre>
 *
 * @description Directive to show and control attachments on udo elements
 *
 * ### Attributes definition
 *
 * #### 1. Attachments
 *
 * It is important to note that this directive expects **attachments** attribute
 * as an argument. The **attachments** variable should be a list of objects containing
 * both ``uri`` and ``name`` fields which represent those
 * attributes for an entity.
 *
 * For instance:
 *
 * <pre>
 * attachments = [{uri: '/api/dms/XXXXX/download', name: 'file1.jpg'},
 *                       {uri: '/api/dms/YYYYY/download', name: 'file2.jpg'}]
 * </pre>
 *
 */
udoModule.directive('udoAttachments', [function() {
// ----------------------------------------------------------------------------
// Attachments template
// ----------------------------------------------------------------------------
    var _template = 
// Shows every attachment
'<div class="row-fluid control-group" ng-repeat="attachment in attachments">' + 
    '<div class="attachments-link-tooltip"><div class="input-prepend span6">' +
        '<span class="add-on"><i class="icon-paperclip"></i></span>' +
        // Attachment name
        '<input id="attach_filename{{ $index }}" type="text" value="{{ attachment.name }}" ng-disabled="true" ng-readonly="true" placeholder="xxxxxxxxxxxx">' +
        // Attachment operations
        '<div class="btn-group">' +
            // Download button
            '<button ng-if="showDownload" type="button" class="btn" ng-click="downloadAttachment(attachment.uri)">' +
              '<i class="icon-download"></i>' +
            '</button>' +
            // Remove button
            '<button ng-if="showRemove" type="button" class="btn" ng-click="remove(attachment, attachments)">' +
              '<i class="icon-trash"></i>' +
            '</button>' +
            // Link button
            '<button ng-if="showLink" type="button" class="btn" tooltip="{{ completeUrl(attachment.uri) }}" tooltip-placement="right" tooltip-trigger="click">' +
            '<i class="icon-link"></i>' +
            '</button>' + 
        '</div>' +
    '</div></div>' +
'</div>';
// ----------------------------------------------------------------------------
    return {
        restrict: 'A',
        template: _template,
        scope: {
            attachments: '=',
            remove: '=',
            buttons: '='
        },
        controller: ['$scope', function($scope) {
            // Check what buttons should appear
            var buttons = 'DRL';
            if (typeof $scope.buttons === 'string') {
                buttons = $scope.buttons;
            }
            $scope.showDownload = buttons.indexOf('D') !== -1;
            $scope.showRemove = buttons.indexOf('R') !== -1;
            $scope.showLink = buttons.indexOf('L') !== -1;
            // Obtain complete url for an attachment
            $scope.completeUrl = function(attachmentUri) {
                return location.protocol + '//' + location.host + attachmentUri;
            };
            // Action to download attachment
            $scope.downloadAttachment = function(attachment) {
                window.open(attachment);
            };
        }]
    };
}]);

