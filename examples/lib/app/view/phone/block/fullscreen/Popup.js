import 'app/view/block/fullscreen/Popup';

Ext.define('CJ.view.phone.block.fullscreen.Popup', {
    extend: 'CJ.view.block.fullscreen.Popup',
    alias: 'widget.view-phone-block-fullscreen-popup',
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
            children: [
                {
                    reference: 'innerElement',
                    classList: [
                        'x-inner',
                        'd-scroll'
                    ],
                    children: [
                        {
                            reference: 'blockElement',
                            className: 'd-block-element'
                        },
                        {
                            reference: 'tabElement',
                            className: 'd-tab-element'
                        }
                    ]
                },
                {
                    reference: 'closeElement',
                    className: 'd-popup-close-button',
                    html: CJ.t('button-close-text')
                }
            ]
        };
    },
    expand() {
        this.addCls('d-expanded d-expanded-shown');
    },
    toCommentsState(oldState) {
        this.expand();
        this.setTabLoading(true);
        this.addCls('d-state-comments');
        CJ.Comment.loadFullItems(this.getBlock().getDocId(), {
            scope: this,
            success: this.onCommentsLoadSuccess
        });
    },
    toAnswersState(oldState) {
        this.expand();
        this.setTabLoading(true);
        this.addCls('d-state-answers');
        CJ.view.answers.List.initialLoad(this.getBlock().getDocId(), {
            groupId: this.initialConfig.answersGroupId,
            loadMask: false,
            scope: this,
            success: this.onAnswersLoadSuccess
        });
        delete this.initialConfig.answersGroupId;
    },
    toCollapsedState(oldState) {
        this.addCls('d-state-collapsed d-state-collapsed-shown');
    },
    /**
     * renders comments and scrolls to a field.
     * @return {undefined}
     */
    onCommentsLoadSuccess() {
        this.callParent(args);
        this.getTab().scrollToField();
    }
});