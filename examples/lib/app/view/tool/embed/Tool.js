import 'app/view/tool/link/Tool';

/**
 * Defines a component that is used to show embed tools.
 */
Ext.define('CJ.view.tool.embed.Tool', {
    extend: 'CJ.view.tool.link.Tool',
    alias: 'widget.view-tool-embed-tool',
    hasCover: true,
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @property {Ext.XTemplate} previewTpl
         */
        previewTpl: Ext.create('Ext.XTemplate', '<div class=\'d-tool d-fake d-embed d-iframe\' data-tool-index=\'{toolIndex}\'>', '<div class=\'x-inner\'>', '<tpl if="values.cfg.cover == \'soft\'">', '<div class="d-cover d-soft"></div>', '</tpl>', '<tpl if="values.cfg.cover == \'hard\'">', '<div class="d-cover d-hard" style="background-image: url(\'{values.cfg.thumb}\')">', '</div>', '</tpl>', '</div>', '</div>', { compiled: true })
    },
    config: {
        /**
         * @cfg {Boolean} openOnTap
         */
        openOnTap: false,
        /**
         * @cfg {Boolean} isCovered
         */
        isCovered: true,
        /**
         * @cfg {String} cls
         */
        cls: 'd-tool d-embed d-iframe',
        /**
         * @cfg {Ext.XTemplate} previewTpl
         */
        previewTpl: Ext.create('Ext.XTemplate', '<tpl if="values.scope.getIsCovered()">', '<tpl if="values.cfg.cover == \'soft\'">', '<div class="d-cover d-soft"></div>', '</tpl>', '<tpl if="values.cfg.cover == \'hard\'">', '<div class="d-cover d-hard" style="background-image: url(\'{cfg.thumb}\')">', '</div>', '</tpl>', '<tpl else>', '<iframe id="Iframe" ', 'type="text/html" ', 'width="100%" ', 'height="100%" ', 'src="{cfg.url}" ', 'frameBorder="0" ', 'allowfullscreen>', '</iframe>', '</tpl>', { compiled: true })
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        if (!e.getTarget('.d-cover', 10))
            return;    // we replace fake-node with tool's element, so after this method
                       // e.target will still reference to deleted node, which could cause
                       // a bug in popup (in case when we need to hide popup when user taps
                       // on overlay, e.getTarget(".d-block") -> null)
        // we replace fake-node with tool's element, so after this method
        // e.target will still reference to deleted node, which could cause
        // a bug in popup (in case when we need to hide popup when user taps
        // on overlay, e.getTarget(".d-block") -> null)
        e.stopEvent();
        this.onCoverTap();
    },
    /**
     * @return {undefined}
     */
    onCoverTap() {
        this[this.getIsCovered() ? 'uncover' : 'cover']();
    },
    /**
     * simply uncovers this tool and cover all other uncovered tools.
     */
    uncover() {
        Ext.each(Ext.ComponentQuery.query('[hasCover]'), function (cmp) {
            if (cmp != this)
                cmp.cover();
        }, this);
        this.setIsCovered(false);
    },
    /**
     * simply covers the tool
     */
    cover() {
        this.setIsCovered(true);
    },
    toEditState() {
        this.cover();
        this.callParent(args);
    },
    /**
     * @param {Boolean} state
     */
    updateIsCovered(state) {
        if (!this.initialized)
            return;
        this.renderPreviewTpl();
    },
    /**
     * stops playing the embed.
     */
    stopPlaying() {
        this.cover();
    }
});