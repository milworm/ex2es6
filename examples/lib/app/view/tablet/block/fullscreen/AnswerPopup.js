import 'app/view/tablet/block/fullscreen/Popup';

/**
 * Defines a popup that is used to show an answer block.
 */
Ext.define('CJ.view.tablet.block.fullscreen.AnswerPopup', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.tablet.block.fullscreen.Popup',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-tablet-block-fullscreen-answer-popup',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-block-fullscreen-popup d-answer-block-fullscreen-popup'
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        if (e.getTarget('.d-popup-close-all-button', 1))
            return this.onCloseAllButtonTap(e);
    },
    /**
     * @return {undefined}
     */
    initBars() {
        return false;
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            classList: [
                'x-container',
                'x-unsized'
            ],
            children: [{
                    reference: 'innerElement',
                    className: 'x-inner',
                    children: [
                        {
                            reference: 'topElement',
                            className: 'd-top-element',
                            children: [
                                {
                                    className: 'd-popup-close-button d-popup-close-all-button',
                                    html: CJ.t('view-block-fullscreen-answer-popup-close-all')
                                },
                                {
                                    className: 'd-popup-close-button d-popup-back-button',
                                    html: CJ.t('view-block-fullscreen-answer-popup-back')
                                }
                            ]
                        },
                        {
                            reference: 'contentElement',
                            className: 'd-content-element',
                            children: [{
                                    reference: 'blockElement',
                                    className: 'd-block-element'
                                }]
                        },
                        {
                            className: 'd-bottom-element',
                            children: [
                                {
                                    reference: 'bottomButtonElement',
                                    className: 'd-bottom-button-element'
                                },
                                {
                                    reference: 'bottomContentElement',
                                    className: 'd-bottom-content-element'
                                }
                            ]
                        }
                    ]
                }]
        };
    },
    /**
     * closes current answer popup and block's popup which is located
     * behind current one.
     * @param {Ext.Evented} e
     */
    onCloseAllButtonTap(e) {
        e.stopEvent();    // to prevent executing tapHandler in Ext.Viewport
        // to prevent executing tapHandler in Ext.Viewport
        CJ.PopupManager.hideAll();
    },
    /**
     * @param {Ext.Evented} e
     */
    onBottomButtonElementTap(e) {
        let url, state;
        if (this.getState() == 'comments') {
            state = 'answers';
            url = '!m/{0}/a/{1}';
        } else {
            state = 'comments';
            url = '!m/{0}/a/{1}/c';
        }
        CJ.History.replaceState(CJ.tpl(url, this.getBlock().getActivityId(), this.getBlockId()));
        this.setState(state);
    }
});