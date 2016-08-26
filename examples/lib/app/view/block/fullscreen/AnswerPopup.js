import 'app/view/block/fullscreen/Popup';

Ext.define('CJ.view.block.fullscreen.AnswerPopup', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.block.fullscreen.Popup',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-block-fullscreen-answer-popup',
    /**
     * answer popup doesn't have any bars.
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
                            reference: 'leftElement',
                            className: 'd-left-element'
                        },
                        {
                            reference: 'blockElement',
                            className: 'd-block-element'
                        },
                        {
                            reference: 'tabElement',
                            className: 'd-tab-element'
                        },
                        {
                            reference: 'rightElement',
                            className: 'd-right-element'
                        },
                        {
                            className: 'd-buttons-element',
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
                        }
                    ]
                }]
        };
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
     * @param {Ext.Evented} e
     */
    onCloseAllButtonTap(e) {
        e.stopEvent();
        CJ.PopupManager.hideAll();
    }
});