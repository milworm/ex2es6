import 'app/core/view/Component';
import 'app/view/answers/text/Answer';
import 'app/view/answers/number/Answer';
import 'app/view/answers/short/Answer';
import 'app/view/answers/multiplechoice/Answer';
import 'app/view/answers/formula/Answer';
import 'app/view/answers/confirm/Answer';
import 'app/view/answers/link/Answer';
import 'app/view/answers/image/Answer';
import 'app/view/answers/video/Answer';
import 'app/view/answers/audio/Answer';
import 'app/view/answers/file/Answer';
import 'app/view/answers/media/Answer';
import 'app/view/answers/app/Answer';

/**
 * Defines a component that contains all avaible
 * answers types, and allow user to select it.
 */
Ext.define('CJ.view.answers.AnswerTypes', {
    extend: 'CJ.core.view.Component',
    alias: 'widget.view-answer-types',
    config: {
        /**
         * @cfg {String} type
         */
        type: 'light',
        /**
         * @cfg {Ext.Component} popup
         */
        popup: null,
        /**
         * @cfg {Object} data
         */
        data: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-scroll d-answer-types d-menu-items',
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', // @TODO what is the correct icon for confirm?
        '<div class=\'d-button d-icon-text\' data-answer-type=\'confirm\'>{confirm}</div>', '<div class=\'d-button d-icon-link\' data-answer-type=\'link\'>{link}</div>', '<div class=\'d-button d-icon-image\' data-answer-type=\'image\'>{image}</div>', '<div class=\'d-button d-icon-video\' data-answer-type=\'video\'>{video}</div>', '<div class=\'d-button d-icon-audio\' data-answer-type=\'audio\'>{audio}</div>', '<div class=\'d-button d-icon-file\' data-answer-type=\'file\'>{file}</div>', // "<div class='d-button d-icon-drawing' data-answer-type='drawing'>{drawing}</div>",
        '<div class=\'d-button d-icon-formula\' data-answer-type=\'formula\'>{formula}</div>', '<div class=\'d-button d-icon-shortanswer\' data-answer-type=\'short\'>{short}</div>', '<div class=\'d-button d-icon-numericanswer\' data-answer-type=\'number\'>{number}</div>', '<div class=\'d-button d-icon-multiplechoice\' data-answer-type=\'multiplechoice\'>{multiple}</div>', '<div class=\'d-button d-icon-text\' data-answer-type=\'text\'>{text}</div>', //"<div class='d-button d-icon-graphu' data-answer-type='app' data-app-type='graphu'>GraphU</div>",
        //"<div class='d-button d-icon-boomath2' data-answer-type='app' data-app-type='boomath2'>Boomath2</div>",
        { compiled: true }),
        /**
         * @cfg {Object} listeners
         */
        listeners: {
            tap: {
                element: 'element',
                fn: 'onButtonTap',
                delegate: '.d-button'
            }
        }
    },
    constructor() {
        this.callParent(args);
        this.setData({
            confirm: CJ.t('view-answers-answer-types-confirm'),
            link: CJ.t('view-answers-answer-types-link'),
            image: CJ.t('view-answers-answer-types-image'),
            audio: CJ.t('view-answers-answer-types-audio'),
            video: CJ.t('view-answers-answer-types-video'),
            file: CJ.t('view-answers-answer-types-file'),
            drawing: CJ.t('view-answers-answer-types-drawing'),
            formula: CJ.t('view-answers-answer-types-formula'),
            'short': CJ.t('view-answers-answer-types-short'),
            number: CJ.t('view-answers-answer-types-number'),
            multiple: CJ.t('view-answers-answer-types-multiple'),
            text: CJ.t('view-answers-answer-types-text')
        });
    },
    /**
     * @param {Ext.Evented} e
     * @param {HTMLElement} target
     */
    onButtonTap(e, target) {
        const type = CJ.Utils.getNodeData(target, 'answerType'), appType = type == 'app' ? CJ.Utils.getNodeData(target, 'appType') : '', data = {
                type,
                app: appType
            };
        this.getPopup().hide();
        this.fireEvent('select', data);
    }
});