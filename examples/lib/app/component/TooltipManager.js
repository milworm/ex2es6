/**
 * The class provides a registry for tooltips,
 * with abilities show and hide groups of tooltips.
 * @class CJ.component.TooltipManager
 */
Ext.define('CJ.component.TooltipManager', {
    /**
     * @inheritdoc
     */
    alternateClassName: 'CJ.TooltipManager',
    /**
     * @inheritdoc
     */
    singleton: true,
    /**
     * @inheritdoc
     */
    config: {
        /**
         * If true, allows tooltips in the app.
         * @cfg {Boolean} allowTooltips
         */
        allowTooltips: false,
        /**
         * Array of initialized tooltips.
         * @property {Array} tooltips
         */
        tooltips: [],
        /**
         * Configs properties for a tooltip by default.
         * @config {Object} defaults
         */
        defaults: { xtype: 'view-tooltip' }
    },
    /**
     * @inheritdoc
     */
    constructor() {
        this.callParent(args);
        this.initConfig(this.config);
    },
    /**
     * Creates a tooltip for the component.
     * @param {Object} config
     * @param {Ext.Component} component
     */
    initTooltip(config, component) {
        if (!this.getAllowTooltips())
            return false;
        if (!Ext.os.is.Desktop)
            return false;
        const group = config.group;
        if (group) {
            const hiddenTips = CJ.User.get('hiddenTips');
            if (hiddenTips.indexOf(group) != -1)
                return false;
        }
        const tooltips = this.getTooltips();
        let tooltip;
        Ext.apply(config, {
            target: component.element.dom,
            listeners: {
                destroy: this.onTooltipDestroy,
                scope: this
            }
        }, this.getDefaults());
        tooltip = Ext.factory(config);
        tooltips.push(tooltip);
        return tooltip;
    },
    /**
     * Handler of the event 'destroy' of a tooltip.
     * @param {CJ.view.tooltip.Tooltip} tooltip
     */
    onTooltipDestroy(tooltip) {
        const tooltips = this.getTooltips(), index = tooltips.indexOf(tooltip);
        if (index != -1)
            tooltips.splice(index, 1);
    },
    /**
     * Shows a group of tooltips.
     * @param {String/Array} group
     * @param {Boolean} [skipAnimation] If true, it will be shown without an animation effect.
     */
    showGroup(group) {
        group = Ext.isArray(group) ? group : [group];
        Ext.each(this.getTooltips(), tooltip => {
            const tooltipGroup = tooltip.getGroup();
            if (group.indexOf(tooltipGroup) != -1)
                tooltip.show();
        });
    },
    /**
     * Hides a group of tooltips.
     * @param {String/Array} group
     * @param {Boolean} [skipAnimation] If true, it will be hidden without an animation effect.
     * @param {Boolean} [destroy] If true, will be destroyed after hiding.
     * @param {Boolean} [forever] If true, will make a request to the server to hide forever.
     */
    hideGroup(group, forever) {
        group = Ext.isArray(group) ? group : [group];
        Ext.each(this.getTooltips(), tooltip => {
            const tooltipGroup = tooltip.getGroup();
            if (group.indexOf(tooltipGroup) != -1)
                tooltip.close();
        }, this, true);
        if (forever)
            this.hideForever(group);
    },
    /**
     * Makes a request to the server to hide a group of tooltips forever.
     * @param {Array} group
     */
    hideForever(group) {
        return;    // @TODO we don't support tooltips for now.
        // @TODO we don't support tooltips for now.
        CJ.request({
            rpc: {
                model: 'PortalUser',
                method: 'hide_tips'
            },
            params: { tips: group },
            success: this.onHideForeverSuccess,
            scope: this
        });
    },
    /**
     * Handler of success request to the server to hide a group of tooltips forever.
     * @param {Object} response
     */
    onHideForeverSuccess(response) {
        CJ.User.set('hiddenTips', response.ret);
    }
});