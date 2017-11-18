udoModule.directive('boxContainer', [function() {
    var _template =    
    '<div class="container-fluid" id="{{containerId}}">'                        +
        '<div class="span12">'                                                  +
            '<div class="form-legend" id="Input_Field">'                        +
                '<div class="form-legend-title" >'                              +
                    '<button  class="btn btn-small pull-right" ng-click="isCollapsed = !isCollapsed" ng-switch="!isCollapsed"> \
                        <i ng-switch-when="false" class="icon-collapse" ></i><i ng-switch-when="true" class="icon-collapse-top"></i> \
                    </button>{{ udoTitle | i18n }}'                             +
                '</div>'                                                        +
            '</div>'                                                            +
            '<div collapse="isCollapsed" ng-transclude></div>'                  +
        '</div>'                                                                +  
    '</div>'                                                                    ;

    return {
        restrict: 'EA',
        transclude: true,
        scope: {
            udoTitle: '@',
            containerId: '@'
        },
        template: _template
    }
}]);

udoModule.directive('boxSection', [function() {
    var _template =
    '<div class="control-group row-fluid">' +
        '<div ng-transclude></div>'         +
    '</div>'                                ;
    return {
        restrict: 'EA',
        transclude: true,
        scope: {
        },
        template: _template
    }
}]);