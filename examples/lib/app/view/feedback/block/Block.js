import 'app/view/block/DefaultBlock';
import 'app/view/feedback/Options';

/**
 * Defines a block that will be shown only after user submits an answer.
 */
Ext.define('CJ.view.feedback.block.Block', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.block.DefaultBlock',
    /**
     * @property {Array} alias
     */
    alias: [
        'widget.view-feedback-block',
        'widget.view-feedback-block-block'
    ],
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-default d-feedback-block',
        /**
         * @cfg {String} type Feedback's type, one of [completed, correct, wrong].
         */
        type: null,
        /**
         * @cfg {Object} bottomBar
         */
        bottomBar: null,
        /**
         * @cfg {Ext.XTemplate} headerTpl
         */
        headerTpl: Ext.create('Ext.XTemplate', '<div class="d-feedback-status d-feedback-status-{type}">', '<div class="d-icon"></div>', '<div class="d-message">', '{[ CJ.t("view-feedback-block-status-" + values.type) ]}', '</div>', '</div>')
    },
    /**
     * @return {Object}
     */
    getHeaderTplData() {
        return Ext.apply(this.callParent(args), { type: this.getType() });
    },
    /**
     * @inheritdoc
     */
    publish() {
        this.closeEditor();
        this.save();
    },
    /**
     * @inheritdoc
     */
    save() {
        this.applyChanges();
        this.setSaving(true);
        CJ.Block.prototype.save.call(this, {
            rpc: {
                model: 'Document',
                method: 'save_documents'
            },
            params: { data: [this.serialize()] }
        });
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
            block: this,
            xtype: 'view-block-edit-defaults-light-popup',
            title: 'view-feedback-options-editor-title',
            createButtonText: 'view-feedback-options-editor-button-edit',
            editorType: 'feedback',
            content: {
                xtype: 'view-block-edit-defaults-editor',
                block: this,
                activityTitle,
                list,
                // should be the last one in order to apply all items and
                // then set editing to each of them
                editing: true
            }
        });
        this.setEditor(popup.getContent());
    },
    /**
     * @return {Object}
     */
    serialize() {
        const data = this.callParent(args);
        Ext.apply(data, {
            // we allow users to use default-blocks as feedback-blocks, but we can't change their xtypes.
            xtype: CJ.view.block.DefaultBlock.xtype
        });
        return data;
    },
    /**
     * shows current block in a popup.
     * @return {undefined}
     */
    popup() {
        new CJ.core.view.LightPopup({
            cls: 'd-feedback-block-popup',
            content: this
        });
    },
    /**
     * feedback blocks don't have normal block behaviour like fullscreen mode, or expanded-state
     * @return {undefined}
     */
    onContentTap: Ext.emptyFn
});