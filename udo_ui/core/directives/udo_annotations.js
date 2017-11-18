/**
 * @ngdoc directive
 * @name udoModule.directive:udoAnnotations
 *
 * @param {string} annotations Reference to parent scope annotations.
 *
 * If the annotations reference is _annotations_:
 * <pre>
 * <div udo-annotations annotations="annotations"></div>
 * </pre>
 * Then, ``$scope.annotations`` should contain a list of annotations where each element
 * contains at least the following fields:
 *
 * - **code**: it can be a string or an object containg ``{code: 'String code', ...}``.
 * - **value**: a string containing the annotation value.
 * - **date**: the modification date for the annotation.
 * - **operator**: a string containing the operator who created the annotation.
 *
 * @param {function} onChange Reference to a parent function called when changing an
 * annotation value. The onChange function should have the following definition:
 *
 * <pre>
 * function onChange(index, annotation, data) {
 *     //...
 * }
 * </pre>
 *
 * Where the parameters are:
 *
 * - **index**: the annotation position.
 * - **annotation**: an object containing the annotation before update
 * - **data**: the new value for annotation.value.
 *
 * In general, this function will perform some request to update the annotation
 * on the server and refresh the content.
 *
 * @param {string} order A string to specify the annotations order. The possible values
 * are:
 *
 * - 'modified': sort the annotations by modification date (descending)
 * - '-modified': sort the annotations by modification date (ascending)
 * - 'created': sort the annotations by creation date (descending)
 * - '-created': sort the annotations by creation date (ascending)
 *
 *  @param {string} iseditable A string defining if the showed annotations should be
 *  editable ("true") or not ("false").
 *
 * @description Directive to show and edit annotations on UDo elements. All annotations
 * will be shown ordered by date, containing all the requested information and letting
 * the user edit the annotation value with a xeditable text field.
 *
 * Example:
 * <pre>
 * <div udo-annotations annotations="annotations" on-change="changeAnnotation"></div>
 * </pre>
 */
udoModule.directive('udoAnnotations', function() {
    //Sorting functions for annotations
    var sortFunctions = {
        'modified': function(a, b) {
            return a.date > b.date ? -1 : a.date < b.date ? 1 : 0;
        },
        '-modified': function(a, b) {
            return a.date > b.date ? 1 : a.date < b.date ? -1 : 0;
        },
        'created': function(a, b) {
            return a.index > b.index ? -1 : a.index < b.index ? 1 : 0;
        },
        '-created': function(a, b) {
            return a.index > b.index ? 1 : a.index < b.index ? -1 : 0;
        },
    };
// ----------------------------------------------------------------------------
// Directive template
// ----------------------------------------------------------------------------
    var _template =
'<div id="notesArea" class="editable-notes" ng-repeat="annotation in extendNotesInfo(annotations)">' +
    '<div class="row-fluid"><div class="row-fluid control-group">' +
        '<div class="annotation-info">' +
            '<label class="annotation-label">{{ annotation.code }}</label>' +
            '<div class="annotation-details">' +
                '<b>{{ "Mod. by"|i18n }}</b>: {{ annotation.operator}}, {{ annotation.date|udoDate }}' +
            '</div>'+
        '</div>' +
        '<a ng-if="editable" class="annotation-link" href="#" onbeforesave="onChange(annotation.index, annotation, $data)" editable-textarea="annotation.value" e-rows="10" e-cols="100">' +
            '<pre class="editable-click">{{ annotation.value }}</pre>' +
        '</a>' +
        '<pre ng-if="!editable" style="white-space: normal;">{{ annotation.value }}</pre>' +
    '</div></div>' +
'</div>';
// ----------------------------------------------------------------------------

    return {
        restrict: 'A',
        template: _template,
        scope: {
            annotations: '=',
            onChange: '=',
            iseditable: '=',
            order: '@'
        },
        controller: ['$scope', 'annotationsOp', function($scope, annotationsOp) {
            // $scope.iseditable used for pass argument (optional in directive)
            // $scope.editable used for template (ng-if)
            // Default: editable is true
            if (typeof($scope.iseditable) !== "undefined") {
                $scope.editable = $scope.iseditable;
            }
            else {
                $scope.editable = true;
            }

            /*
             * Extend the annotations information by appending original index and
             * sort as configured.
             */
            $scope.extendNotesInfo = function(annotations) {
                // Order default value
                if (sortFunctions[$scope.order || ''] === undefined) {
                    $scope.order = 'modified';
                }
                if (annotations) {
                    var extended = [];
                    for (var i = 0; i < annotations.length; i++) {
                        annotations[i].index = i;
                        extended.push(annotationsOp.buildAnnotation(annotations[i]));
                    }
                    extended.sort(sortFunctions[$scope.order]);
                    return extended;
                }
            }
        }]
    };
});
