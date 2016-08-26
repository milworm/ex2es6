import 'app/view/tool/link/Tool';

/**
 * Defines a component that is used to show custom tools.
 */
Ext.define('CJ.view.tool.custom.Tool', {
    extend: 'CJ.view.tool.link.Tool',
    alias: 'widget.view-tool-custom-tool',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @property {Ext.XTemplate} previewTpl
         */
        previewTpl: Ext.create('Ext.XTemplate', '<div class=\'d-tool d-fake d-custom\' data-tool-index=\'{toolIndex}\'>', '<div class=\'x-inner\'>', '{values.cfg.html}', '</div>', '</div>', { compiled: true })
    },
    config: {
        /**
         * @cfg {Boolean} openOnTap
         */
        openOnTap: false,
        /**
         * @cfg {String} cls
         */
        cls: 'd-tool d-custom'
    },
    /**
     * @param {String} html
     * @return {undefined}
     */
    setHtml(html) {
        this._html = html;
        this.updateHtml(html);
    },
    /**
     * @return {undefined}
     */
    renderPreviewTpl() {
        this.setHtml(this.getValues().cfg.html);
    },
    /**
     * @return {undefined}
     */
    onElementTap() {
        return false;
    }
});