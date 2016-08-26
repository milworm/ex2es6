import 'app/view/stream/header/Group';

Ext.define('CJ.view.phone.stream.header.Group', {
    extend: 'CJ.view.stream.header.Group',
    xtype: 'view-phone-stream-header-group',
    config: {
        collapsed: true,
        collapseButtonText: 'block-header-group-button-collapse',
        expandButtonText: 'block-header-group-button-expand',
        tpl: Ext.create('Ext.XTemplate', '<div class="d-image"></div>', '<tpl if="canEdit">', '<div class="d-change-image-button">', '{[CJ.t("block-header-button-change-image")]}', '<input type="file" class="invisible-stretch" />', '</div>', '</tpl>', '<div class="d-title">{name}</div>', '<div class="d-action-button"></div>', '<div class="d-collapsible">', '<div class="d-collapsible-inner">', '<div class="d-fields">', '<div class="d-description"></div>', '<div class="d-buttons">', '<span class="d-cancel">{[CJ.t("block-header-button-cancel")]}</span>', '<span class="d-save">{[CJ.t("block-header-button-save")]}</span>', '</div>', '</div>', '{stats}', '</div>', '</div>', '<div class="d-toggle-button"></div>', '{tabs}', '{notice}')
    }
});