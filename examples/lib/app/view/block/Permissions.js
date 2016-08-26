import 'Ext/Container';
import 'app/core/view/LightSegmentedButton';

Ext.define('CJ.view.block.Permissions', {
    extend: 'Ext.Container',
    alias: 'widget.view-block-permissions',
    mixins: { formable: 'CJ.view.mixins.Formable' },
    config: {
        /**
         * @cfg {String} layout
         */
        layout: 'light',
        /**
         * @cfg {String} cls
         */
        cls: 'd-permissions',
        /**
         * @cfg {Ext.Component} privacySelector
         */
        privacySelector: {},
        /**
         * @cfg {String} url
         */
        url: null,
        /**
         * @cfg {Ext.Component} block
         */
        block: null,
        /**
         * @cfg {Ext.Component} popup
         */
        popup: null,
        /**
         * @cfg {Object} values
         */
        values: {}
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            classList: [
                'x-container',
                'x-unsized'
            ],
            children: [
                {
                    reference: 'urlElement',
                    className: 'd-url'
                },
                {
                    reference: 'innerElement',
                    className: 'x-inner'
                }
            ]
        };
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     */
    updateBlock(block) {
        this.setUrl(!block.isShortcut);
    },
    /**
     * @param {String} url
     */
    updateUrl(url) {
        const el = this.urlElement;
        if (!url)
            return el.setHtml('');
        el.setHtml(Ext.String.format('{0}//{1}/#{2}', location.protocol, location.host, this.getBlock().getDocId()));
    },
    /**
     * @param {Object} config
     */
    applyPrivacySelector(config) {
        if (!config)
            return false;
        const visibilities = CJ.User.getAllowedDocumentVisibilities();
        return Ext.apply({
            xtype: 'view-light-segmented-button',
            cls: 'd-privacy',
            pressed: this.getValues().visibility,
            name: 'visibility',
            buttons: [
                {
                    text: CJ.app.t('block-shareid-public'),
                    value: 'public',
                    cls: 'd-public',
                    hidden: !visibilities['public']
                },
                {
                    text: CJ.app.t('block-shareid-portal'),
                    value: 'portal',
                    cls: 'd-portal',
                    hidden: !visibilities['portal']
                },
                {
                    text: CJ.app.t('block-shareid-private'),
                    value: 'private',
                    cls: 'd-private',
                    hidden: !visibilities['private']
                }
            ]
        }, config);
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     */
    updatePrivacySelector: CJ.Utils.updateComponent,
    /**
     * @param {CJ.core.view.Popup} popup
     */
    applyPopup(popup) {
        popup.on('actionbuttontap', this.onPopupActionButtonTap, this);
        return popup;
    },
    /**
     * handles popup's action button tap
     */
    onPopupActionButtonTap() {
        this.applyChanges();
        const values = this.getValues(), block = this.getBlock(), visibility = values.visibility;
        if (block.getDocVisibility() == visibility)
            return;
        this.request(visibility);
        return false;
    },
    request(visibility, confirmed) {
        this.mask({ xtype: 'loadmask' });
        CJ.request({
            rpc: {
                model: 'Document',
                method: 'set_visibility',
                id: this.getBlock().getDocId(),
                args: JSON.stringify([visibility]),
                kwargs: JSON.stringify({ confirmed })
            },
            stash: { visibility },
            success: this.onRequestSuccess,
            callback: this.onRequestCallback,
            scope: this
        });
    },
    onRequestCallback() {
        this.unmask();
    },
    onRequestSuccess(response, request) {
        const visibility = request.stash.visibility;
        switch (response.ret.status) {
        case 'changed':
            this.onChangedSuccess(visibility);
            break;
        case 'confirm':
            this.showConfirm(response.ret.reasons, visibility);
            break;
        }
    },
    onChangedSuccess(visibility) {
        this.getPopup().hide();
        this.getBlock().setDocVisibility(visibility);
        CJ.feedback();
    },
    showConfirm(reasons, visibility) {
        const title = 'view-block-shareid-confirm-title';
        let text;
        if (reasons.playlists || reasons.courses || reasons.maps) {
            text = CJ.app.t('view-block-shareid-confirm-text-activities');
        } else if (reasons.reuses) {
            text = 'view-block-shareid-confirm-text';
            if (reasons.reuses > 1)
                text += '-pluralize';
            text = CJ.app.t(text, true).replace('{0}', reasons.reuses);
        }
        CJ.confirm(title, text, function (result) {
            if (result != 'yes')
                return;
            this.request(visibility, true);
        }, this);
    }
});