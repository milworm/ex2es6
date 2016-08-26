import 'app/view/answers/media/Answer';

/**
 * Defines a File-type answer.
 */
Ext.define('CJ.view.answers.file.Answer', {
    extend: 'CJ.view.answers.media.Answer',
    alias: 'widget.view-answers-file-answer',
    statics: { answerType: 'file' },
    config: {
        /**
         * @cfg {Boolean|Object} fileField
         */
        fileField: Ext.os.is.iOS ? false : true,
        /**
         * @cfg {String} cls
         */
        cls: 'd-answer d-media-answer d-file-answer'
    }
});