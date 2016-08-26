import 'app/core/view/Popover';

/**
 * The class provides the tooltip component.
 * @class CJ.view.tooltip.Tooltip
 */
Ext.define('CJ.view.tooltip.Tooltip', {
    /**
     * @inheritdoc
     */
    extend: 'CJ.core.view.Popover',
    /**
     * @inheritdoc
     */
    xtype: 'view-tooltip',
    /**
     * @inheritdoc
     */
    isPopover: false,
    /**
     * @inheritdoc
     */
    config: {
        /**
         * @inheritdoc
         */
        baseCls: 'd-core-view-popover d-tooltip',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-tooltip-inner',
        /**
         * @inheritdoc
         */
        tpl: ['<div class="d-message">{text}</div>'],
        /**
         * Text of a tooltip.
         * @config {String} text
         */
        text: null,
        /**
         * Group of a tooltip.
         * @cfg {String} group
         */
        group: null,
        closeOnTap: false
    },
    /**
     * Sets the text of the tooltip.
     * @param {String} text
     */
    updateText(text) {
        this.setData({ text: CJ.t(text) });
    }
});