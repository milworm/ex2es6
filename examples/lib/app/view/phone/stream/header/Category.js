import 'app/view/stream/header/Category';

Ext.define('CJ.view.phone.stream.header.Category', {
    extend: 'CJ.view.stream.header.Category',
    xtype: 'view-phone-stream-header-category',
    config: {
        collapsed: true,
        collapseButtonText: 'block-header-category-button-collapse',
        expandButtonText: 'block-header-category-button-expand',
        tpl: Ext.create('Ext.XTemplate', '<div class="d-image"></div>', '<div class="d-icon" style="background-image: url(\'{icon}\')"></div>', '<div class="d-title">', '<div class="d-title-inner">', '<span class="name">{name}</span>', '</div>', '</div>', '<div class="d-action-button"></div>', '<div class="d-collapsible">', '<div class="d-collapsible-inner">', '<div class="d-fields">', '<div class="d-description">{description}</div>', '</div>', '{stats}', '</div>', '</div>', '<div class="d-toggle-button"></div>', '{tabs}', { compiled: true })
    }
});