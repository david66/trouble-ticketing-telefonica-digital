/**
 * @ngdoc directive
 * @name udoModule.directive:udoDatetimepicker
 *
 * @param {ngModel} ngModel insert by xeditable directive ($data)
 * @param {datetimepicker-config} datetimepicker-config pass-through
 *
 * Invoked from editableBsdatetime directive:
 * <pre>
 * <udo-datetimepicker></udo-datetimepicker>
 * </pre>
 */

udoModule.directive('udoDatetimepicker', ['$filter', '$compile', function($filter, $compile) {
    var _template = 
            '<div class="dropdown open">' +
                '<a class="dropdown-toggle" id="dropdown2" role="button" data-toggle="dropdown" data-target="#" href="#">' +
                    '<input type="text" class="input-large" data-ng-model="ngModel">' +
                '</a>' +
                '<ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">' +
                '</ul>' +
            '</div>';

    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {
            ngModel: '=',
            datetimepickerConfig: '@'
        },
        link: function(scope, element, attrs) {
            var container = element;

            // Add datetimepicker directive
            var datetimepicker = $('<datetimepicker id="datetimepicker" data-ng-model="ngModel" datetimepicker-config="' + 
                                                                                            scope.datetimepickerConfig + '"/>');
            var el = element.find('.dropdown-menu');
            el.html(datetimepicker);
            $compile(el.contents())(scope);
        },
        template: _template
    }
}]);