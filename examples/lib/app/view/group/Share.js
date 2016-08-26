import 'app/core/view/popup/Options';
import 'app/view/group/Invitations';

Ext.define('CJ.view.group.Share', {
    extend: 'CJ.core.view.popup.Options',
    alias: 'widget.view-group-share',
    statics: {
        /**
         * @param {Object} config
         * @param {CJ.view.group.Block} config.block
         * @return {CJ.core.view.Popup}
         */
        popup(config) {
            return Ext.factory({
                xtype: 'core-view-popup',
                cls: 'd-menu-popup d-popup-transparent',
                title: 'view-group-edit-form-get-members-popup',
                content: Ext.applyIf({ xtype: 'view-group-share' }, config),
                actionButton: { text: 'button-close-text' }
            });
        }
    },
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-menu-items d-group-share',
        /**
         * @cfg {Object} inviteButton
         */
        inviteButton: {},
        /**
         * @cfg {Object} copyButton
         */
        copyButton: {},
        /**
         * @cfg {Ext.Component} urlField
         */
        urlField: null
    },
    constructor() {
        this.callParent(args);
        this.setUrlField({});
    },
    /**
     * @param {Object} config
     * @return {Ext.Component|Boolean}
     */
    applyUrlField(config) {
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'urlfield',
            clearIcon: false,
            name: 'url',
            readOnly: true,
            value: this.getBlock().getUrl(),
            label: CJ.t('view-group-share-link-label'),
            labelAlign: 'bottom'
        }, config));
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     */
    updateUrlField(newComponent, oldComponent) {
        if (newComponent)
            newComponent.renderTo(this.element, this.element.dom.firstChild);
        if (oldComponent)
            oldComponent.destroy();
    },
    /**
     * @param {Object} config
     * @return {Object}
     */
    applyCopyButton(config) {
        CJ.Clipboard.copy({
            cmp: this,
            delegate: '.d-icon-clipboard',
            text: this.getBlock().getUrl()
        });
        return this.createButton({
            autoClosePopup: false,
            text: 'view-group-get-members-copy',
            cls: 'd-button d-icon-clipboard'
        });
    },
    /**
     * @param {Object} config
     * @return {Object}
     */
    applyInviteButton(config) {
        if (!config)
            return false;
        return this.createButton({
            text: 'view-group-get-members-invite',
            cls: 'd-button d-icon-group',
            handler: this.onInviteMembersButtonTap
        });
    },
    /**
     * @return {undefined}
     */
    onInviteMembersButtonTap() {
        CJ.view.group.Invitations.popup({ groupId: this.getBlock().getDocId() });
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.setUrlField(null);
        this.callParent(args);
    }
});