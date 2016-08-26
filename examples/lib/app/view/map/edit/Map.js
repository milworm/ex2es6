import 'app/view/map/Map';

/**
 * The class provides the map component for editing of map block.
 */
Ext.define('CJ.view.map.edit.Map', {
    /**
     * @inheritdoc
     */
    extend: 'CJ.view.map.Map',
    /**
     * @inheritdoc
     */
    xtype: 'view-map-edit-map',
    /**
     * @inheritdoc
     */
    config: {
        /**
         * @inheritdoc
         */
        editing: true,
        /**
         * @inheritdoc
         */
        markersConfig: {
            defaultNormal: { src: `${ Core.opts.resources_root }/resources/images/map/s1.png` },
            defaultHighlighted: { src: `${ Core.opts.resources_root }/resources/images/map/s2.png` }
        }
    },
    /**
     * Reflows the map in case when the map is inited.
     * @param {Boolean} state
     */
    updateMarkersConfigured(state) {
        if (!state)
            return;
        if (this.getNetwork())
            return this.reflow();
        this.callParent(args);
    },
    /**
     * Adds a node to the vis.DataSet of nodes.
     * Returns an id of new node.
     * @param {Object} config
     * @returns {Number}
     */
    addNode(config) {
        config = this.configureNode(config);
        this.getNodes().add(config);
        this.fireEvent('nodeadd', this, config);
        return config.id;
    },
    /**
     * Configures a node.
     * @param {Object} config
     * @returns {Object}
     */
    configureNode(config) {
        const network = this.getNetwork(), markers = this.getMarkers();
        Ext.applyIf(config, {
            id: this.generateNodeId(),
            label: '',
            allowedToMoveX: true,
            allowedToMoveY: true,
            shape: 'image'
        });
        if (network && network.selectionHandler && network.selectionHandler.getSelectedNodes()[0] == config.id)
            config.image = markers.defaultHighlighted;
        else
            config.image = markers.defaultNormal;
        return config;
    },
    /**
     * Generates a node id.
     * @returns {Number}
     */
    generateNodeId() {
        const nodes = this.getNodes(), lastId = nodes && Ext.Array.max(nodes.getIds());
        return (lastId || 0) + 1;
    },
    /**
     * Adds an edge to the vis.Data of edges.
     * Returns an id on new edge.
     * @param {Object} config
     * @returns {Number}
     */
    addEdge(config) {
        config = this.configureEdge(config);
        this.getEdges().add(config);
        this.updateNode({
            id: config.to,
            parentId: config.from
        });
        this.fireEvent('edgeadd', this, config);
        return config.id;
    },
    /**
     * Configures an edge.
     * @param {Object} config
     * @returns {Object}
     */
    configureEdge(config) {
        Ext.applyIf(config, { id: this.generateEdgeId() });
        config.color = CJ.Utils.hexToRgba(this.getEdgeColor());
        return config;
    },
    /**
     * Generates an edge id.
     * @returns {number}
     */
    generateEdgeId() {
        const edges = this.getEdges(), lastId = edges && Ext.Array.max(edges.getIds());
        return (lastId || 0) + 1;
    },
    /**
     * Removes selected nodes an edges
     */
    removeSelected() {
        const network = this.getNetwork(), selected = network.getSelection(), nodes = this.getNodes(), edges = this.getEdges(), selectedNodes = nodes.get(selected.nodes), selectedEdges = edges.get(selected.edges);
        if (selectedEdges.length) {
            edges.remove(selected.edges);
            this.fireEvent('edgeremove', this, selectedEdges);
        }
        if (selectedNodes.length) {
            nodes.remove(selected.nodes);
            this.fireEvent('noderemove', this, selectedNodes);
        }
    }
});