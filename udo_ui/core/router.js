// UDo routing module
udoModule.config(['$routeProvider', function($routeProvider) {
   $routeProvider
       .when('/', {
           templateUrl: '/betacompany/udo_ui/core/views/components/widgets.html'})
       .when('/ui', {
           redirectTo: '/'})
       .when('/tt/contacts/', {
           templateUrl: '/betacompany/udo_ui/core/views/components/grid.html',
           controller: 'listCtrl',
           resolve: {
               routerValidations: function(validations, errors) {
                   return validations.checkPermissions(['can_access_contacts'],
                                                       errors.forbidden);
               }
           }})
       .when('/tt/contacts/:eid', {
           templateUrl: '/betacompany/udo_ui/core/views/components/detailticket.html',
           controller: 'detailTicketCtrl',
           resolve: {
               routerValidations: function(validations, errors) {
                   return validations.checkPermissions(['can_access_contacts'],
                                                       errors.forbidden);
               }
           }})
       .when('/tt/incidences/', {
           templateUrl: '/betacompany/udo_ui/core/views/components/grid.html',
           controller: 'listCtrl',
           resolve: {
               routerValidations: function(validations, errors) {
                   return validations.checkPermissions(['can_access_incidences'],
                                                       errors.forbidden);
               }
           }})
       .when('/tt/incidences/:eid', {
           templateUrl: '/betacompany/udo_ui/core/views/components/detailincidence.html',
           controller: 'detailIncidenceCtrl',
           resolve: {
               routerValidations: function(validations, errors) {
                   return validations.checkPermissions(['can_access_incidences'],
                                                       errors.forbidden);
               }
           }})
       .when('/tt/groupinvolvedincidences/', {
           templateUrl: '/betacompany/udo_ui/core/views/components/grid.html',
           controller: 'listCtrl',
           resolve: {
               routerValidations: function(validations, errors) {
                   return validations.checkPermissions(['can_access_incidences'],
                                                       errors.forbidden);
               }
           }})
       .when('/tt/groupinvolvedincidences/:eid', {
           templateUrl: '/betacompany/udo_ui/core/views/components/detailincidence.html',
           controller: 'detailIncidenceCtrl',
           resolve: {
               routerValidations: function(validations, errors) {
                   return validations.checkPermissions(['can_access_incidences'],
                                                       errors.forbidden);
               }
           }})
       .when('/tt/workorders/', {
           templateUrl: '/betacompany/udo_ui/core/views/components/grid.html',
           controller: 'listCtrl',
           resolve: {
               routerValidations: function(validations, errors) {
                   return validations.checkPermissions(['can_view_wos'],
                                                       errors.forbidden);
               }
           }})
       .when('/tt/workorders/:eid', {
           templateUrl: '/betacompany/udo_ui/core/views/components/detailworkorder.html',
           controller: 'detailWorkOrderCtrl',
           resolve: {
               routerValidations: function(validations, errors) {
                   return validations.checkPermissions(['can_view_wos'],
                                                       errors.forbidden);
               }
           }})
       .when('/tt/problems/', {
           templateUrl: '/betacompany/udo_ui/core/views/components/grid.html',
           controller: 'listCtrl',
           resolve: {
               routerValidations: function(validations, errors) {
                   return validations.checkPermissions(['can_access_problems'],
                                                       errors.forbidden);
               }
           }})
       .when('/tt/problems/:eid', {
           templateUrl: '/betacompany/udo_ui/core/views/components/detailproblem.html',
           controller: 'detailProblemCtrl',
           resolve: {
               routerValidations: function(validations, errors) {
                   return validations.checkPermissions(['can_access_problems'],
                                                       errors.forbidden);
               }
           }})
       .when('/tt/symptoms/', {
           templateUrl: '/betacompany/udo_ui/core/views/components/grid.html',
           controller: 'listCtrl',
           resolve: {
               routerValidations: function(validations, errors) {
                   return validations.checkPermissions(['can_access_symptoms'],
                                                       errors.forbidden);
               }
           }})
       .when('/tt/symptoms/:code', {
           templateUrl: '/betacompany/udo_ui/core/views/components/detailsymptom.html',
           controller: 'detailSymptomCtrl',
           resolve: {
               routerValidations: function(validations, errors) {
                   return validations.checkPermissions(['can_access_symptoms'],
                                                       errors.forbidden);
               }
           }})
       .when('/tt/problemtypes/', {
           templateUrl: '/betacompany/udo_ui/core/views/components/grid.html',
           controller: 'listCtrl',
           resolve: {
               routerValidations: function(validations, errors) {
                   return validations.checkPermissions(['can_access_problemtypes'],
                                                       errors.forbidden);
               }
           }})
       .when('/tt/problemtypes/:code', {
           templateUrl: '/betacompany/udo_ui/core/views/components/detailproblemtype.html',
           controller: 'detailProblemTypeCtrl',
           resolve: {
               routerValidations: function(validations, errors) {
                   return validations.checkPermissions(['can_access_problemtypes'],
                                                       errors.forbidden);
               }
           }})
       .when('/tt/slaviolationlist/', {
           templateUrl: '/betacompany/udo_ui/core/views/components/grid.html',
           controller: 'listCtrl',
           resolve: {
               routerValidations: function(validations, errors) {
                   return validations.checkPermissions(['can_access_sla_violations'],
                                                       errors.forbidden);
               }
           }})
       .when('/tt/newticket/:cs', {
           templateUrl: '/betacompany/udo_ui/core/views/components/newticket.html',
           controller: 'newTicketCtrl'})
       .when('/tt/newkpi/', {
           templateUrl: '/betacompany/udo_ui/core/views/pages/empty.html'})
       .when('/tt/newworkorder/', {
           templateUrl: '/betacompany/udo_ui/core/views/components/newentity.html',
           controller: 'newEntityCtrl'})
       .when('/tt/newproblem/', {
           templateUrl: '/betacompany/udo_ui/core/views/components/newentity.html',
           controller: 'newEntityCtrl'})
       .when('/tt/newsymptom/', {
           templateUrl: '/betacompany/udo_ui/core/views/components/newentity.html',
           controller: 'newEntityCtrl'})
       .when('/tt/newproblemtype/', {
           templateUrl: '/betacompany/udo_ui/core/views/components/newentity.html',
           controller: 'newEntityCtrl'})
       .when('/tt/newtask/', {
           templateUrl: '/betacompany/udo_ui/core/views/pages/empty.html'})
       .when('/tt/newprocedure/', {
           templateUrl: '/betacompany/udo_ui/core/views/pages/empty.html'})
       .when('/tt/forbidden/', {
           templateUrl: '/betacompany/udo_ui/core/views/pages/forbidden.html'})
       .when('/help',
           {templateUrl: '/betacompany/udo_ui/core/views/pages/empty.html'})
       .when('/documentation',
           {templateUrl: '/betacompany/udo_ui/core/views/pages/empty.html'})
}]);

