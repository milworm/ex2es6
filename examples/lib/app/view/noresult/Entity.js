import 'Ext/Component';

Ext.define('CJ.view.noresult.Entity', {
    extend: 'Ext.Component',
    xtype: 'view-noresult-entity',
    config: {
        cls: 'd-noresult-entity',
        tpl: [
            '<div class="d-label">{[CJ.t(values.label)]}</div>',
            '<div class="d-button">{[CJ.t(values.action)]}</div>'
        ],
        tapListeners: { '.d-button': 'onButtonTap' }
    },
    onButtonTap() {
        this.fireEvent('action', this);
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    }
});