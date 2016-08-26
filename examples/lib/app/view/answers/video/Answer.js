import 'app/view/answers/media/Answer';

/**
 * Defines a Camera-type answer.
 */
Ext.define('CJ.view.answers.video.Answer', {
    extend: 'CJ.view.answers.media.Answer',
    alias: [
        'widget.view-answers-video-answer',
        // @TODO ask Ivo/Alin to run backend script that replaces all
        // "view-answers-camera-answer" to "view-answers-video-answer"
        'widget.view-answers-camera-answer'
    ],
    statics: { answerType: 'video' },
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-answer d-media-answer d-video-answer'
    }
});