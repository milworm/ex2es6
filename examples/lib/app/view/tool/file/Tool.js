import 'app/view/tool/media/Tool';

Ext.define('CJ.view.tool.file.Tool', {
    extend: 'CJ.view.tool.media.Tool',
    alias: 'widget.view-tool-file-tool',
    statics: {
        /**
         * @cfg {String} toolType
         */
        toolType: 'file',
        /**
         * @cfg {Ext.XTemplate} previewTpl
         */
        previewTpl: Ext.create('Ext.XTemplate', '<div class=\'d-tool d-fake d-file\' data-tool-index=\'{toolIndex}\'>', '<a href=\'{values.cfg.url}\' target=\'_blank\' onclick=\'return false;\'>', '<div class=\'type {values.cfg.ext}\'></div>', '<div class=\'d-info\'>{values.cfg.name}</div>', '</a>', '</div>')
    },
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-tool d-file',
        /**
         * @cfg {Ext.XTemplate} previewTpl
         */
        previewTpl: Ext.create('Ext.XTemplate', '<a href="{cfg.url}" target="_blank" onclick="return false;">', '<div class="type {cfg.ext}"></div>', '<div class=\'d-info\'>{cfg.name}</div>', '</a>')
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
    },
    /**
     * file tool doesn't have any listeners on tap.
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        if (e.getTarget('.d-menu', 10))
            return;
        window.open(this.getValues().cfg.url, '_blank');
    }
});