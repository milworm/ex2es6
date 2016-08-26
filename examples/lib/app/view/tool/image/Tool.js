import 'app/view/tool/media/Tool';

/**
 * Defines a component that is used to show only the images.
 */
Ext.define('CJ.view.tool.image.Tool', {
    extend: 'CJ.view.tool.media.Tool',
    alias: 'widget.view-tool-image-tool',
    statics: {
        /**
         * @cfg {String} toolType
         */
        toolType: 'image',
        /**
         * @property {Ext.Template} previewTpl
         */
        previewTpl: Ext.create('Ext.Template', '<div class=\'d-tool d-image d-fake\' data-tool-index=\'{toolIndex}\'></div>', { compiled: true })
    },
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-tool d-image',
        /**
         * @cfg {Ext.XTemplate} previewTpl
         */
        previewTpl: Ext.create('Ext.XTemplate', '<tpl if=\'values.scope.isImageLoaded\'>', '<img src=\'{[ this.generateUrl(values) ]}\'/>', '<tpl else>', '<div class=\'d-image-wrapper\' style=\'padding-top: {[ 100 / (values.ratio || 1) ]}%\'>', '<img src=\'{[ this.generateUrl(values) ]}\'/>', '</div>', '</tpl>', {
            compiled: true,
            generateUrl(values) {
                const scope = values.scope;
                let url;
                if (scope.isImageLoaded) {
                    url = values.cfg.url;
                    scope.removeCls('d-loading');
                } else {
                    url = `${ Core.opts.resources_root }/resources/images/loaders/loader.gif`;
                    scope.addCls('d-loading');
                }
                return url;
            }
        })
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
    },
    onElementTap(evt) {
        if (this.getEditing())
            return;
        const popup = Ext.factory({
            xtype: 'core-view-popup',
            cls: 'd-full-image-popup',
            overlayCls: 'd-popup-overlay d-dark',
            titleBar: false,
            fitMode: true,
            content: {
                xtype: 'core-view-full-image',
                image: this.getValues().cfg.url,
                controls: true
            }
        });
    },
    updateValues(values) {
        this.preloadImage(values.cfg.url);
    }
});