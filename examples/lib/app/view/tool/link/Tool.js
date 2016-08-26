import 'app/view/tool/media/Tool';
import 'app/view/tool/link/Editing';

/**
 * Defines a component to show different types of files except
 * images, video and audio files.
 */
Ext.define('CJ.view.tool.link.Tool', {
    extend: 'CJ.view.tool.media.Tool',
    alias: 'widget.view-tool-link-tool',
    statics: {
        /**
         * @cfg {String} toolType
         */
        toolType: 'link',
        /**
         * @cfg {Ext.XTemplate} previewTpl
         */
        previewTpl: Ext.create('Ext.XTemplate', '<div class=\'d-tool d-fake d-link {[ values.values.cfg.broken ? \'d-broken\' : \'\' ]} {[ values.values.cfg.unsupported ? \'d-unsupported\' : \'\' ]}\' data-tool-index=\'{toolIndex}\'>', '<div class=\'x-inner\'>', '<div class=\'x-innerhtml\'>', '<tpl if="values.cfg.broken">', '<div class="d-hint">', '{[ CJ.t("tool-view-notfound") ]}', '</div>', '<div class="d-url">', '{code}', '</div>', '<div class="d-open-button d-notify">', '{[ CJ.t("notfoundcard-notfound") ]}', '</div>', '<tpl elseif="values.cfg.unsupported">', '<div class="d-hint">', '{[ CJ.t("tool-view-notsupported") ]}', '</div>', '<div class="d-open-button d-notify">', '{[ CJ.t("notfoundcard-notfound") ]}', '</div>', '<tpl else>', '<tpl if="values.cfg.thumb">', '<div class="d-thumbnail" style="background-image: url({values.cfg.thumb})"></div>', '<tpl else>', '<div class="d-thumbnail d-default" ></div>', '</tpl>', '<div class="d-details">', '<div class="d-title">', '{[ values.values.cfg.title || values.values.cfg.url ]}', '</div>', '<div class="d-link-url">', '{[ values.values.cfg.url ]}', '</div>', '<div class="d-description">', '{[ values.values.cfg.desc || values.values.cfg.url ]}', '</div>', '</div>', '</tpl>', '</div>', '</div>', '</div>', { compiled: true })
    },
    config: {
        /**
         * @cfg {Boolean} openOnTap Should be true if tool show automatically
         *                          open it's url when user taps on it.
         */
        openOnTap: true,
        /**
         * @cfg {String} cls
         */
        cls: 'd-tool d-link',
        /**
         * @cfg {Ext.XTemplate} previewTpl
         */
        previewTpl: Ext.create('Ext.XTemplate', '{[ values.scope.updateToolCls(values) ]}', '<tpl if="values.cfg.broken">', '<div class="d-hint">', '{[ CJ.app.t("tool-view-notfound") ]}', '</div>', '<div class="d-url">', '{code}', '</div>', '<tpl if="!values.scope.getEditing()">', '<div class="d-open-button d-notify">', '{[ CJ.app.t("notfoundcard-notfound") ]}', '</div>', '</tpl>', '<tpl elseif="values.cfg.unsupported">', '<div class="d-hint">', '{[ CJ.app.t("tool-view-notsupported") ]}', '</div>', '<tpl if="!values.scope.getEditing()">', '<div class="d-open-button d-notify">', '{[ CJ.app.t("notfoundcard-notfound") ]}', '</div>', '</tpl>', '<tpl else>', '<tpl if="values.cfg.thumb">', '<div class="d-thumbnail" style="background-image: url({cfg.thumb})"></div>', '<tpl else>', '<div class="d-thumbnail d-default"></div>', '</tpl>', '<div class="d-details">', '<div class="d-title">', '{[ values.cfg.title || values.cfg.url ]}', '</div>', '<div class="d-link-url">', '{[ values.cfg.url ]}', '</div>', '<div class="d-description">', '{[ values.cfg.desc || values.cfg.url ]}', '</div>', '</div>', '</tpl>', { compiled: true })
    },
    /**
     * simply opens url in new tab
     * @param {Ext.Event} e
     */
    onElementTap(e) {
        if (e.getTarget('.d-menu', 10))
            return;
        if (e.getTarget('.d-notify', 1))
            return this.onNotifyButtonTap(e);
        if (this.getOpenOnTap())
            this.openTool();
    },
    /**
     * simply opens a tool when user clicks on it
     * @return {undefined}
     */
    openTool() {
        const cfg = this.getValues().cfg;
        if (cfg.broken)
            return;
        window.open(cfg.url, '_blank');
    },
    /**
     * simply updates tool's cls in case when link is broken
     * @param {Object} values
     * @return {undefined}
     */
    updateToolCls(values) {
        this.removeCls([
            'd-broken',
            'd-unsupported'
        ]);
        if (values.cfg.broken)
            this.addCls('d-broken');
        else if (values.cfg.unsupported)
            this.addCls('d-unsupported');
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onNotifyButtonTap(e) {
        e.stopEvent();
        e.getTarget('.d-notify').innerHTML = CJ.app.t('notfoundcard-notfound-notified');
        CJ.Ajax.request({
            url: CJ.constant.request.embedSupport,
            params: {
                code: CJ.Utils.base64Encode(this.getValues().code),
                docId: CJ.Utils.getBlockFromEvent(e).getDocId()
            }
        });
    }
});