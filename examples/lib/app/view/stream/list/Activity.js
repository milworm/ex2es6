import 'app/view/stream/list/Base';

/**
 * Defines a base class that we use to display list of items in stream-container.
 */
Ext.define('CJ.view.stream.list.Activity', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.stream.list.Base',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-stream-list-activity',
    /**
     * @inheritdoc
     */
    renderNoContent() {
        const type = CJ.Utils.getTagType(Ext.Viewport.getPageTags());
        const buttons = Ext.Viewport.buttons;
        let showMessage;
        let title;
        if (!buttons.isHidden() && buttons.getButtons().activity)
            showMessage = true;
        if (type == 'feed')
            title = 'feed-emptyresultslabel-text';
        else
            title = 'view-noresult-content-activities-title';
        this.renderItems({
            xtype: 'view-noresult-content',
            data: {
                title,
                message: 'view-noresult-content-message'
            },
            showMessage
        });
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @return {undefined}
     */
    adjustContaining(block) {
        // for courses we have separated tab.
        if (block.isContentBlock && !block.isCourse)
            this.callParent(args);
    }
});