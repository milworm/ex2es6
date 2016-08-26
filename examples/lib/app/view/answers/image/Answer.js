import 'app/view/answers/media/Answer';

/**
 * Defines a File-type answer.
 */
Ext.define('CJ.view.answers.image.Answer', {
    extend: 'CJ.view.answers.media.Answer',
    alias: 'widget.view-answers-image-answer',
    statics: { answerType: 'image' },
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-answer d-media-answer d-image-answer'
    }
});