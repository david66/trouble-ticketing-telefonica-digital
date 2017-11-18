/**
 * @ngdoc service
 * @name udoModule.service:questionsOp
 * @description UDo service to provide common operations for questions /
 * conversations chat.
 */
udoModule.service('questionsOp', function questionsOp(createDialog) {
    return {
        /**
         * @ngdoc method
         * @methodOf udoModule.service:questionsOp
         * @name udoModule.service:questionsOp#laundAddQuestionThreadModal
         * @param {object} scope The scope where conversationsannotations are being managed.
         * @param {string} questionsField The field on _scope_ where questions
         * will be stored (default falue: 'conversation').
         * @param {function} fn callback function to call when de addition operation
         * is performed.
         * @description This function lauchs a modal to create a new question on
         * any entity, the question will be an object like this:
         * <pre>
         *   question = {text: 'Query sentence', type: 'text'}
         * </pre>
         * and will be stored on scope[questionsField]
         */
        launchAddQuestionThreadModal: function(scope, questionsField, fn) {
            var newQuestionThread = {text: '', type: 'text'};
            questionsField = questionsField || 'questions';
            createDialog(
                '/betacompany/udo_ui/core/views/modals/add-questionthread-modal.html', {
                    bodyClass: 'modal-body modal-body-extend',
                    modalClass: 'modal modal-extend',
                    id: 'addQuestionThreadModal',
                    title: 'Add Question',
                    backdrop: true,
                    controller: 'addQuestionThreadModalCtrl',
                    form: true, // Form for enabled/disabled Ok button
                    nameForm: 'addQuestionForm',
                    success: { 
                        label: 'Ok', 
                        fn: function() {
                            if (!scope[questionsField]) { 
                                scope[questionsField] = []; 
                            }
                            scope[questionsField].push(newQuestionThread);
                            if (typeof(fn) === 'function') {
                                fn();
                            }
                        }
                    },
                    cancel: {label: 'Cancel', fn: null},
                },
                {
                    newQuestionThread: newQuestionThread
                });
        },
    }
});
