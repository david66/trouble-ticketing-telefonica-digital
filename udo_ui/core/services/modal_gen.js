/**
 * @ngdoc service
 * @name udoModule.service:modalUtils
 */
udoModule.service('modalGen', ['createDialog', 'utils', function (createDialog, utils) {
    return {
        history: function (specialOpts, passedLocals) {
            var footerTemplate ='<button class="btn btn-udo-save" ng-click="$modalSuccess()">' +
                                    '{{$modalSuccessLabel}}' +
                                '</button>';
            var defaultOpts =  {
                    bodyClass: 'modal-body modal-body-extend',
                    modalClass: 'modal',
                    controller: ['$scope', 'histData', function($scope, histData){
                        $scope.hData = histData;
                    }],
                    css: { top: '6%', left:'5%', width:'90%', margin: '0 auto' },
                    backdrop: true,
                    form: false, // Form for enabled/disabled Ok button
                    footerTemplate: footerTemplate,
                    success: { 
                        label: 'Ok', 
                        fn: null
                    }
            };

            var configOptions = $.extend({}, defaultOpts, specialOpts);
            
            createDialog('/betacompany/udo_ui/core/views/modals/history_modal.html',
                configOptions, passedLocals
            );
        }
    };
}]);


