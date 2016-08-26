import 'Ext/Component';

Ext.define('CJ.view.promoCodes.Select', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-promo-codes-select',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} config
         * @return {CJ.core.view.Popup}
         */
        popup: function popup(content) {
            return Ext.factory({
                xtype: 'core-view-popup',
                cls: 'd-promo-codes-select-popup',
                content: Ext.apply({ xtype: this.xtype }, content)
            });
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-promo-codes-select',
        /**
         * @cfg {Array} codes
         */
        codes: null,
        /**
         * @cfg {Ext.dataview.DataView} view
         */
        view: {},
        /**
         * @cfg {String} action
         */
        action: 'create'
    },
    /**
     * @return {Object}
     */
    getElementConfig: function getElementConfig() {
        return {
            reference: 'element',
            classList: [
                'x-unsized',
                'd-vbox'
            ],
            children: [
                { classList: ['d-inner'] },
                {
                    classList: ['d-footer'],
                    children: [{
                            reference: 'button',
                            classList: ['d-button']
                        }]
                }
            ]
        };
    },
    /**
     * @param {Object} config
     */
    constructor: function constructor(config) {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
    },
    /**
     * used to process button's taps
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap: function onElementTap(e) {
        if (!e.getTarget('.d-button'))
            return;
        const action = this.getAction(), method = `doAction${ Ext.String.capitalize(action) }`;
        this[method]();
    },
    /**
     * unshifts new empty item to store.
     * @return {undefined}
     */
    doActionCreate: function doActionCreate() {
        const store = this.getView().getStore();
        store.insert(0, {
            editing: true,
            active: true
        });
        this.setAction('save');
    },
    /**
     * @return {undefined}
     */
    doActionSave: function doActionSave() {
        const model = this.getView().getStore().findRecord('editing', true);
        const values = this.getFormValues();
        const code = values.code || model.get('code');
        let discount = values.discount || model.get('discount_pct');
        if (discount && code) {
            if (discount > 100)
                discount = 100;
            if (discount < 1)
                discount = 1;
            model.set({
                code,
                discount_pct: discount,
                editing: false
            });
        } else {
            model.destroy();
        }
        this.setAction('create');
    },
    /**
     * @return {Object}
     */
    getFormValues: function getFormValues() {
        const el = this.element.dom;
        return {
            discount: el.querySelector('[name=discount]').value.replace(/[^\d]+/, ''),
            code: el.querySelector('[name=code]').value
        };
    },
    /**
     * @param {String} action
     */
    updateAction: function updateAction(action) {
        this.button.setHtml(this.getButtonTextByAction(action));
    },
    /**
     * @return {String} a text based on a passed #action. E.g: create -> 'create a new promo code'
     */
    getButtonTextByAction: function getButtonTextByAction(action) {
        return CJ.t(`view-promo-codes-select-button-${ action }`);
    },
    /**
     * @param {Object} config
     * @param {Ext.Component} oldView
     * @return {Ext.dataview.DataView}
     */
    applyView: function applyView(config, oldView) {
        if (oldView)
            oldView.destroy();
        if (!config)
            return;
        return Ext.factory(Ext.apply({
            xtype: 'dataview',
            cls: 'd-scroll',
            scrollable: CJ.Utils.getScrollable(),
            store: this.generateViewStore(),
            itemTpl: this.generateItemTpl(),
            itemCls: 'd-vbox',
            renderTo: this.element.dom.querySelector('.d-inner'),
            listeners: {
                scope: this,
                itemtap: this.onListItemTap
            }
        }, config));
    },
    /**
     * @return {Object}
     */
    generateViewStore: function generateViewStore() {
        return {
            data: this.getCodes(),
            fields: [
                'id',
                {
                    name: 'discount_pct',
                    type: 'int'
                },
                'code',
                'active',
                'editing',
                {
                    name: 'created',
                    convert: function convert(value, record) {
                        return CJ.Utils.formatUTCDate(value, 'd/m/Y');
                    }
                },
                {
                    name: 'modified',
                    convert: function convert(value, record) {
                        if (!value)
                            return null;
                        return CJ.Utils.formatUTCDate(value, 'd/m/Y');
                    }
                }
            ],
            proxy: {
                type: 'memory',
                reader: { type: 'json' }
            }
        };
    },
    /**
     * @return {Ext.XTemplate}
     */
    generateItemTpl: function generateItemTpl() {
        return [
            '<div class="d-item-inner d-hbox">',
            '<div class="d-vbox d-info">',
            '<b class="d-title">{code}</b>',
            '<span class="d-date">',
            '<tpl if="modified">',
            '{[ CJ.t("view-promo-codes-select-modified") ]} {modified}',
            '<tpl else>',
            '{[ CJ.t("view-promo-codes-select-created") ]} {created}',
            '</tpl>',
            '</span>',
            '<b class="d-discount">',
            '{[ CJ.t("view-promo-codes-select-rate") ]}: <span>{discount_pct}%</span>',
            '</b>',
            '</div>',
            '<tpl if="! editing">',
            '<div class="d-vbox d-vcenter d-hcenter d-icons {[ values.active ? \'d-active\' : \'d-inactive\' ]}">',
            '<i class="d-icon"></i>',
            '<span>',
            '{[ CJ.t("view-promo-codes-select-" + (values.active ? "deactivate" : "activate")) ]}',
            '</span>',
            '</div>',
            '</tpl>',
            '</div>',
            '<tpl if="editing">',
            '<div class="d-editing-form">',
            '<div class="d-hbox d-vcenter d-field">',
            '<span>',
            '{[ CJ.t("view-promo-codes-select-discount-label") ]} ',
            '</span>',
            '<input type="text" name="discount" value="{discount_pct}"/>',
            '</div>',
            '<div class="d-hbox d-vcenter d-field">',
            '<span>',
            '{[ CJ.t("view-promo-codes-select-code-label") ]} ',
            '</span>',
            '<input type="text" name="code" value="{code}" maxlength="20"/>',
            '</div>',
            '</div>',
            '</tpl>'
        ];
    },
    /**
     * @param {Ext.dataview.DataView} list
     * @param {Number} index
     * @param {HTMLElement} target
     * @param {Object} target
     * @param {Ext.data.Model} record
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onListItemTap: function onListItemTap(list, index, target, record, e) {
        if (e.getTarget('.d-icons', 5))
            return record.set('active', !record.get('active'));
        if (record.get('editing'))
            return;
        if (this.getAction() == 'save')
            this.doActionSave();
        record.set('editing', true);
        this.setAction('save');
    },
    /**
     * @return {Array} list of code (result of user's editing)
     */
    getRealCodes: function getRealCodes() {
        const items = [];
        this.getView().getStore().each(item => {
            const id = item.get('id');
            items.push({
                id: item.phantom ? null : id,
                code: item.get('code'),
                discount_pct: item.get('discount_pct') - 0,
                active: item.get('active')
            });
        });
        return items;
    },
    /**
     * destroyes non-inner components. 
     * @return {undefined}
     */
    destroy: function destroy() {
        this.callParent(args);
        this.setView(null);
    }
});