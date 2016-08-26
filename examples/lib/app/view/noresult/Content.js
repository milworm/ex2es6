import 'Ext/Component';

Ext.define('CJ.view.noresult.Content', {
    extend: 'Ext.Component',
    xtype: 'view-noresult-content',
    isNoContent: true,
    config: {
        cls: 'd-noresult-content',
        tpl: Ext.create('Ext.XTemplate', '<div class="d-image"></div>', '<div class="d-title">{[ CJ.t(values.title) ]}</div>', '<tpl if="showMessage">', '<div class="d-message">{[ CJ.t(values.message) ]}</div>', '</tpl>', { compiled: true }),
        data: {
            title: 'view-noresult-content-activities-title',
            message: 'view-noresult-content-message'
        },
        listeners: {
            tap: {
                element: 'element',
                delegate: '.d-button',
                fn: 'onButtonTap'
            }
        },
        showMessage: false
    },
    updateData(data) {
        Ext.apply(data, { showMessage: this.getShowMessage() });
        this.element.setHtml(this.getTpl().apply(data));
    },
    onButtonTap() {
        Ext.Viewport.buttons.setExpanded(true);
    }
});