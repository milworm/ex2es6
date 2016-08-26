import 'app/view/block/options/Base';

/**
 * Defines a component to show set of options for answer-block only.
 */
Ext.define('CJ.view.block.options.Answer', {
    extend: 'CJ.view.block.options.Base',
    alias: 'widget.view-block-options-answer',
    config: {
        /**
         * @cfg {String} deleteConfirmationText
         */
        deleteConfirmationText: 'tool-answermenu-confirmtext',
        /**
         * @cfg {Ext.Button} permissionsButton
         */
        permissionsButton: false,
        /**
         * @cfg {Ext.Button} editButton
         */
        editButton: false
    },
    /**
     * @param {Object} config
     */
    applyDeleteButton(config) {
        if (!config)
            return false;    // delete button should be visible only for owner of the question,
                             // if question's canRetry is true, we shouldn't allow user to delete
                             // an answer from options-popup, only by clicking on retry-button.
        // delete button should be visible only for owner of the question,
        // if question's canRetry is true, we shouldn't allow user to delete
        // an answer from options-popup, only by clicking on retry-button.
        if (!CJ.User.isMine(this.getBlock().getQuestion()))
            return false;
        if (config == true)
            config = {};
        return this.createButton(Ext.applyIf(config, {
            text: 'block-popup-options-delete',
            cls: 'd-button d-icon-delete',
            handler: this.onDeleteButtonTap
        }));
    },
    /**
     * makes an ajax request to remove the block
     * @param {String} confirm [yes, no]
     * @return {undefined}
     */
    deleteBlock(confirm) {
        if (confirm != 'yes')
            return;
        CJ.request({
            rpc: {
                model: 'Answer',
                method: 'delete_answer'
            },
            params: { docId: this.getBlock().getDocId() },
            scope: this,
            success: this.onDeleteBlockSuccess
        });
    },
    /**
     * will be called after block has been successfully deleted on the server.
     */
    onDeleteBlockSuccess() {
        const block = this.getBlock();
        block.fireEvent('deleted', block);
    }
});