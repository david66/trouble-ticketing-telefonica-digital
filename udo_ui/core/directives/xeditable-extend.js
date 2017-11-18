/**
 * @ngdoc directive
 * @name udoModule.directive:editableBsdatetime
 *
 * @param {params} Same as editableBsdate
 * @param {datetimepicker-config} datetimepicker-config pass-through
 *
 * New xeditable directive:
 * <pre>
 * <a class="btn disabled" ng-switch-when="date" href="#" editable-bsdatetime="field.value" 
 *    e-datetimepicker-config="{ dropdownSelector: '.my-toggle-select', startView: 'day',  minView: 'day'}"
 *    onbeforesave="updateData(field, $data)" onaftersave="saveData(field, $data)">
 * </pre>
 */


angular.module('xeditable').directive('editableBsdatetime', ['editableDirectiveFactory',
  function(editableDirectiveFactory) {
    return editableDirectiveFactory({
        directiveName: 'editableBsdatetime',
        inputTpl: '<udo-datetimepicker></udo-datetimepicker>'
    });
}]);
