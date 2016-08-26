import 'app/view/block/edit/defaults/Popup';

Ext.define('CJ.view.block.edit.defaults.LightPopup', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.block.edit.defaults.Popup',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-block-edit-defaults-light-popup',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Object} leftButton
         */
        leftButton: null,
        /**
         * @cfg {Object} rightButton
         */
        rightButton: null,
        /**
         * @cfg {Object} content
         */
        content: {
            xtype: 'view-block-edit-defaults-editor',
            editing: true,
            question: false,
            light: true,
            activityTitle: {},
            list: {
                xtype: 'core-view-list-editor',
                items: { xtype: 'view-tool-text' }
            }
        }
    },
    /**
     * do nothing here, because we feedback-editor doesn't have buttons.
     * @return {undefined}
     */
    configureButtons: Ext.emptyFn,
    /**
     * method will be called when user taps on create-activity button in the editor.
     */
    onCreateTap() {
        if (!this.isActionAccessible())
            return;
        let block = this.getBlock();
        const editor = this.getContent();
        if (!block.isInstance)
            block = Ext.factory(Ext.apply({
                editor,
                editing: true
            }, block));
        block.publish();
    },
    refreshLabels() {
        if (this.initialConfig.editorType == 'feedback')
            return;
        return this.callParent(args);
    }
});