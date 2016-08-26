/**
 * Class is used to incapsulate all ajax-requests logic for licensing.
 */
Ext.define('CJ.model.License', {
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.License',
    /**
     * @property {Boolean} singleton
     */
    singleton: true,
    /**
     * @return {Object}
     */
    getData() {
        return this.data;
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    setData(data) {
        this.data = data;
    },
    /**
     * @return {Object} license
     */
    getLicense() {
        return (this.data || {}).license;
    },
    /**
     * @return {Number} licensed-block docId.
     */
    getBlockId() {
        return (this.data || {}).blockId;
    },
    /**
     * @param {Number} id
     * @param {Number} quantity
     * @param {Number} promoCode
     * @param {Object} config
     * @return {undefined}
     */
    calculatePrice(id, quantity, promoCode, config undefined {}) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'License',
                method: 'get_purchase_totals'
            },
            params: {
                qty: quantity,
                voucher_code: promoCode,
                doc_id: id
            }
        }, config));
    },
    /**
     * @param {Number} id
     * @param {String} token
     * @param {Number} quantity
     * @param {String} promoCode
     * @param {Object} config
     * @return {undefined}
     */
    purchase(id, token, quantity, promoCode, config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'License',
                method: 'purchase'
            },
            params: {
                qty: quantity,
                doc_id: id,
                voucher_code: promoCode,
                stripe_token: token
            }
        }, config));
    },
    /**
     * @param {Number} id
     * @param {Object} config
     * @return {undefined}
     */
    getInfo(id, config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'License',
                method: 'get_info',
                id
            }
        }, config));
    },
    /**
     * @param {Number} id
     * @param {String} emails
     * @param {Object} config
     * @return {undefined}
     */
    mailPins(id, emails, config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'License',
                method: 'mail_pins',
                id
            },
            params: { emails }
        }, config));
    },
    /**
     * @param {Number} id License Id
     * @param {Object} config
     * @return {undefined}
     */
    loadPins(id, config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'License',
                method: 'print_pins',
                id
            }
        }, config));
    },
    /**
     * @param {String} pin
     * @param {Object} config
     */
    getPinInfo(pin, config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'License',
                method: 'get_pin_info'
            },
            params: { pin }
        }, config));
    },
    /**
     * @param {String} pin
     * @param {Object} config
     * @return {undefined}
     */
    redeemPin(pin, config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'License',
                method: 'redeem_pin'
            },
            params: { pin }
        }, config));
    },
    /**
     * @param {Array} users
     * @param {Object} config
     * @return {undefined}
     */
    assignPins(users, config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'License',
                method: 'assign_pins',
                id: this.getLicense().id
            },
            params: { users }
        }, config));
    },
    /**
     * @param {Number|String} docId Licensed container id.
     * @param {Object} config
     */
    prePurchase(docId, config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'License',
                method: 'pre_purchase'
            },
            params: { doc_id: docId }
        }, config));
    }
});