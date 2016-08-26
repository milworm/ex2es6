import 'app/view/answers/media/Answer';

/**
 * Defines a Link-type answer.
 */
Ext.define('CJ.view.answers.link.Answer', {
    extend: 'CJ.view.answers.media.Answer',
    alias: 'widget.view-answers-link-answer',
    statics: { answerType: 'link' },
    config: {
        /**
         * @cfg {Boolean|Object} fileField
         */
        fileField: false,
        /**
         * @cfg {String} cls
         */
        cls: 'd-answer d-media-answer d-file-answer'
    }
});