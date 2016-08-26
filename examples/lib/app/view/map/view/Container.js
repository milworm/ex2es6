import 'Ext/Component';
import 'app/view/map/view/Map';

/**
 * The class provides a component for displaying map blocks
 */
Ext.define('CJ.view.map.view.Container', {
    /**
     * @inheritdoc
     */
    extend: 'Ext.Component',
    /**
     * @inheritdoc
     */
    xtype: 'view-map-view-container',
    /**
     * @inheritdoc
     */
    statics: {
        /**
         * Shows view map popup.
         * @param {Object} config
         * @returns {CJ.core.view.Popup}
         */
        popup(config) {
            config = Ext.applyIf(config || {}, { xtype: 'view-map-view-container' });
            return Ext.factory({
                xtype: 'core-view-popup',
                cls: 'd-map-view-popup',
                fitMode: true,
                title: config.block.getTitle() || CJ.t('view-map-block-default-title'),
                isHistoryMember: true,
                content: config
            });
        }
    },
    /**
     * @inheritdoc
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-map-view-container',
        /**
         * @cfg {CJ.core.view.Popup}
         */
        popup: null,
        /**
         * @cfg {CJ.view.map.Block}
         */
        block: null,
        /**
         * @cfg {CJ.view.map.view.Map}
         */
        map: {},
        lastPointer: null
    },
    /**
     * @inheritdoc
     */
    initialize() {
        this.callParent(args);
        this.getPopup().on('hide', this.onHide, this);
        CJ.on('popuphide', this.onBlockInteractionFinish, this);
    },
    /**
     * Applies map.
     * @param {Object} config
     * @returns {CJ.view.map.Map}
     */
    applyMap(config) {
        if (!config)
            return null;
        const block = this.getBlock();
        Ext.applyIf(config, {
            xtype: 'view-map-view-map',
            image: block.getImage(),
            nodes: Ext.clone(block.getNodes()),
            nodeColor: block.getNodeColor(),
            edgeColor: block.getEdgeColor(),
            renderTo: this.element,
            listeners: {
                networkinited: this.onNetworkInited,
                select: this.onSelect,
                dragging: this.onNetworkDrag,
                dragend: this.onNetworkDragEnd,
                scope: this
            }
        });
        return Ext.factory(config);
    },
    /**
     * Handler of the event 'networkinited' of the map.
     * @param map
     */
    onNetworkInited(map) {
        const nodes = map.getNodes(), me = this;
        nodes.forEach(node => {
            if (!node.parentId)
                me.togglePaths(node);
        });
    },
    onNetworkDrag(pointer) {
        const lastPointer = this.getLastPointer();
        if (lastPointer) {
            const
                // is d-map-view-container ( what we need)
                element = this.element.dom, pan = {
                    x: pointer.x - lastPointer.x,
                    y: pointer.y - lastPointer.y
                };
            element.scrollLeft -= pan.x;
            element.scrollTop -= pan.y;
        }
        this.setLastPointer(pointer);
    },
    onNetworkDragEnd() {
        this.setLastPointer(null);
    },
    /**
     * Handler of the event 'select' of the map.
     * Tries to show a fullscreen of the related block
     * @param {CJ.view.map.view.Map} map
     * @param {Array} selected
     */
    onSelect(map, selected) {
        const nodeId = selected.nodes[0];
        let nodeData;
        if (!nodeId)
            return;
        nodeData = map.getNodes().get(nodeId);
        if (!nodeData.isAllowed)
            return CJ.Msg.feedback({
                message: CJ.t('view-map-view-container-no-access', true),
                duration: '3000'
            });
        if (!nodeData.docId)
            return CJ.Msg.feedback({
                message: CJ.t('view-map-view-container-no-related-activity', true),
                duration: '3000'
            });
        CJ.History.keepPopups = true;
        CJ.app.redirectTo(CJ.tpl('!m/{0}', nodeData.docId));
    },
    /**
     * Handler of the global event 'popuphide'.
     * Make a request to check a completeness of related block.
     * @param {CJ.core.view.Popup} popup
     */
    onBlockInteractionFinish(popup) {
        if (this.getPopup() == popup)
            return;
        let block;
        if (!popup.getBlock) {
            const content = popup.getContent();
            if (content && content.getBlock)
                block = content.getBlock();
        } else {
            block = popup.getBlock();
        }
        if (!(block && block.isBlock))
            return;
        CJ.LoadBar.run({ renderTo: this.element });
        block.requestCompleteness({
            scope: this,
            success: this.onRequestCompletenessSuccess
        });
    },
    /**
     * Success handler of the completeness request.
     * Updates completeness of the node.
     * @param {Object} response
     * @param {Object} request
     */
    onRequestCompletenessSuccess(response, request) {
        CJ.LoadBar.finish();
        const map = this.getMap();
        const nodes = map.getNodes();
        const docId = request.initialConfig.params.docId;
        const nodeData = this.getNodeDataByDocId(docId);
        let isAllowed = false;
        let parentNodeId;
        if (!nodeData)
            return;
        parentNodeId = nodeData.parentId;
        if (parentNodeId && map.isAccessible(nodes.get(parentNodeId)))
            isAllowed = true;
        Ext.apply(nodeData, {
            completeness: response.ret,
            isAllowed
        });
        map.updateNode(nodeData);
        this.togglePaths(nodeData);
    },
    /**
     * Handler on the event 'hide'
     */
    onHide() {
        const map = this.getMap(), nodes = map.getNodes(), block = this.getBlock();
        Ext.each(block.getNodes(), node => {
            node.completeness = nodes.get(node.id).completeness;
        });
    },
    /**
     * Toggles paths, it depends on accessible of node.
     * @param {Object} nodeData
     */
    togglePaths(nodeData) {
        const map = this.getMap(), nodes = map.getNodes(), network = map.getNetwork(), node = network.body.nodes[nodeData.id];
        Ext.each(node.edges, function (edge) {
            let toNodeId = edge.toId, toNodeData;
            if (toNodeId == node.id)
                toNodeId = edge.fromId;
            toNodeData = nodes.get(toNodeId);    // skip it in case if the edge with parent node
            // skip it in case if the edge with parent node
            if (nodeData.parentId == toNodeData.id)
                return true;
            map.updateNode({
                id: toNodeId,
                isAllowed: map.isAccessible(toNodeData)
            });    // next marker doesn't have a question, or it was already solved.
            // next marker doesn't have a question, or it was already solved.
            this.togglePaths(toNodeData);
        }, this);
    },
    /**
     * Returns node data by document id.
     * @param {Number} docId
     * @returns {Object}
     */
    getNodeDataByDocId(docId) {
        const map = this.getMap();
        let nodeData;
        map.getNodes().forEach(data => {
            if (data.docId == docId)
                nodeData = data;
        });
        return nodeData;
    },
    /**
     * @return {undefined}
     */
    destroy() {
        CJ.un('popuphide', this.onBlockInteractionFinish, this);
        CJ.Block.requestCompleteness(this.getBlock());
        this.callParent(args);
    }
});