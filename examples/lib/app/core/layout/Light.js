/**
 * Defines a light version of Ext.layout.Default.
 */
Ext.define('CJ.core.layout.Light', {
    mixins: ['Ext.mixin.Observable'],
    isLayout: true,
    alias: 'layout.light',
    constructor(config) {
        this.initialConfig = config;
    },
    setContainer(container) {
        this.container = container;
        this.initConfig(this.initialConfig);
        return this;
    },
    /**
     * @param {Ext.Component} item
     * @param {Number} index On which index the item should be placed.
     * @return {undefined}
     */
    onItemAdd(item, index) {
        const containerDom = this.container.innerElement.dom, itemDom = item.element.dom;
        if (Ext.isNumber(index))
            containerDom.insertBefore(itemDom, containerDom.childNodes[index] || null);
        else
            containerDom.appendChild(itemDom);
        return this;
    },
    /**
     * @param {Ext.Component} item
     * @return {undefined}
     */
    onItemRemove(item) {
        item.element.detach();
    },
    /**
     * @param {Ext.Component} item
     * @param {Number} toIndex
     * @param {Number} fromIndex
     */
    onItemMove(item, toIndex, fromIndex) {
    },
    onItemInnerStateChange() {
    }
});