import 'app/view/tool/link/Tool';

/**
 * Defines a tool that is used to show cards.
 */
Ext.define('CJ.view.tool.card.Tool', {
    extend: 'CJ.view.tool.link.Tool',
    alias: 'widget.view-tool-card-tool',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @cfg {Ext.XTemplate} previewTpl
         */
        previewTpl: Ext.create('Ext.XTemplate', '<div class=\'d-tool d-fake d-link d-card {[ values.values.cfg.broken ? \'d-broken\' : \'\' ]} {[ values.values.cfg.unsupported ? \'d-unsupported\' : \'\' ]}\' data-tool-index=\'{toolIndex}\'>', '<div class=\'x-inner\'>', '<div class=\'x-innerhtml\'>', '<tpl if="values.cfg.broken">', '<div class="d-hint">', '{[ CJ.app.t("tool-view-notfound") ]}', '</div>', '<div class="d-url">', '{code}', '</div>', '<div class="d-open-button d-notify">', '{[ CJ.app.t("notfoundcard-notfound") ]}', '</div>', '<tpl elseif="values.cfg.unsupported">', '<div class="d-hint">', '{[ CJ.app.t("tool-view-notsupported") ]}', '</div>', '<div class="d-open-button d-notify">', '{[ CJ.app.t("notfoundcard-notfound") ]}', '</div>', '<tpl else>', '<tpl if="values.cfg.thumb">', '<div class="d-thumbnail" style="background-image: url({values.cfg.thumb})"></div>', '<tpl else>', '<div class="d-thumbnail d-default" ></div>', '</tpl>', '<div class="d-details">', '<div class="d-title">', '{[ values.values.cfg.title || values.values.cfg.url ]}', '</div>', '<div class="d-link-url">', '{[ values.values.cfg.url ]}', '</div>', '<div class="d-description">', '{[ values.values.cfg.desc || values.values.cfg.url ]}', '</div>', '</div>', '</tpl>', '</div>', '</div>', '</div>', { compiled: true })
    },
    config: {
        /**
         * @cfg {Boolean} openOnTap
         */
        openOnTap: true,
        /**
         * @cfg {Boolean} fullscreen
         */
        fullscreen: false,
        /**
         * @cfg {String} cls
         */
        cls: 'd-tool d-link d-card'
    },
    /**
     * @inheritdoc
     */
    openTool() {
        this.setFullscreen(true);
    },
    /**
     * @param {Object|Boolean} config
     */
    applyFullscreen(config) {
        if (!config)
            return false;
        if (config == true)
            config = {};
        Ext.applyIf(config, {
            xtype: 'ux-cardFullscreen',
            link: this.getValues().cfg.url
        });
        return Ext.factory(config);
    },
    /**
     * @param {Object} newCmp
     */
    updateFullscreen(newCmp) {
        if (!newCmp)
            return;
        newCmp.renderTo(document.body);
        newCmp.show();
        newCmp.on('destroy', function () {
            this.setFullscreen(false);
        }, this);
    }
});