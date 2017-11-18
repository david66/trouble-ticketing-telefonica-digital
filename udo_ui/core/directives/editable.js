/**
 * @ngdoc directive
 * @name editable
 * @description
 *
 * TBD
 *
 * @examples
 *
 */

udoModule.directive('editable', ['$rootScope', '$q', 'udoAPI', function($rootScope, $q, udoAPI) {
    return {
                restrict: 'A',
                scope: {
                    url: '@'
                },
                require:'ngModel',
                link: function(scope, elem, attrs, ctrl) {
                    scope.$watch('url', function () {
                        if (attrs.url) {
                            var objConfig = {
                                                type: 'select',
                                                title: 'Status',
                                                placement: 'right',
                                                value: 'Active',
                                                source: [
                                                    {value: 'New', text: 'New'},
                                                    {value: 'Active', text: 'Active'},
                                                    {value: 'Canceled', text: 'Canceled'}
                                                ]
                                                ,error: function(response, newValue) {
                                                    response.responseText = response.data.detail;

                                                    return response.responseText;
                                                }
                                                ,pk: null
                                                ,send: 'always'
                                                ,url: function(params) {               
                                                                            $rootScope.$apply(function () {
                                                                                //var deferred = $q.defer();
                                                                                var d = new $.Deferred();

                                                                                var changeDataContact = udoAPI.changeDataContact(attrs.url, params);
                                                                                $q.all([changeDataContact]).then(function (response) {
                                                                                    d.resolve(response);
                                                                                }, function (response) {
                                                                                    // Error
                                                                                    d.reject(response.data.detail);
                                                                                });
                                                                                return d.promise();
                                                                            }(this));
                                                                        }
                                                ,ajaxOptions: {
                                                    type: 'put'
                                                    ,dataType: 'json'
                                                }
                                                ,params: function(params) {
                                                    //originally params contain pk, name and value
                                                    var data = angular.toJson(params.value);
                                                    return data;
                                                }
                                            };

                            elem.editable(objConfig);
                        }
                    })
                },
                /***** 2-step save version: Fist local, second server >>>>>> DON'T ERASE
                link: function(scope, elem, attrs, ctrl) {
                    scope.$watch('url', function () {
                        if (attrs.url) {
                            var objConfig = {
                                                type: 'select',
                                                title: 'Status',
                                                placement: 'right',
                                                value: 'Active',
                                                source: [
                                                    {value: 'New', text: 'New'},
                                                    {value: 'Active', text: 'Active'},
                                                    {value: 'Canceled', text: 'Canceled'}
                                                ]
                                            };

                            elem.editable(objConfig);

                            // Event fired when new value was submitted (local or server). This case: local
                            elem.on('save', function(e, params) {
                                var newValue = angular.toJson(params.newValue);

                                scope.$apply(function() {
                                    submit(newValue);
                                });
                            });

                            function submit(newValue) {
                                var changeDataContact = udoAPI.changeDataContact(attrs.url, newValue);
                                $q.all([changeDataContact]).then(function (response) {
                                        // Success
                                        angular.noop();
                                    }, function (response) {
                                        // Error
                                        angular.noop();
                                    });
                            }
                        }
                    })
                },
                ****/
                controller: ['$scope', function ($scope) {
                }],
            };
}]);