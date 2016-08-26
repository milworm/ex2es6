import 'Ext/Component';

/**
 * Defines a class that displays an editing container for a solution, where user is able to add/upload his work.
 */
Ext.define('CJ.view.solution.Editing', {
    /**
	 * @property {String} alias
	 */
    alias: 'widget.view-solution-editing',
    /**
	 * @property {String} extend
	 */
    extend: 'Ext.Component',
    /**
	 * @cfg {Object} statics
	 */
    statics: {
        /**
		 * @return {Boolean}
		 */
        isOpened() {
            return !!Ext.ComponentQuery.query('[isSolutionEditingPopup]').length;
        },
        /**
		 * @param {Object} config
		 * @return {CJ.core.view.Popup}
		 */
        popup(config) {
            return Ext.factory(Ext.apply({
                isSolutionEditingPopup: true,
                xtype: 'core-view-popup',
                cls: 'd-solution-editing-popup d-popup-transparent',
                closeButton: 'view-solution-editing-close',
                content: { xtype: this.xtype },
                actionButton: { text: 'view-solution-editing-submit' }
            }, config));
        }
    },
    /**
	 * @property {Object} config
	 */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-solution-editing',
        /**
		 * @cfg {Object} data
		 */
        data: {},
        /**
		 * @cfg {CJ.core.view.Popup} popup
		 */
        popup: null,
        /**
		 * @cfg {Ext.XTemplate} tpl
		 */
        tpl: Ext.create('Ext.XTemplate', '<div class="d-inner">', '<div class="d-vbox d-info">', '<i class="d-icon"></i>', '<span class="d-title">{title}</span>', '<p class="d-text">{text}</p>', '</div>', '<div class="d-fields"></div>', // '<div class="d-submit-button">{button}</div>',
        '</div>'),
        /**
		 * @cfg {Object} fields
		 */
        fields: {}
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
    },
    /**
	 * @param {Object} data
	 * @return {Object}
	 */
    applyData(data) {
        return Ext.apply({
            title: CJ.t('view-solution-editing-title'),
            text: CJ.t('view-solution-editing-text'),
            button: CJ.t('view-solution-editing-submit')
        }, data);
    },
    /**
	 * @param {Object} data
	 */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
	 * @param {Object} config
	 * @return {Object}
	 */
    applyFields(config, oldComponent) {
        if (oldComponent)
            oldComponent.destroy();
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'view-tool-media-editing',
            renderTo: this.element.dom.querySelector('.d-fields'),
            // @TODO figure out the design and refactor this case if needed
            popup: this.getPopup()
        }, config));
    },
    serialize() {
        let result = null;
        try {
            result = this.getFields().getPreview().serialize();
        } catch (e) {
        }
        return result;
    },
    onElementTap(e) {
        if (e.getTarget('.d-submit-button'))
            this.fireEvent('actionbuttontap', this);
    }
});