import 'Ext/Component';

/**
 * Defines a component that is used to show the content of DefaultBlock.
 */
Ext.define('CJ.view.block.Content', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-block-content',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Object} activityTitle
         */
        activityTitle: null,
        /**
         * @cfg {Array} items
         */
        items: [],
        /**
         * @cfg {Array} tools
         */
        tools: [],
        /**
         * @cfg {String} cls
         */
        cls: 'd-block-body-content'
    },
    /**
     * @param {Array} newItems
     * @param {Array} oldItems
     */
    updateItems(newItems, oldItems) {
        const html = [], activityTitle = this.getActivityTitle();
        if (activityTitle)
            html.push(CJ.view.activity.Title.viewTpl.apply(activityTitle));
        for (let i = 0, item; item = newItems[i]; i++) {
            const className = Ext.ClassManager.getNameByAlias(`widget.${ item.xtype }`), cls = Ext.ClassManager.classes[className];
            item = Ext.apply(item, { toolIndex: i });
            html.push(cls.previewTpl.apply(item));
        }
        this.element.setHtml(html.join(''));
        this.initializeComponents();
    },
    /**
     * @param {Array} newTools
     * @param {Array} oldTools
     * @return {undefined}
     */
    updateTools(newTools, oldTools) {
        if (oldTools) {
            let tool;
            while (tool = oldTools.pop())
                tool.destroy();
        }
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onFakeToolTap(e) {
        // we replace fake-node with tool's element, so after this method
        // e.target will still reference to deleted node, which could cause
        // a bug in popup (in case when we need to hide popup when user taps
        // on overlay, e.getTarget(".d-block") -> null)
        e.stopEvent();
        const target = e.getTarget('.d-fake');
        const index = CJ.getNodeData(target, 'toolIndex');
        const config = this.getItems()[index];
        let tool;
        tool = Ext.factory(config);
        tool.onElementTap(e);
        tool.replaceFake(target);
        this.getTools().push(tool);
    },
    /**
     * initializes non-tpl based tools.
     * @return {undefined}
     */
    initializeComponents() {
        const nodes = this.element.dom.querySelectorAll('.d-formula, .d-video, .d-image, .d-tool-app');
        const items = this.getItems();
        const tools = this.getTools();
        let tool;
        let index;
        for (let i = 0, node; node = nodes[i]; i++) {
            index = CJ.getNodeData(node, 'toolIndex');
            tool = Ext.factory(items[index]);
            tool.replaceFake(node);
            tools.push(tool);
        }
    },
    renderToolsOnDemand() {
        const tools = this.getTools(), toolsMap = ['view-tool-formula-tool'];
        for (let i = 0, ln = tools.length, tool; i < ln; i++) {
            tool = tools[i];
            if (toolsMap.indexOf(tool.xtype) != -1) {
                tool.renderTemplateOnDemand();
            }
        }
    },
    /**
     * @return {Object}
     */
    serialize() {
        return {
            xtype: 'core-view-list-editor',
            // @TODO remove this line when server is ready.
            items: this.getItems()
        };
    },
    /**
     * @return {undefined}
     */
    destroy() {
        fastdom.clear(this.fastdomId);
        this.setTools(null);
        this.callParent(args);
    }
});