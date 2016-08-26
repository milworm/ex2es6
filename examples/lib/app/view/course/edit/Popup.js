import 'app/core/view/Popup';

/**
 * Defines a popup for editing a course.
 */
Ext.define('CJ.view.course.edit.Popup', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Popup',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-edit-popup',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @inheritdoc
         */
        isHistoryMember: true,
        /**
         * @cfg {Boolean} isUrlLessHistoryMemeber
         */
        isUrlLessHistoryMemeber: true,
        /**
         * @cfg {String} cls
         */
        cls: 'd-course-popup',
        /**
         * @cfg {Boolean} fitMode
         */
        fitMode: true,
        /**
         * @cfg {Object|Boolean} titleBar
         */
        titleBar: false,
        /**
         * @cfg {Number} blockId
         */
        blockId: null,
        /**
         * @cfg {Boolean|Object} closeConfirm
         */
        closeConfirm: {
            title: 'nav-popup-block-close-title',
            message: 'nav-popup-block-close-message'
        }
    },
    /**
     * @param {String} result
     */
    onCloseConfirmHandler(result) {
        if (result == 'no')
            return;
        const block = this.getContent().getBlock();
        if (block)
            block.setEditing(false);
        else
            this.hide();    // need to wait some time because hiding uses animation.
                            // if user made forward direction and clicked "yes" on this confirm
                            // we need to process all other popups behind this if needed.
        // need to wait some time because hiding uses animation.
        // if user made forward direction and clicked "yes" on this confirm
        // we need to process all other popups behind this if needed.
        Ext.defer(() => {
            if (CJ.app.getHistory().isHashUpdated())
                CJ.PopupManager.onForwardHistoryStep();
        }, 250);
    }
});