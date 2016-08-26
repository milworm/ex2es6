import 'Ext/Component';

Ext.define('CJ.view.noresult.Route', {
    extend: 'Ext.Component',
    xtype: 'view-noresult-route',
    config: {
        cls: 'd-noresult-route',
        tpl: [
            '<div class="d-image"></div>',
            '<div class="d-title">{[CJ.t(values.title)]}</div>',
            '<div class="d-message">{[CJ.t(values.message)]}</div>'
        ],
        data: {
            title: 'view-noresult-route-title',
            message: 'view-noresult-route-message'
        }
    }
});