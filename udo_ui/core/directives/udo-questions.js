/**
 * @ngdoc directive
 * @name udoModule.directive:udoQuestions
 *
 *
 * @description Directive to show and add interaction and topic
 * chats on UDo. Chat interactions will be shown ordered by date, as a Skype
 * In each conversation thread, user can add a new interaction text.
 *
 *
 * Example:
 *
 * <div class="container-fluid" id="questions">
 *   <div class="span12">
 *     <div class="form-legend" id="Input_Field">
 *       <div class="form-legend-title">{{'Questions' | i18n}}</div>
 *     </div>
 *       <div id="areaQuestions">
 *          <div name="areaQuestions" class="row-fluid">
 *                  <div udo-questions conversation="conversation"></div>
 *          </div>
 *       </div>
 *    </div>
 * </div>
 *
 */
udoModule.directive('udoQuestions', ['$http', function($http) {
// ----------------------------------------------------------------------------
// Directive template
// ----------------------------------------------------------------------------
    var _template = 
        '<div id="questionsArea" ng-repeat="thread in conversation">' +
            '<div>'+
                '<div class="row-fluid control-group">' +
                    '<div class="divQuestions row-fluid">'+
                        '<div id="Input_Field"><div class="form-legend-subfield-title">'+
                            '<label><span class="label label-inverse"><i class="icon-comment"></i> #{{$index + 1}}</span> <b>{{ thread.topic | characters:25 }}</b> </label>' +
                        '</div>'+
                    '</div>'   +
                    '<div class="wizard-field">'+
                        '<div class="thread" id="threadArea" ng-repeat="interaction in thread.interactions" align="left">' +
                            '<span>[{{interaction.status_change.0.start|udoDate}}]</span>  ' +
                            '<a>{{interaction.owner}}:</a> {{interaction.text}}' +
                        '</div>' +
                    '</div>'+
                '</div>'+
                '<form class="form-inline" name="myForm" ng-submit="addInteraction(myForm.message.$viewValue, $index)" >' +
                '<div class="inputThread form-horizontal container-fluid input-group">' +   
                    '<span class="input-group-btn"><input type="text" class="form-control" ng-model="message" name="message" placeholder="Write a message..."> ' +
                    '<button class="btn btn-udo-save" type="submit">' +
                    '<i class="icon-reply"></i> Send' +
                    '</button></span>' +
                '</div>' +
                '</form>' +
            '</div>'+
        '</div>';     


    return {
        restrict: 'A',
        template: _template,
        controller: ['$scope', function ($scope) {

            $scope.addInteraction = function(message, conversation_id) {
                if (message) {
                    newQuestion = { text: message, type: 'text' }
                    $http.post('/api/tt/contacts/' + $scope.contact._id + '/conversation/' + 
                               parseInt(conversation_id) + '/interactions/',
                               newQuestion)
                        .success(function(interaction_id) {
                            // TOOD: refresh?
                            $scope.init();
                    });
                }
            }
        }]
    }
}]);
