import 'app/view/block/DefaultBlock';

Ext.define('CJ.view.solution.Block', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.block.DefaultBlock',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-solution-block',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-solution-block d-vbox',
        /**
         * @inheritdoc
         */
        bottomBar: null
    },
    /**
     * @inheritdoc
     */
    getElementConfig() {
        return {
            reference: 'element',
            children: [
                { classList: ['d-header'] },
                {
                    reference: 'innerElement',
                    classList: [
                        'x-inner',
                        'd-body',
                        'd-block-body'
                    ]
                }
            ]
        };
    },
    /**
     * @inheritdoc
     */
    onBlockCreated() {
        CJ.feedback(CJ.t('activity-created'));
    },
    /**
     * @return {undefined}
     */
    toEditState() {
        if (this.getEditor())
            return;
        const list = this.getList().serialize();
        const activityTitle = this.getActivityTitle();
        let popup;
        this.setActivityTitle(null);
        popup = Ext.factory({
            xtype: 'view-block-edit-defaults-light-popup',
            title: CJ.t('nav-popup-block-title'),
            block: this,
            content: {
                xtype: 'view-block-edit-defaults-editor',
                block: this,
                activityTitle,
                list,
                editing: true
            }
        });
        this.setEditor(popup.getContent());
    },
    /**
     * shows preview-block in fullscreen-popup.
     * @param {Object} config
     * @return {undefined}
     */
    popup(config) {
        CJ.Block.popup({
            cls: 'd-block-fullscreen-popup d-solution-popup',
            block: Ext.apply({ isModal: true }, this.initialConfig)
        });
    },
    publish() {
        this.closeEditor();
        this.save();
    },
    /**
     * solution blocks don't have normal block behaviour like fullscreen mode, or expanded-state
     * @return {undefined}
     */
    onContentTap: Ext.emptyFn,
    /**
     * @inheritdoc
     */
    serialize() {
        const result = this.callParent(args);
        return Ext.apply(result, { nodeCls: 'Solution' });
    }
});