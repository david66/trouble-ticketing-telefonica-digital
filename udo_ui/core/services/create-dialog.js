// Taken from https://github.com/Fundoo-Solutions/angularjs-modal-service/

angular.module('fundoo.services', []).factory('createDialog', ["$document", "$compile", "$rootScope", "$controller", "$timeout",
  function createDialog($document, $compile, $rootScope, $controller, $timeout) {
    var defaults =  {
						id: null,
						template: null,
						templateUrl: null,
						title: 'Default Title',
						titleTranslate: true,
						backdrop: true,
						handleEsc: true,
						form: false,
						nameForm: 'formModal',
						success: {label: 'OK', fn: null},
						successLabelTranslate: true,
						cancel: {label: 'Close', fn: null},
						cancelLabelTranslate: true,
						controller: null, //just like route controller declaration
						backdropClass: "modal-backdrop",
						footerTemplate: null,
						bodyClass: "modal-body",
						modalClass: "modal",
						css: { top: '10%', left: '20%', width: '60%', margin: '0 auto' }
                    };
    var body = $document.find('body');

    return function Dialog(templateUrl, options, passedInLocals) {
		// Handle arguments if optional template isn't provided.
		if (angular.isObject(templateUrl)) {
		    passedInLocals = options;
		    options = templateUrl;
		} else {
			options.templateUrl = templateUrl;
		}

		options = angular.extend({}, defaults, options); //options defined in constructor

		var key;
		var idAttr = options.id ? ' id="' + options.id + '" ' : '';

		// defaultFooter
		var defaultFooter = '<button class="btn btn-udo-warning" type="button" ng-click="$modalCancel()">{{$modalCancelLabel}}</button>' +
		                    '<button class="btn btn-udo-save"' +
		                    	((options.form) ? 'ng-disabled="' + options.nameForm + '.$invalid"' : '') +
		                    	'ng-click="$modalSuccess()">{{$modalSuccessLabel}}' +
		                    '</button>';

		// footerTemplate
		var footerTemplate = '<div class="modal-footer">' +
								(options.footerTemplate || defaultFooter) +
							 '</div>';

		// modalBody
		var modalBody = (function(){
			if(options.template) {
				if(angular.isString(options.template)) {
					// Simple string template
					return '<div class="' + options.bodyClass + '" style="color: #666666;">' + options.template + '</div>';
				} else {
					// jQuery/JQlite wrapped object
					return '<div class="' + options.bodyClass + '" style="color: #666666;">' + options.template.html() + '</div>';
				}
		    } else {
				// Template url
				return '<div class="' + options.bodyClass + '" style="color: #666666;" ng-include="\'' + options.templateUrl + '\'"></div>'
		    }
		})();

		//We don't have the scope we're gonna use yet, so just get a compile function for modal
		var templateString = '<div class="' + options.modalClass + ' fade"' + idAttr + '>' +
							 '	<div class="modal-header" style="color: #666666;">' +
							 '		<h4>{{$title}}</h4>' +
							 '	</div>';
		templateString = templateString +
		                	((options.form) ? '<form name="' + options.nameForm + '" class="formModal">' : '') +
		                		modalBody +
		                    	footerTemplate +
		                	((options.form) ? '</form>' : '') +
						 '</div>';

		// Translations

		// Title
		if (options.titleTranslate) {
		    templateString = templateString.replace('$title', '$title|i18n');
		}
		// Label button success
		if (options.successLabelTranslate) {
		    templateString = templateString.replace('$modalSuccessLabel', '$modalSuccessLabel|i18n');
		}
		// Label button cancel
		if (options.cancelLabelTranslate) {
		    templateString = templateString.replace('$modalCancelLabel', '$modalCancelLabel|i18n');
		}

		var modalEl = angular.element(templateString);

		for(key in options.css) {
		    modalEl.css(key, options.css[key]);
		}

		var backdropEl = angular.element('<div ng-click="$modalCancel()">');
		backdropEl.addClass(options.backdropClass);
		backdropEl.addClass('fade in');

		var handleEscPressed = function (event) {
		    if (event.keyCode === 27) {
		    	scope.$modalCancel();
		    }
		};

		var closeFn = function () {
		    if (options.handleEsc) {
		    	body.unbind('keydown', handleEscPressed);
		    }
		    modalEl.remove();
		    if (options.backdrop) {
		    	backdropEl.remove();
		    }
		};

		if (options.handleEsc) {
		    body.bind('keydown', handleEscPressed);
		}

		var ctrl, locals, scope = options.scope || $rootScope.$new();

		scope.$title = options.title;
		scope.$modalClose = closeFn;

		scope.$modalCancel = function () {
			var callFn = options.cancel.fn || closeFn;
			callFn.call(this);
			scope.$modalClose();
		};

		scope.$modalSuccess = function () {
			var callFn = options.success.fn || closeFn;
			callFn.call(this);
			scope.$modalClose();
		};

		scope.$modalSuccessLabel = options.success.label;
		scope.$modalCancelLabel  = options.cancel.label;
		  
		if (options.controller) {
			locals = angular.extend({$scope: scope}, passedInLocals);
			ctrl = $controller(options.controller, locals);
			// Yes, ngControllerController is not a typo
			modalEl.contents().data('$ngControllerController', ctrl);
		}

		$compile(modalEl)(scope);
		$compile(backdropEl)(scope);
		body.append(modalEl);

		if (options.backdrop) {
			body.append(backdropEl);
		}

		$timeout(function () { modalEl.addClass('in'); }, 200);
	};
}]);
