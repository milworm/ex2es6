import 'app/view/block/edit/defaults/Popup';

Ext.define('CJ.view.block.edit.defaults.HintsPopup', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.block.edit.defaults.Popup',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-block-edit-defaults-hints-popup',
    /**
     * @inheritdoc
     */
    onCreateTap(button) {
        if (!this.isActionAccessible())
            return;
        let block = this.getBlock();
        if (block.isPlaylist) {
            this.getContent().applyItemChanges(this.getActiveItemIndex());
            button.setDisabled(true);
            block.setState('review');
        } else {
            if (!block.isInstance)
                block = Ext.factory(Ext.apply({
                    xtype: 'view-block-default-block',
                    editor: this.getContent(),
                    editing: true
                }, block));
            block.publish();
        }
    }
});