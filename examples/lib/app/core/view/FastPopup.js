Ext.define('CJ.core.view.FastPopup', {
    element: null,
    innerElement: null,
    config: {
        baseCls: 'd-fast-popup',
        baseTpl: Ext.create('Ext.Template', '<div class="d-popup-overlay d-fast-popup-overlay">', '<div class="d-fast-popup-inner"></div>', '</div>', { compiled: true }),
        tpl: null
    },
    statics: { show: Ext.emptyFn },
    constructor(config) {
        this.callParent(args);
        config = Ext.applyIf(config, this.config);
        this.initConfig(config);
        this.initElement(config);
        this.initInnerElement(config);
        this.renderElement(config);
        this.attachListeners();
    },
    initElement(config) {
        const element = document.createElement('div');
        element.className = [
            config.baseCls,
            config.cls
        ].join(' ');
        element.innerHTML = config.baseTpl.apply(config);
        return this.element = Ext.get(element);
    },
    initInnerElement(config) {
        this.innerElement = this.element.dom.querySelector('.d-fast-popup-inner');
        this.innerElement.innerHTML = config.tpl.apply(config);
        return this.innerElement;
    },
    renderElement(config) {
        Ext.Viewport.element.appendChild(this.element);
        return config;
    },
    onTap(e) {
        if (e.target.classList.contains('d-fast-popup-overlay'))
            this.destroy();
    },
    attachListeners() {
        this.element.on('tap', this.onTap, this);
    },
    detachListeners() {
        this.element.un('tap', this.onTap, this);
    },
    destroy() {
        this.detachListeners();
        this.element.destroy();
        this.callParent(args);
    }
});