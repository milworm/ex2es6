import 'Ext/Component';
import 'app/view/purchase/form/Address';
import 'app/view/purchase/form/Details';
import 'app/view/purchase/form/PaymentMethod';
import 'app/view/purchase/form/Review';
import 'app/view/purchase/assign/Options';

/**
 * Defines an interface that allows users to buy licensing content.
 * Contains 3 steps: details, paymentMethod, review.
 */
Ext.define('CJ.view.purchase.PurchaseForm', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.PurchaseForm',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-purchase-purchase-form',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {String|Number} docId
         * @return {CJ.core.view.Popup}
         */
        popup(docId) {
            const xtype = this.xtype;    // load all required data.
            // load all required data.
            CJ.LoadBar.run();
            CJ.Ajax.initBatch();
            CJ.User.loadBillingAddress();
            CJ.License.prePurchase(docId);
            CJ.Ajax.runBatch(response => {
                CJ.LoadBar.finish();
                const responses = response.responses, address = responses[0].ret, details = responses[1].ret;
                Ext.factory({
                    xtype: 'core-view-popup',
                    cls: 'd-purchase-form-popup d-popup-transparent',
                    closeButton: false,
                    closeOnTap: true,
                    closeOnTapSelectors: '.d-carousel-item > div, .d-circle-navigation > span, .d-loading > div',
                    content: {
                        xtype,
                        blockId: docId,
                        values: {
                            address,
                            details
                        }
                    }
                });
            });
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-purchase-form d-circle-navigation-container',
        /**
         * @cfg {Number} blockId
         */
        blockId: null,
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Object} values
         */
        values: {},
        /**
         * @cfg {Number} step
         */
        step: 0,
        /**
         * @cfg {Array} items
         */
        items: [
            {
                ref: 'address',
                xtype: 'view-purchase-form-address'
            },
            {
                ref: 'details',
                xtype: 'view-purchase-form-details'
            },
            {
                ref: 'paymentMethod',
                xtype: 'view-purchase-form-payment-method'
            },
            {
                ref: 'review',
                xtype: 'view-purchase-form-review'
            }
        ],
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class=\'d-purchase-form-inner d-hbox\'></div>', '<div class=\'d-purchase-form-footer d-circle-navigation\'>', '<span></span>', '<span></span>', '<span></span>', '<span></span>', '</div>', { compiled: true })
    },
    /**
     * @param {Number} newIndex
     * @param {Number} oldIndex
     */
    updateStep(newIndex, oldIndex) {
        const value = CJ.tpl('translateX(-{0}%)', newIndex * 100), items = this.getItems(), values = this.getValues();
        this.element.down('.d-purchase-form-inner').setStyle({
            'transform': value,
            '-webkit-transform': value    // safari
        });    // add values from previous step.
        // add values from previous step.
        if (oldIndex) {
            const oldItem = items[oldIndex];
            values[oldItem.initialConfig.ref] = oldItem.getValues();
        }
        const newItem = items[newIndex], ref = newItem.initialConfig.ref;    // set values for new step.
        // set values for new step.
        items[newIndex].setValues(this.getValueFor(ref));
        this.element.set({ 'data-active-step': newIndex });
    },
    /**
     * @param {String} ref
     * @return {Object}
     */
    getValueFor(ref) {
        const values = this.getValues(), blockId = this.getBlockId();
        switch (ref) {
        case 'address':
            return values.address;
        case 'details':
            return Ext.apply(values.details, { blockId });
        case 'paymentMethod':
            return {
                blockId,
                quantity: values.details.quantity,
                total: values.details.total,
                promoCode: values.details.promoCode
            };
        }
        return {};
    },
    /**
     * @param {Array} items
     * @return {Array}
     */
    applyItems(items) {
        if (!items)
            return false;
        const result = [];
        for (let i = 0, item; item = items[i]; i++) {
            item.parent = this;
            item = Ext.factory(item);
            item.addCls('d-carousel-item');
            result.push(item);
        }
        return result;
    },
    /**
     * @param {Array} newItems
     * @param {Array} oldItems
     */
    updateItems(newItems, oldItems) {
        if (oldItems) {
            for (var i = 0, item; item = oldItems[i]; i++)
                item.destroy();
        }
        if (newItems) {
            const node = this.element.dom.querySelector('.d-purchase-form-inner');
            for (var i = 0, item; item = newItems[i]; i++)
                item.renderTo(node);
        }
    },
    /**
     * @param {Object} data
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * just shows a next step-form.
     */
    nextStep() {
        this.setStep(this.getStep() + 1);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        const node = this.element.down('.d-purchase-form-inner').dom;
        this.callParent(args);
        this.setItems(null);
        Ext.removeNode(node);
    }
});