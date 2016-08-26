import 'app/core/view/popup/Options';
import 'app/view/purchase/assign/EmailSelect';
import 'app/view/purchase/assign/UserSelect';
import 'app/view/purchase/assign/PinSelect';

Ext.define('CJ.view.purchase.assign.Options', {
    extend: 'CJ.core.view.popup.Options',
    alias: 'widget.view-purchase-assign-options',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * shows a component in a popup.
         */
        popup() {
            Ext.factory({
                xtype: 'core-view-popup',
                cls: 'd-menu-popup',
                layout: 'light',
                title: '',
                content: { xtype: 'view-purchase-assign-options' }
            });
        }
    },
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-menu-items d-purchase-assign-options d-scroll',
        /**
         * @cfg {Object|Boolean} emailButton
         */
        emailButton: {
            text: 'view-purchase-assign-options-email',
            cls: 'd-button d-icon-email'
        },
        /**
         * @cfg {Object|Boolean} userButton
         */
        userButton: {
            text: 'view-purchase-assign-options-user',
            cls: 'd-button d-icon-user'
        },
        /**
         * @cfg {Object|Boolean} pinButton
         */
        pinButton: {
            text: 'view-purchase-assign-options-pin',
            cls: 'd-button d-icon-print'
        }
    },
    /**
     * @param {Object} config
     */
    applyEmailButton(config) {
        return this.createButton(Ext.apply({ handler: this.onEmailButtonTap }, config));
    },
    /**
     * Method will be called when user taps on "assign by email" button
     */
    onEmailButtonTap() {
        CJ.view.purchase.assign.EmailSelect.popup();
    },
    /**
     * @param {Object} config
     */
    applyUserButton(config) {
        return this.createButton(Ext.apply({ handler: this.onUserButtonTap }, config));
    },
    /**
     * Method will be called when user taps on "assign to users in app" button
     */
    onUserButtonTap() {
        CJ.view.purchase.assign.UserSelect.popup();
    },
    /**
     * @param {Object} config
     */
    applyPinButton(config) {
        return this.createButton(Ext.apply({ handler: this.onPinButtonTap }, config));
    },
    /**
     * Method will be called when user taps on "print pin codes" button
     */
    onPinButtonTap() {
        CJ.view.purchase.assign.PinSelect.popup();
    }
});