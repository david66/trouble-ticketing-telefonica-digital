/**
 * @ngdoc directive
 * @name templateDescription
 * @description
 *
 * TBD
 *
 * @examples
 *
 */


udoModule.directive('templateDescription', function($compile) { 
    return {
        restrict: 'E',
        transclude: true,
        scope: false,
        link: function(scope, element, attrs) {
            scope.$watch('templates.selected.template', function () {
                var DjangoTemplateFiller = function(template_string) {
                    scope.templates.selected.template.content = template_string;

                    var self = this;
                    var container = $('<div class="django-template-filler">');

                    // BUILD GUI
                    function buildGUI() {
                        var text = sanitize(template_string);
                        text = text.replace(
                                        /{{\s*(.*?)\s*}}(?:\s*{%\s*comment\s*%}\s*(.*?)\s*{%\s*endcomment\s*%})?/g,
                                        replaceBySpan);
                        container.html(text);
                        $('.context_value', container).click(function() {
                            var $this = $(this);
                            var value = $this.text();
                            var input = $('<input value="' + value + '"/>');
                            $this.empty().append(input);

                            // Input acceptance
                            function saveValue() {
                                var text = $(this).val();
                                !text && (text = value); // If empty, preservs former value
                                input.remove();
                                $this.text(text);
                                value = text;
                            }
                            input.blur(saveValue).keypress(function(e) {
                                if (e.which === 0) {
                                    input.val('');
                                    return saveValue.apply(this);
                                }

                                if (e.which === 13) {
                                    return saveValue.apply(this);
                                }
                            });

                            // Input prvents click propagation
                            input.click(function(e) {
                                e.stopPropagation();
                            });

                            // Take focus
                            input.focus().select();
                        });
                    }

                    function replaceBySpan(str, name, title) {
                        !title && (title = name);
                        var context_key = '<span class="context_key" style="display:none;">'
                                + name + '</span>';
                        var context_value = '<span class="context_value" title="' + title
                                + '">' + name + '</span>';
                        return context_key + context_value;
                    }

                    // METHODS
                    self.getHTMLContainer = function() {
                        return container;
                    };

                    buildGUI();
                };

                var PythonStringFiller = function(template_string) {
                    scope.templates.selected.template.content = template_string;

                    var self = this;
                    var container = $('<div class="python-template-filler">');

                    // PUBLIC INTERFACE
                    self.getHTMLContainer = null;
                    self.getContexts = null;

                    // BUILD GUI
                    function buildGUI() {
                        var text = sanitize(template_string);
                        text = text.replace(/%(\S+)/g, replaceByWidget);
                        container.html(text);
                    }

                    function replaceByWidget(str, type) {
                        if (type == '%') {
                            return '%';
                        }

                        var context_value;
                        if (type == 's') {
                            context_value = '<textarea class="context_value type_s"></textarea>';
                        } else {
                            context_value = '<input class="context_value type_' + type + '" />';
                        }
                        return context_value;
                    }

                    // METHODS
                    self.getHTMLContainer = function() {
                        return container;
                    };

                    self.getContexts = function() {
                        var context = [];
                        $('.context_value', container).each(function() {
                            var value = $(this).val();
                            context.push(value);
                        });
                        return [ context ];
                    };

                    buildGUI();
                };

                var TemplateFillerFactory = (function() {
                    var widget_map = {
                                        'djangotemplate' :         DjangoTemplateFiller,
                                        'udo.pythonstringformat' : PythonStringFiller
                                     };

                    function newFiller(template) {
                        return new widget_map[template.types[0]](scope.templates.selected.template.content);
                    }

                    return {
                        newFiller : newFiller
                    };
                })();

                // Code
                var template = scope.templates.selected.template;
                if (typeof(template) != "undefined")
                {
                    if (template.code === "free_text_template")
                    {
                        scope.templates.selected.content = "";
                        var newTemplateWidgetArea = '<textarea ng-model="templates.selected.content" rows="5"/>';
                        element.parent().removeClass("well").addClass("templateDescription"); // Remove class => remove border
                    }
                    else
                    {
                        fillerWidget = TemplateFillerFactory.newFiller(template);
                        var newTemplateWidgetArea = fillerWidget.getHTMLContainer(); // New template area
                        element.parent().addClass("well"); // Add class => add border
                    }

                    element.html(newTemplateWidgetArea);
                    $compile(element.contents())(scope);
                }
            });
        },
        template:
            '<div>' +
                '<b>{{templates.selected.content}}</b>' +
            '</div>',
        replace: true
    };
});
