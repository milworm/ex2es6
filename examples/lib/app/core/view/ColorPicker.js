import 'Ext/Component';

Ext.define('CJ.core.view.ColorPicker', {
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.ColorPicker',
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.colorpicker',
    /**
     * @property {Object} config
     */
    config: {
        /*
         * @cfg {Object} popup
         */
        popup: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-colorpicker d-vbox',
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Array} colors
         */
        colors: [
            '#f3b57c',
            '#e7cc56',
            '#53a8b3',
            '#548abe',
            '#97aee1',
            '#ce79b3',
            '#74b859',
            '#aaa',
            '#555'
        ],
        /**
         * @cfg {String} value
         */
        value: null,
        /**
         * @cfg {String} opacity
         */
        opacity: null,
        /**
         * @cfg {Boolean} hasOpacity
         */
        hasOpacity: null,
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class="d-title">{titleLabel}</div>', '<div class="d-colors d-hbox">', '<tpl for="colors">', '<div data-color="{.}" style="background-color: {.}"></div>', '</tpl>', '</div>', '<div class="d-input-block d-hbox">', '<div class="d-color-preview"></div>', '<input class="d-tapon d-input d-color-input" maxlength="7"/>', '</div>', '<div class="d-hbox d-opacity-block {[values.hasOpacity ? "": "d-hidden"]}">', '<label for="{id}-field">Alpha %</label>', '<input id="{id}-field" class="d-opacity-field" type="text" placeholder="0" maxlength="3"/>', '</div>', '<div class="d-tapon d-remove">{removeLabel}</div>')
    },
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} config
         * @returns {Object}
         */
        showTo(config) {
            let component = {
                xtype: this.xtype,
                listeners: config.listeners,
                hasOpacity: config.hasOpacity
            };
            let instance;
            const popover = config.popover || {};
            if (config.value)
                component.value = config.value;
            if (config.determineMobile && !Ext.os.is.Desktop) {
                component = Ext.apply({
                    cls: 'd-colorpicker-container d-colorpicker d-mobile-colorpicker',
                    titleLabel: ''
                }, component);
                instance = Ext.factory({
                    xtype: 'core-view-popup',
                    title: CJ.t('core-view-colorpicker-title-label'),
                    cls: 'd-colorpicker-popup',
                    content: component
                });
                return instance;
            } else {
                return CJ.core.view.Popover.show(Ext.apply({
                    cls: 'd-no-padding',
                    position: {
                        x: 'middle',
                        y: 'bottom'
                    },
                    innerComponent: component,
                    target: config.target
                }, popover));
            }
        }
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        let value = config.value || '';
        value = value.split(' ');
        config.value = value[0] || '#000';
        config.opacity = value[1] || 100;
        this.callParent(args);
        this.attachListeners();
    },
    /**
     * @param {String} value
     * @return {String}
     */
    applyValue(value) {
        return value.toLowerCase();
    },
    /**
     * @param {String} value
     * @return {undefined}
     */
    updateValue(value, oldValue) {
        this.getData();
        const el = this.element.dom, oldColorEl = this.getColorEl(oldValue), newColorEl = this.getColorEl(value);
        if (oldColorEl)
            oldColorEl.classList.remove('d-hlited');
        if (newColorEl)
            newColorEl.classList.add('d-hlited');
        el.querySelector('.d-color-input').value = value;
        el.querySelector('.d-color-preview').style.backgroundColor = value;
        this.fireEvent('setcolor', this.generateValue());
    },
    /**
     * @param {Number} opacity
     */
    updateOpacity(opacity) {
        if (!this.getHasOpacity())
            return;
        this.element.dom.querySelector('.d-color-preview').style.opacity = opacity / 100;
        if (this.initialized)
            this.fireEvent('setcolor', this.generateValue());
        else
            this.element.dom.querySelector('.d-opacity-field').value = opacity;
    },
    /**
     * @return {String} generates "#fff 0.2" or "#fff".
     * @NOTE cannot remove this due to backwards compatibility
     */
    generateValue() {
        if (this.getHasOpacity())
            return `${ this.getValue() } ${ this.getOpacity() }`;
        else
            return this.getValue();
    },
    updateData(data) {
        data = Ext.apply({
            removeLabel: CJ.t('core-view-colorpicker-remove-label'),
            titleLabel: CJ.t('core-view-colorpicker-title-label'),
            colors: this.getColors(),
            hasOpacity: this.getHasOpacity(),
            id: this.getId()
        }, data);
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @param {String} color
     */
    getColorEl(color) {
        return this.element.dom.querySelector(CJ.tpl('[data-color=\'{0}\']', color));
    },
    /**
     * @param {Event} e
     * @returns {undefined}
     */
    onTap(e) {
        if (e.getTarget('[data-color]', 5))
            return this.setValue(CJ.getNodeData(e.target, 'color'));
        if (e.getTarget('.d-remove', 5))
            return this.removeValue(e);
        if (e.getTarget('.d-colorpicker', 5))
            return;
        this.hide();
    },
    /**
     * @returns {undefined}
     */
    onInputChange(e) {
        let color = e.target.value;
        if (!CJ.core.Utils.validateHex(color))
            return;
        if (color[0] != '#')
            color = `#${ color }`;
        this.setValue(color);
    },
    /**
     * @param {Event} event
     * @returns {undefined}
     */
    removeValue(event) {
        this.setValue('#000');
        const popup = this.getPopup();
        if (popup)
            popup.onCloseButtonTap(event);
        this.hide();
    },
    /**
     * @returns {undefined}
     */
    attachListeners() {
        this.element.on({
            tap: this.onTap,
            input: this.onInputChange,
            delegate: [
                '[data-color]',
                '.d-input',
                '.d-remove'
            ],
            scope: this
        });
        this.element.on('input', this.onOpacityChange, this, { delegate: '.d-opacity-field' });
    },
    onOpacityChange(e) {
        this.setOpacity(e.target.value);
    }
});