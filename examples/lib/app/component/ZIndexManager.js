Ext.define('CJ.component.ZIndexManager', {
    alternateClassName: 'CJ.ZIndexManager',
    singleton: true,
    zIndex: 5,
    getZIndex() {
        return ++this.zIndex;
    }
});