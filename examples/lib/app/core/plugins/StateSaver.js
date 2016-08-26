/**
 * Defines a plugin that adds component an ability to save/restore
 * it's state depending on browser's url.
 */
Ext.define('CJ.core.plugins.StateSaver', {
    /**
     * @property {String} alias
     */
    alias: 'plugin.state-saver',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @param {Ext.Component} component
         */
        component: null,
        /**
         * @cfg {String} itemSelector Property name that will be used in order
         *                            to find only list-items.
         */
        itemSelector: null
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.initConfig(config);
        this.callParent(args);
        CJ.on('controller.beforeaction', this.onControllerBeforeAction, this);
    },
    /**
     * method will be called every time before controller's action will be 
     * called. It is used to save component state.
     */
    onControllerBeforeAction() {
        const url = CJ.History.getLastActionUrl();
        if (url)
            this.saveState(url);
    },
    /**
     * @return {Object}
     */
    getComponentStates() {
        const cls = this.getComponent().self;
        return cls.states || (cls.states = {});
    },
    /**
     * @return {Object}
     */
    getCurrentState() {
        const states = this.getComponentStates(), url = CJ.History.getActiveActionUrl();
        return states[CJ.History.getActiveActionUrl()];
    },
    /**
     * simply saves component's scroll-position
     * @param {String} url
     */
    saveState(url) {
        let pageBox;
        let block;
        let items;
        const list = this.getComponent().getList();
        if (!(list && list.isContainer))
            return;
        items = list.query(this.getItemSelector());    // finds the coordinates of top-most visible block in the list
        // finds the coordinates of top-most visible block in the list
        Ext.each(items, item => {
            pageBox = item.element.getPageBox();
            if (pageBox.top > 0) {
                block = item;
                return false;
            }
        }, this);
        if (!block)
            return;
        this.getComponentStates()[url] = {
            docId: block.getDocId(),
            pageBox
        };
    },
    /**
     * @return {Object}
     */
    getSavedRequestParams() {
        const state = this.getCurrentState();
        if (!state)
            return {};
        return {
            refId: state.docId,
            refMode: 'midpoint'
        };
    },
    modifyRequest(request) {
        const state = this.getCurrentState();
        if (!state)
            return;
        Ext.apply(request.params, {
            refId: state.docId,
            refMode: 'midpoint'
        });
    },
    /**
     * restores scroll-position
     */
    restorePosition() {
        const state = this.getCurrentState();
        const component = this.getComponent();
        let block;
        if (!state)
            return component.scrollTop(0);
        block = component.getList().down(CJ.tpl('[docId={0}]', state.docId));    // may be already deleted
        // may be already deleted
        if (!block || block.isDestroyed)
            return;
        const blockPageBox = block.element.getPageBox();
        const statePageBox = state.pageBox;
        let diff = blockPageBox.top - statePageBox.top;
        if (statePageBox.top > blockPageBox.top)
            diff *= -1;
        component.scrollTop(diff, true);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setComponent(null);
        CJ.un('controller.beforeaction', this.onControllerBeforeAction, this);
    }
});