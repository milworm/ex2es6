import 'app/view/stream/header/User';

Ext.define('CJ.view.phone.stream.header.User', {
    extend: 'CJ.view.stream.header.User',
    xtype: 'view-phone-stream-header-user',
    config: {
        collapsed: true,
        collapseButtonText: 'block-header-user-button-collapse',
        expandButtonText: 'block-header-user-button-expand',
        tpl: Ext.create('Ext.XTemplate', '<div class="d-image"></div>', '<tpl if="canEdit">', '<div class="d-change-image-button">', '{[CJ.t("block-header-button-change-image")]}', '<input type="file" class="invisible-stretch" />', '</div>', '</tpl>', '<div class="d-icon"></div>', '<div class="d-title">', '<div class="d-title-inner">', '<span class="name">{name}</span>', '<span class="user">{user}</span>', '<br />', '<tpl if="role">', '<span class="role">{role}</span>', '</tpl>', '<tpl if="role && company">', '<span class="at"></span>', '</tpl>', '<tpl if="company">', '<span class="company">{company}</span>', '</tpl>', '</div>', '</div>', '<div class="d-action-button"></div>', '<div class="d-collapsible">', '<div class="d-collapsible-inner">', '<div class="d-fields">', '<div class="d-description"></div>', '<div class="d-url"></div>', '<div class="d-buttons">', '<span class="d-cancel">{[CJ.t("block-header-button-cancel")]}</span>', '<span class="d-save">{[CJ.t("block-header-button-save")]}</span>', '</div>', '</div>', '{stats}', '</div>', '</div>', '<div class="d-toggle-button"></div>', '{tabs}', { compiled: true })
    }
});