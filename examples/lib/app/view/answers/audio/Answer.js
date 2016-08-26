import 'app/view/answers/media/Answer';

/**
 * Defines an audio-type answer.
 */
Ext.define('CJ.view.answers.audio.Answer', {
    extend: 'CJ.view.answers.media.Answer',
    alias: 'widget.view-answers-audio-answer',
    statics: {
        /**
         * @property {String} answerType
         */
        answerType: 'audio'
    },
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-answer d-media-answer d-audio-answer'
    }
});