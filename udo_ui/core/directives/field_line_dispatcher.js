/**
 * Directive to show fields in "newlines"
 * TBD
*/
udoModule.directive('fieldLineDispatcher', [function () {
    var _template =
    '<div ng-repeat="key in fields | sortDeclared" ng-init="field = fields[key]">' +
    // Not editable
    '  <div ng-if="!field.editable">' +
    '    <div class="field-newline-container" ng-switch="field.widget">' +
      // Widget: 'textarea'
    '      <div ng-switch-when="textarea">' +
    '        <label>{{ field.name | i18n }}</label>' +
    '        <div class="text-area-content">' +
    '          {{ field.value }}' +
    '        </div>' +
    '      </div>' +
      // Widget: 'textarealink'
    '      <div ng-switch-when="textarealink">'+
    '        <label>{{ data.name | i18n }}</label>' +
    '        <div class="text-area-content">' +
    '          <a href="{{ data.link }}">{{ data.value }}</a>' +
    '        </div>' +
    '      </div>' +
      // Widget: 'multitextarea'
    '      <div ng-switch-when="multitextarea">'+
    '        <div ng-repeat="data in field.data">' +
    '          <label>{{ data.name | i18n }}</label>' +
    '          <div class="text-area-content">' +
    '            {{ data.value }}' +
    '          </div>' +
    '        </div>' +
    '      </div>' +
      // Widget: 'multitextarealink'
    '      <div ng-switch-when="multitextarealink">'+
    '        <div ng-repeat="data in field.data">' +
    '          <label>{{ data.name | i18n }}</label>' +
    '          <div class="text-area-content">' +
    '            <a href="{{ data.link }}">{{ data.value }}</a>' +
    '          </div>' +
    '        </div>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    // Editable
    '  <div class="field-newline-container text-area-field" ng-if="field.editable">' +
    '    <div class="field-newline-container text-area-field" ng-switch="field.widget">' +
              // widget: 'textarea'
    '     <div ng-switch-when="textarea">'+
    '       <label>{{field.name | i18n}}</label>' +
    '       <a href="#" class="annotation-link" editable-text="field.value" onbeforesave="updateData(field, $data)">' +
    '         <pre class="annotation-editable">{{ field.value || \'empty\' }}</pre>' +
    '       </a>' +
    '     </div>' +
    '   </div>' +
    '  </div>' +
    '</div>';

    return {
        restrict: 'EA',
        scope: {
            fields: '=',
            showData: '=',
            updateData: '='
        },
        template: _template
    };
}]);
