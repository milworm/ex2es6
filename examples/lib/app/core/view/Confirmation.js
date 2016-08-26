import 'app/core/view/Popup';

Ext.define('CJ.core.view.Confirmation', {
    extend: 'CJ.core.view.Popup',
    xtype: 'core-view-confirmation',
    config: {
        cls: 'confirmation',
        title: 'Are you sure?',
        attention: false,
        content: true
    },
    updateAttention(config) {
        this[config ? 'addCls' : 'removeCls']('attention');
    },
    applyContent(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        Ext.applyIf(config, {
            xtype: 'core-view-component',
            type: 'light',
            tpl: [
                '<div class="d-buttons">',
                '<tpl for="buttons">',
                '<div class="d-button" data-action="{action}">',
                '{[CJ.t(values.text)]}',
                '</div>',
                '</tpl>',
                '</div>'
            ],
            data: {
                buttons: [{
                        action: 'confirm',
                        text: 'Confirm!'
                    }]
            },
            listeners: {
                tap: {
                    element: 'element',
                    delegate: '.d-button',
                    fn: this.onButtonTap,
                    scope: this
                }
            }
        });
        return this.callParent([config]);
    },
    onButtonTap(e) {
        const buttonEl = e.getTarget('.d-button', false, true), action = buttonEl.getAttribute('data-action');
        this.fireEvent(action, this);
        this.hide();
    }
});