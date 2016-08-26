import 'app/core/view/Component';
import 'app/view/notifications/List';

/**
 * Class provides notifications button with ability to show the count of 'unseen' notifications
 * and shows the notifications popup on tap.
 */
Ext.define('CJ.view.notifications.Button', {
    extend: 'CJ.core.view.Component',
    xtype: 'view-notifications-button',
    config: {
        type: 'light',
        cls: 'd-button',
        text: 'nav-slidemenu-notifications',
        data: {},
        tpl: Ext.create('Ext.Template', '<span class="d-text">{text}</span>', '<span class="d-unseen"></span>', { compiled: true }),
        unseen: null,
        tapListeners: { '*': 'onTap' }
    },
    /**
     * Initializes component.
     */
    initialize() {
        this.callParent(args);
        CJ.on('notification.button.update', this.setUnseen, this);
    },
    destroy() {
        CJ.un('notification.button.update', this.setUnseen, this);
        this.callParent(args);
    },
    applyData(data) {
        return Ext.apply({ text: CJ.t(this.getText()) }, data);
    },
    updateUnseen(count) {
        if (!this.initialized)
            return;
        this[count ? 'addCls' : 'removeCls']('has-unseen');
        this.element.dom.querySelector('.d-unseen').innerHTML = count;
    },
    /**
     * Handler of event 'tap'.
     * Creates & shows the notifications popup.
     */
    onTap() {
        CJ.fire('notifications.do', 'show');
    }
});