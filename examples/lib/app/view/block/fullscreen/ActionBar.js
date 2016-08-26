import 'Ext/Component';

/**
 * Defines a bar that is used to show assign/share ... buttons when popup is
 * opened in fullscreen mode.
 */
Ext.define('CJ.view.block.fullscreen.ActionBar', {
    extend: 'Ext.Component',
    alias: 'widget.view-block-fullscreen-action-bar',
    config: {
        /**
         * @cfg {CJ.view.block.BaseBlock} block
         */
        block: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-action-bar',
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Array} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class=\'d-button d-repost\' data-value=\'repost\'>', '<span>{repost}</span>', '</div>', '<div class=\'d-button d-share\' data-value=\'share\'>', '<span>{share}</span>', '</div>', { compiled: true }),
        /**
         * @cfg {Object} listeners
         */
        listeners: {
            tap: {
                fn: 'onButtonTap',
                element: 'element',
                delegate: '.d-button'
            }
        }
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        Ext.apply(data, {
            repost: CJ.t('view-block-fullscreen-repost'),
            share: CJ.t('view-block-fullscreen-share')
        });
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @param {CJ.view.block.BaseBlock} newBlock
     * @param {CJ.view.block.BaseBlock} oldBlock
     */
    updateBlock(newBlock, oldBlock) {
        const link = newBlock.getUrl();
        CJ.Clipboard.copy({
            cmp: this,
            text: link,
            delegate: '.d-share'
        });
    },
    /**
     * @param {Ext.Evented} e
     * @param {Ext.dom.Element} button
     */
    onButtonTap(e) {
        const button = e.getTarget('.d-button'), value = CJ.Utils.getNodeData(button, 'value'), method = CJ.tpl('on{0}ButtonTap', CJ.capitalize(value));
        this[method]();
    },
    /**
     * method will be called when user taps on repost-button in the left-bar
     * @return {undefined}
     */
    onRepostButtonTap() {
        const block = this.getBlock();
        if (block.isPlaylist)
            CJ.view.block.Assign.popup({ block });
        else
            CJ.view.block.Repost.popup({ block });
    }
});