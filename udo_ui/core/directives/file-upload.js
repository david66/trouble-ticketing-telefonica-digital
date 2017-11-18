/**
 * @ngdoc directive
 * @name fileUpload
 * @description
 *
 * Directive to enable upload files using DMS UDO API: /api/dms/upload/
 *
 * @examples
 *
    <div
      file-upload
      action='/api/dms/upload'
      btn-class='btn btn-small'
      btn-label="Choose File"
      input-name="file"
      progress-class='btn btn-small'></div>

    <div
      file-upload
      action='/api/dms/upload'
      btn-class='btn btn-small'
      btn-label="Choose M2Mservice excel ile"
      input-name="file"
      to-check="m2mservice"
      progress-class='btn btn-small'></div>
 *
 * @ dependencies
 *     jquery.form.js
 *     jquery.js
 * 
 */

// Taken from https://github.com/clouddueling/angularjs-file-upload

angular.module('fileUpload', [])
    .directive('fileUpload', [function() {

        var template_ie = "<form \
                        style='margin: 0;' \
                        method='POST' \
                        enctype='multipart/form-data'> \
                        <div class='uploader'> \
                                <input \
                                        type='file' \
                                        name='{{ inputName }}' \
                                        onchange='angular.element(this).scope().sendFile(this);'/> \
                                <input \
                                        name='tocheck' \
                                        value='{{ toCheck }}' \
                                        style='display: none;' \
                                        '/> \
                                <div class='btn-group'> \
                                        <button \
                                                class='{{ btnClass }} fake-uploader' \
                                                type='button' \
                                                readonly='readonly' \
                                                style='display: none;' \
                                                ng-model='avatar'>{{ btnLabel }}</button> \
                                </div> \
                        </div> \
</form>";

                                        // <button \
                                        //         disabled \
                                        //         class='{{ progressClass }}' \
                                        //         ng-class='{ \"btn-primary\": progress < 100, \"btn-success\": progress == 100 }' \
                                        //         ui-if=\"progress > 0\">{{ progress }}%</button>\ 

        var template_others = "<form \
                        style='margin: 0;' \
                        method='POST' \
                        enctype='multipart/form-data'> \
                        <div class='uploader'> \
                                <input \
                                        type='file' \
                                        name='{{ inputName }}' \
                                        style='display: none;' \
                                        onchange='angular.element(this).scope().sendFile(this);'/> \
                                <input \
                                        name='tocheck' \
                                        value='{{ toCheck }}' \
                                        style='display: none;' \
                                        '/> \
                                <div class='btn-group'> \
                                        <button \
                                                class='{{ btnClass }} fake-uploader' \
                                                type='button' \
                                                readonly='readonly' \
                                                style='display: none;' \
                                                ng-model='avatar'>{{ btnLabel }}</button> \
                                </div> \
                        </div> \
</form>";

        var template_udo = template_others;
        if ($.browser.msie) {
            template_udo = template_ie;
        }

        return {
                restrict: 'EA',
                replace: false,
                scope: {
                        action: '@',
                        btnLabel: '@',
                        btnClass: '@',
                        inputName: '@',
                        toCheck: '@',
                        progressClass: '@',
                        onSuccess: '&',
                        onError: '&'
                },
                link: function(scope, elem, attrs, ctrl) {
                        attrs.btnLabel = attrs.btnLabel || "Choose File";
                        attrs.inputName = attrs.inputName || "file";
                        attrs.toCheck = attrs.toCheck || "virus";
                        attrs.btnClass = attrs.btnClass || "btn";
                        attrs.progressClass = attrs.progressClass || "btn";


                        elem.find('.fake-uploader').click(function() {
                            elem.find('input[type="file"]').click();
                            return false;
                        });
                },
                template: template_udo,
                controller: ['$scope', 'errors', function ($scope, errors) {
                        $scope.progress = 0;
                        $scope.avatar = '';

                        $scope.sendFile = function(el) {
                                var $form = $(el).parents('form');

                                if ($(el).val() === '') {
                                        return false;
                                }
                                if ($.browser.msie) {
                                    // Force always olduplaod API to work with IE
                                    $form.attr('action', $scope.action.replace('/upload', '/oldupload'));
                                } else {
                                    $form.attr('action', $scope.action);
                                }

                                $scope.$apply(function() {
                                        $scope.progress = 0;
                                });

                                $form.ajaxSubmit({
                                        type: 'POST',
                                        dataType: 'json',
                                        uploadProgress: function(event, position, total, percentComplete) {

                                                $scope.$apply(function() {
                                                        // upload the progress bar during the upload
                                                        $scope.progress = percentComplete;
                                                });

                                        },
                                        error: function(event, statusText, responseText, form) {
                                                // remove the action attribute from the form
                                                $form.removeAttr('action');
                                                var dms_error = 'The upload operation could not be completed.'+
                                                '\nRemember that max filename length is 50 characters,'+
                                                ' max file size is around 20Mb' + 
                                                ' and file could not contain a virus';
                                                if (!$.browser.msie) {
                                                    dms_error = JSON.parse(event.responseText)['detail'];
                                                }
                                                errors.launchErrorModal('ERROR uploading file', 
                                                                                dms_error);
                                                $scope.$apply(function () {
                                                        // Reset progress bar
                                                        $scope.progress = 0;
                                                        $scope.onError({
                                                                event: event,
                                                                responseText: responseText,
                                                                statusText: statusText,
                                                                form: form
                                                        });
                                                });
                                        },
                                        success: function(responseText, statusText, xhr, form) {
                                                var ar = $(el).val().split('\\'),
                                                        filename =  ar[ar.length-1];

                                                // add filename in responseText
                                                responseText['name'] = filename;

                                                // remove the action attribute from the form
                                                $form.removeAttr('action');

                                                $scope.$apply(function () {
                                                        $scope.onSuccess({
                                                                responseText: responseText,
                                                                statusText: statusText,
                                                                xhr: xhr,
                                                                form: form
                                                        });
        
                                                        $scope.progress = 0;
                                                });
                                        },

                                });
                            // Prevent standard browser submit and page navigation
                            return false;
                        }
                }]
        };
}]);
