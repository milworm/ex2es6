import 'Ext/Component';
import 'app/view/answers/filter/Popup';

/**
 * Class provides button of filtering answers.
 */
Ext.define('CJ.view.answers.filter.Button', {
    extend: 'Ext.Component',
    xtype: 'view-answers-filter-button',
    isFilterButton: true,
    config: {
        /**
         * @cfg {String} iconCls
         */
        iconCls: null,
        /**
         * @cfg {String} text
         */
        text: null,
        /**
         * @cfg {Object} key
         */
        key: false
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onTap, this);
    },
    /**
     * @param {String} newCls
     * @param {String} oldCls
     */
    updateIconCls(newCls, oldCls) {
        this.iconElement.replaceCls(oldCls, newCls);
    },
    /**
     * @param {String} text
     */
    updateText(newText) {
        this.textElement.setHtml(newText);
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            classList: ['d-filter-button'],
            children: [
                {
                    reference: 'iconElement',
                    classList: ['d-icon']
                },
                {
                    reference: 'textElement',
                    classList: ['d-text']
                }
            ]
        };
    },
    /**
     * Sets state(icon & text) of filtering button.
     * @param {Ext.data.Model} key
     * @returns {Ext.data.Model}
     */
    applyKey(key) {
        this.iconElement.dom.removeAttribute('style');
        if (key) {
            const text = key.get('name'), icon = CJ.Utils.makeIcon(key.get('icon'));
            this.iconElement.dom.setAttribute('style', icon);
            this.setIconCls('key');
            this.setText(text);
        } else {
            this.setIconCls('default');
            this.setText(CJ.app.t('answers-filtering-button-default-text'));
        }
        return key;
    },
    /**
     * Handler of event 'tap'.
     * Shows popup of filtering.
     */
    onTap() {
        Ext.create(CJ.view.answers.filter.Popup, {
            listeners: {
                filterselected: this.onFilterSelected,
                scope: this
            }
        });
    },
    /**
     * Handler of event 'filterselected'.
     * Reloads answers with filtering param.
     * @param {Ext.data.Model} key
     */
    onFilterSelected(key) {
        this.setKey(key);
        this.fireEvent('filterselected', this, key);
    }
});