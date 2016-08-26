import 'Ext/Component';

Ext.define('CJ.view.tool.InlineLinkTool', {
    /**
     * @property {String} alias
     */
    alias: 'widget.view-tool-inlinelinktool',
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-popup-inline-link-tool',
        /**
         * @cfg {CJ.core.view.Popup|Object} popup
         */
        popup: null,
        /**
         * @cfg {HTMLElement} targetElement
         */
        targetElement: null,
        /**
         * @cfg {String} titleValue
         */
        titleValue: null,
        /**
         * @cfg {String} linkValue
         */
        linkValue: null,
        /**
         * @cfg {String} linkPlaceholder
         */
        linkPlaceholder: null,
        /**
         * @cfg {function} callbackFn
         */
        callbackFn: null,
        /**
         * @cfg {Object} callbackScope
         */
        callbackScope: null,
        /**
         * @cfg {Boolean} isNew
         */
        isNew: true,
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class="d-row">', '<input class="d-input d-title-input" value="{titleValue}"placeholder="{titlePlaceholder}" name="title"/>', '</div>', '<div class="d-row">', '<input class="d-input d-link-input" value="{linkValue}" placeholder="{linkPlaceholder}" name="link"/>', '<div class="d-button"></div>', '</div>', { compiled: true })
    },
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Config} config
         * @param {HTMLElement} target
         * @returns {Object}
         */
        show(config, target) {
            if (!Ext.os.is.Desktop) {
                const popup = Ext.factory({
                    xtype: 'core-view-popup',
                    title: ' ',
                    overlayCls: 'd-popup-overlay d-new-popup-overlay',
                    baseCls: 'd-popup d-new-popup',
                    closeButton: ' ',
                    content: Ext.apply({ xtype: this.xtype }, config)
                });    // target is needed for referencing the touched element in the toolbar
                // target is needed for referencing the touched element in the toolbar
                if (target)
                    popup.getContent().setTargetElement(target);
                return popup;
            }
            let popover = {
                innerComponent: Ext.apply({ xtype: this.xtype }, config),
                position: {
                    x: 'middle',
                    y: 'bottom'
                },
                cls: 'd-no-padding',
                target: config.target
            };
            popover = CJ.core.view.Popover.show(popover);
            if (target)
                popover.getInnerComponent().setTargetElement(target);
            return popover;
        }
    },
    /**
     * @param {Object} config
     * @returns {undefined}
     */
    constructor(config) {
        config = Ext.apply({
            data: {
                titlePlaceholder: CJ.t('view-popovers-inline-link-tool-title-placeholder', true),
                linkPlaceholder: CJ.t('view-popovers-inline-link-tool-link-placeholder', true),
                linkValue: config.linkValue,
                titleValue: config.titleValue
            }
        }, config);
        this.callParent(args);
        this.linkInputFieldElement = this.element.dom.querySelector('.d-link-input');
        this.titleInputFieldElement = this.element.dom.querySelector('.d-title-input');
        this.element.on('keydown', this.onKeyDown, this, { delegate: '.d-input' });
        this.element.on('tap', this.onTap, this);
    },
    /**
     * @param {Event} e
     * @returns {undefined}
     */
    onTap(e) {
        if (e.getTarget('.d-button', 3))
            this.doLinkCallback(e);
    },
    /**
     * @param {Event} e
     * @returns {undefined}
     */
    onKeyDown(e) {
        const evt = e.event;
        if (evt.keyCode == 13 || evt.which == 13)
            this.doLinkCallback(e);
    },
    /**
     * @param {Event} event
     * @returns {undefined}
     */
    doLinkCallback(event) {
        const args = [
                this.getTitleValue(),
                this.getLinkValue()
            ], popup = this.getPopup();
        if (!args[0] || !args[1])
            return;
        if (!this.getIsNew())
            args.push(this.getTargetElement());
        Ext.callback(this.getCallbackFn(), this.getCallbackScope(), args);
        if (popup)
            popup.onCloseButtonTap(event);
        this.fireEvent('close');
    },
    /**
     * @param {Object} config
     * @returns {Object}
     */
    applyTargetElement(config) {
        if (config) {
            if (this.linkInputFieldElement.value == '')
                this.linkInputFieldElement.value = config.getAttribute('href');
            if (this.titleInputFieldElement.value == '')
                this.titleInputFieldElement.value = config.innerHTML;
        }
        return config;
    },
    /**
     * @returns {String}
     */
    getLinkValue() {
        return this.linkInputFieldElement.value;
    },
    /**
     * @returns {String}
     */
    getTitleValue() {
        return this.titleInputFieldElement.value;
    },
    /**
     * @returns {undefined}
     */
    destroy() {
        this.callParent(args);
    }
});