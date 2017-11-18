/**
 * @ngdoc service
 * @name udoModule.service:annotationsOp
 * @description UDo service to provide common operations for annotations.
 */
udoModule.service('annotationsOp', function annotationsOp(createDialog) {
    // buildAnnotation function
    var _buildAnnotation = function(annotation) {
        if (annotation.code.code) {
            annotation.code = annotation.code.code;
        }
        return annotation;
    };
    return {
        /**
         * @ngdoc method
         * @methodOf udoModule.service:annotationsOp
         * @name udoModule.service:annotationsOp#laundAddNotesModal
         * @param {object} scope The scope where annotations are being managed.
         * @param {string} annotationsField The field on _scope_ where annotations
         * will be stored (default falue: 'annotations').
         * @param {function} fn callback function to call when de addition operation
         * is performed.
         * @description This function lauchs a modal to create a new annotation on
         * any entity, the annotation will be an object like this:
         * <pre>
         * annotation = {code: 'Annotation Code', value: 'Annotation value'}
         * </pre>
         * and will be stored on scope[annotationsField]
         */
        launchAddNotesModal: function(scope, annotationsField, fn) {
            var newNote = {code: '', value: ''};
            annotationsField = annotationsField || 'annotations';
            createDialog(
                '/betacompany/udo_ui/core/views/modals/add-notes-modal.html',
                {
                    bodyClass: 'modal-body modal-body-extend',
                    modalClass: 'modal modal-extend',
                    id: 'addNotesModal',
                    title: 'Add Note',
                    backdrop: true,
                    controller: 'addNotesModalCtrl',
                    form: true, // Form for enabled/disabled Ok button
                    nameForm: 'addNotesForm',
                    success: {
                        label: 'Ok',
                        fn: function() {
                            if (!scope[annotationsField]) {
                                scope[annotationsField] = [];
                            }
                            scope[annotationsField].push(newNote);
                            if (typeof fn === 'function') {
                                fn();
                            }
                        }
                    },
                    cancel: {
                        label: 'Cancel',
                        fn: null
                    }
                },
                {
                    newNote: newNote
                }
            );
        },
        /**
         * @ngdoc method
         * @methodOf udoModule.service:annotationsOp
         * @name udoModule.service:annotationsOp#buildAnnotation
         * @param {object} annotation An annotation to obtain data and build
         * one using the expected format.
         * @description Given an annotation which may have more details than
         * required on _code_ field returns the annotation with the code
         * normalized. The annotation param will be modified.
         */
        buildAnnotation: _buildAnnotation,
        /**
         * @ngdoc method
         * @methodOf udoModule.service:annotationsOp
         * @name udoModule.service:annotationsOp#buildAnnotations
         * @param {object} annotations A list of annotations to build
         * @description Applies _buildAnnotation_ funciton on a list of
         * annotations
         */
        buildAnnotations: function(annotations) {
            var newAnnotations = [];
            for (var i = 0; i < annotations.length; i++) {
                newAnnotations.push(_buildAnnotation(annotations[i]));
            }
            return newAnnotations;
        }
    };
});
