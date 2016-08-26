import 'app/core/view/Component';

/**
 * Defines a component that allows a licensee to assign licenses to users by emails.
 */
Ext.define('CJ.view.purchase.assign.EmailSelect', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-purchase-assign-email-select',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} config
         * @return {CJ.core.view.Popup}
         */
        popup(config) {
            return Ext.factory({
                xtype: 'core-view-popup',
                title: '',
                content: { xtype: this.xtype }
            });
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Number} count
         * Defines how much emails we have in the field.
         */
        count: 0,
        /**
         * @cfg {String} type
         */
        type: 'light',
        /**
         * @cfg {String} cls
         */
        cls: 'd-purchase-assign-email-select d-vbox d-scroll',
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<span class=\'d-title\'>{title}</span>', '<p>{description}</p>', '<textarea class=\'d-input\' placeholder=\'{placeholder}\'></textarea>', '<div class=\'d-button\'>', '<span class=\'d-counter\'></span> {button}', '</div>')
    },
    constructor() {
        this.callParent(args);
        this.element.on({
            scope: this,
            input: {
                fn: this.onFieldChange,
                delegate: 'textarea'
            },
            tap: {
                fn: this.onButtonTap,
                delegate: '.d-button'
            }
        });
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        return Ext.apply(data, {
            title: CJ.t('view-purchase-assign-email-select-title'),
            description: CJ.t('view-purchase-assign-email-select-description'),
            placeholder: CJ.t('view-purchase-assign-email-select-placeholder', true),
            button: CJ.t('view-purchase-assign-email-select-button')
        });
    },
    /**
     * @param {Number} count
     * @return {undefined}
     */
    updateCount(count) {
        this.getData();
        this.element.dom.querySelector('.d-counter').innerHTML = CJ.tpl('{0}/{1}', count, this.getTotal());
    },
    /**
     * @param {Ext.Evented} e
     */
    onFieldChange(e) {
        this.setCount(this.getEmails().length);
    },
    /**
     * @return {Array}
     */
    getEmails() {
        const value = this.element.dom.querySelector('textarea').value, emails = value.split(/\n/g);
        return Ext.Array.filter(emails, email => !Ext.isEmpty(email));
    },
    /**
     * @return {Number} Numer of bought licenses.
     */
    getTotal() {
        return CJ.License.getLicense().left;
    },
    /**
     * @return {undefined}
     */
    onButtonTap() {
        const emails = this.getEmails().slice(0, this.getTotal()), licenseId = CJ.License.getLicense().id;
        if (emails.length == 0)
            return;
        this.setLoading(true);
        CJ.License.mailPins(licenseId, emails, {
            scope: this,
            success: this.onMailPinsSuccess,
            failure: this.onMailPinsFailure
        });
    },
    /**
     * @param {Object} response
     */
    onMailPinsSuccess(response) {
        CJ.feedback();
        CJ.PopupManager.hideActive();
    },
    /**
     * @return {undefined}
     */
    onMailPinsFailure() {
        this.setLoading(false);
    }
});