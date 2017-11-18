udoModule.directive('bsPopover', ['$compile', '$http', '$timeout', function($compile, $http, $timeout) {
  return {
        restrict: 'A',
        link: function postLink(scope, element, attr, ctrl) {

            $http.get(attr.bsPopover).success(function(data) {

                // Provide dismiss function
                scope.dismiss = function(scope) { element.popover('hide'); };

                element.popover({
                    content: function() {
                        $timeout(function(){
                            if (attr.customplacement) element.data('popover').$tip.addClass(attr.customplacement);
                            $compile(element.data('popover').tip())(scope);
                        }); 
                        return data;
                    },
                    trigger: 'manual',
                    html: true
                }).click(function(ev) {

                    var popover = element.data('popover'),
                        tip = popover.tip(),
                        visibility = !tip.hasClass('in');

                    // Hide any active popover except ouself
                    $("body > .popover").each(function() {
                        var $this = $(this);
                        if(!$this.data('popover').$element.is(element)) $this.popover('hide');
                    });

                    // Toggle the popover
                    element.popover(visibility ? 'show' : 'hide');
                    tip.data('popover', popover);

                });

            });
        }
    };
}]);

udoModule.directive('onKeyup', function() {
    return function(scope, elm, attrs) {
        function applyKeyup() {
          scope.$apply(attrs.onKeyup);
        };           
        
        var allowedKeys = scope.$eval(attrs.keys);
        elm.bind('keyup', function(evt) {
            //if no key restriction specified, always fire
            if (!allowedKeys || allowedKeys.length == 0) {
                applyKeyup();
            } else {
                angular.forEach(allowedKeys, function(key) {
                    if (key == evt.which) {
                        applyKeyup();
                    }
                });
            }
        });
    };
});