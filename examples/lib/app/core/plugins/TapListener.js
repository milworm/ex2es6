Ext.define('CJ.core.plugins.TapListener', {
    alias: 'plugin.taplistener',
    config: {
        component: null,
        deep: 10
    },
    constructor() {
        this.callParent(args);
        this.initConfig(this.config);
    },
    init(component) {
        this.setComponent(component);
    },
    updateComponent(component) {
        component.element.on('tap', this.onTap, this);
    },
    onTap(e) {
    }
});