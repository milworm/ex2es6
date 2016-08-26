import 'Ext/Component';

/**
 * The class provides the base map component, that adapts visjs network.
 * For details see:
 * http://visjs.org/docs/network/
 */
Ext.define('CJ.view.map.Map', {
    /**
     * @inheritdoc
     */
    extend: 'Ext.Component',
    /**
     * @inheritdoc
     */
    xtype: 'view-map-map',
    /**
     * @inheritdoc
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-map',
        /**
         * @property {Boolean} editing
         * Preset in order to enable or disable editor features on view/play mode.
         */
        editing: false,
        /**
         * @cfg {String} image
         */
        image: null,
        /**
         * @property {Boolean} imageLoaded
         * True in case when an images is loaded.
         */
        imageLoaded: false,
        /**
         * @property {Object} imageSize
         * Contains origin width, height and ratio of an image.
         * Sets when an image is loaded.
         */
        imageSize: null,
        /**
         * @config {Object} markers
         * Contains configured markers,
         * key - name, value - url or base64 of an image.
         */
        markers: {},
        /**
         * @config {Object} markersConfig
         * Contains configuration for markers,
         * key - name, value - url or object.
         * If value is object, image will be generated,
         * for details see method 'makeMarker' of this class.
         */
        markersConfig: {},
        /**
         * @property {Boolean} markersConfigured
         * True in case when markers are configured.
         */
        markersConfigured: false,
        /**
         * @cfg {String} nodeColor
         */
        nodeColor: '#fff',
        /**
         * @cfg {String} nodeColor
         */
        edgeColor: '#fff',
        /**
         * @cfg {Number} nodeRadius
         */
        nodeRadius: 30,
        /**
         * @cfg {String} startMarkerColor
         */
        startMarkerColor: '#fbb600',
        /**
         * @cfg {String} startMarkerAdditionalRadius
         */
        startMarkerAdditionalRadius: 3,
        /**
         * @cfg {Array} nodes
         * Array of nodes.
         */
        nodes: [],
        /**
         * @cfg {Array} edges
         * Array of edges.
         * Generates automatically, based on parentId of node.
         */
        edges: [],
        /**
         * @cfg {Object} options
         * Options for visjs network, for details see:
         * http://visjs.org/docs/network/
         */
        options: {
            autoResize: false,
            physics: {
                enabled: false,
                stabilization: true
            },
            edges: {
                selectionWidth: 2,
                width: 10,
                shadow: {
                    enabled: true,
                    size: 6,
                    x: 0,
                    y: 0
                },
                smooth: false
            },
            nodes: {
                borderWidthSelected: 5,
                shadow: {
                    enabled: true,
                    size: 6,
                    x: 0,
                    y: 0
                }
            },
            interaction: {
                zoomView: false,
                dragView: false
            }
        },
        /**
         * @property {vis.Network} network
         */
        network: null
    },
    /**
     * @inheritdoc
     */
    initialize() {
        this.callParent(args);
        this.on({
            imageloaded: this.onImageLoaded,
            scope: this
        });
        Ext.Viewport.on('resize', this.onViewportResize, this);    // hack starts here ( in order to pass the dragging event to container to be able to pan)
        // hack starts here ( in order to pass the dragging event to container to be able to pan)
        this.element.onDom('touchmove', this.onNetworkDOMDragging, this);
        this.element.onDom('touchend', this.onNetworkDOMDragEnd, this);
    },
    /**
     * @inheritdoc
     */
    getElementConfig() {
        return {
            reference: 'element',
            children: [
                {
                    reference: 'img',
                    className: 'd-image'
                },
                {
                    reference: 'inner',
                    className: 'd-inner'
                }
            ]
        };
    },
    /**
     * @inheritdoc
     */
    destroy() {
        this.callParent(args);
        const network = this.getNetwork();
        if (network)
            network.destroy();
        Ext.Viewport.un('resize', this.onViewportResize, this);
    },
    /**
     * Handler of the event 'resize' of the Viewport.
     * Reinitialize the network on new dimensions.
     */
    onViewportResize: function self() {
        const network = this.getNetwork();
        if (network)
            network.destroy();
        clearTimeout(self.resizeTimer);
        self.resizeTimer = Ext.defer(function () {
            if (!this.getNetwork())
                return;
            this.initNetwork();
        }, 500, this);
    },
    /**
     * Handler of the event 'imageloaded'.
     * Initializes a network if markers configured.
     */
    onImageLoaded() {
        this.setImageLoaded(true);
        if (!this.getNetwork() && this.getMarkersConfigured())
            this.initNetwork();
    },
    /**
     * Updates and preloads an image.
     * @param {String} image
     */
    updateImage(image) {
        const img = new Image(), loadBar = CJ.LoadBar;
        if (!loadBar.isRunning())
            loadBar.run({ renderTo: this.element });
        img.src = image;
        img.onload = Ext.bind(function (e) {
            const target = e.target;
            this.setImageSize({
                width: target.width,
                height: target.height,
                factor: target.width / target.height
            });
            this.img.addCls('shown');
            this.img.setStyle({ backgroundImage: CJ.Utils.getBackgroundUrl(e.target.src) });
            this.fireEvent('imageloaded', this);
            loadBar.finish();
        }, this);
    },
    /**
     * Creates vis.DataSet by nodes config,
     * that uses for network.
     * @param {Array} nodes
     * @returns {vis.DataSet}
     */
    applyNodes(nodes) {
        const dataSet = new vis.DataSet(), configured = [];
        Ext.each(nodes, function (node) {
            configured.push(this.configureNode(node));
        }, this);
        dataSet.add(configured);
        return dataSet;
    },
    /**
     * Updates vis.DataSet with nodes.
     * @param {vis.DataSet} nodes
     */
    updateNodes(nodes) {
        this.setEdges(this.generateEdges(nodes));
    },
    /**
     * Updates the node in the network.
     * @param {Object} config
     * @param {Number} config.id
     */
    updateNode(config) {
        const nodes = this.getNodes(), data = nodes.get(config.id);
        Ext.apply(data, config);
        nodes.update(this.configureNode(data));
    },
    /**
     * Configures the node, might be reloaded in subclasses.
     * @param {Object} config
     * @returns {Object}
     */
    configureNode(config) {
        return config;
    },
    /**
     * Generates and returns edges config based on parentId of nodes
     * @param {vis.DataSet} nodes
     * @returns {Array}
     */
    generateEdges(nodes) {
        const edges = [];
        nodes.forEach(nodeData => {
            if (nodeData.parentId)
                edges.push({
                    id: edges.length + 1,
                    from: nodeData.parentId,
                    to: nodeData.id
                });
        });
        return edges;
    },
    /**
     * Creates vis.DataSet by edges config,
     * that uses for network.
     * @param {Array} edges
     * @returns {vis.DataSet}
     */
    applyEdges(edges) {
        const dataSet = new vis.DataSet(), configured = [];
        Ext.each(edges, function (edge) {
            configured.push(this.configureEdge(edge));
        }, this);
        dataSet.add(edges);
        return dataSet;
    },
    /**
     * Updates the edge in the network.
     * @param {config} config
     * @param {Number} config.id
     */
    updateEdge(config) {
        const edges = this.getEdges(), data = edges.get(config.id);
        Ext.apply(data, config);
        edges.update(this.configureEdge(data));
    },
    /**
     * Configures the edge, might be reloaded in subclasses.
     * @param {Object} config
     * @returns {Object}
     */
    configureEdge(config) {
        return config;
    },
    /**
     * Updates markers config.
     */
    updateMarkersConfig(config) {
        this.configureMarkers(config);
    },
    /**
     * Updates node color.
     * Reconfigures markers if the network is inited.
     */
    updateNodeColor() {
        if (this.getNetwork())
            this.configureMarkers();
    },
    /**
     * Updates edge color.
     * Reflows the network if the network is inited.
     */
    updateEdgeColor() {
        if (this.getNetwork())
            this.reflow();
    },
    /**
     * Updates markers configured state.
     * @param {Boolean} state
     */
    updateMarkersConfigured(state) {
        if (!state)
            return;
        if (this.getImageLoaded() && !this.getNetwork())
            this.initNetwork();
    },
    /**
     * Configures markers.
     * @param {Object} [config]
     */
    configureMarkers(config) {
        config = Ext.clone(config || this.getMarkersConfig());
        let nodeColor = this.getNodeColor();
        const configured = {};
        let pending = 0;
        nodeColor = CJ.Utils.hexToRgba(nodeColor);
        this.setMarkersConfigured(false);
        Ext.iterate(config, function (key, value) {
            if (Ext.isString(value)) {
                configured[key] = value;
                return true;
            }
            pending++;
            value = Ext.apply({
                color: nodeColor,
                callback(dataUrl) {
                    configured[key] = dataUrl;
                    pending--;
                    if (!pending) {
                        this.setMarkers(configured);
                        this.setMarkersConfigured(true);
                    }
                },
                scope: this
            }, value);
            this.makeMarker(value);
        }, this);
    },
    /**
     * Makes an icon and returns dataUrl of created icon.
     * @param {Object} config
     *                 config.scr {String}
     *                 config.radius {Number}
     *                 config.borderWidth {Number}
     *                 config.borderColor {String}
     *                 config.shadowBlur {Number}
     *                 config.shadowColor {Scting}
     *                 config.color {String}
     *                 config.callback {Function}
     *                 config.scope {Object}
     */
    makeMarker(config) {
        // apply defaults
        Ext.applyIf(config, {
            radius: this.getNodeRadius(),
            borderWidth: 2,
            borderColor: '#fff'
        });
        const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d'), img = new Image(), size = config.radius * 2 + config.borderWidth, center = size / 2;
        canvas.width = size;
        canvas.height = size;
        ctx.beginPath();
        ctx.arc(center, center, config.radius, 0, 2 * Math.PI, false);
        ctx.lineWidth = config.borderWidth;
        ctx.strokeStyle = config.borderColor;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(center, center, config.radius - config.borderWidth / 2 + 1, 0, 2 * Math.PI, false);
        ctx.fillStyle = config.color;
        ctx.fill();
        img.src = config.src;
        img.onload = () => {
            ctx.drawImage(img, center - img.width / 2, center - img.height / 2);
            config.callback.call(config.scope, canvas.toDataURL());
        };
    },
    /**
     * Initializes the network.
     */
    initNetwork() {
        let network;
        this.applyPositions();
        network = new vis.Network(this.inner.dom, {
            nodes: this.getNodes(),
            edges: this.getEdges()
        }, Ext.clone(this.getOptions()));
        network.moveTo({
            position: {
                x: 0,
                y: 0
            }
        });
        network.on('click', Ext.bind(this.onMapClick, this));
        network.on('afterDrawing', Ext.bind(this.onNetworkAfterDraw, this));
        network.on('dragEnd', Ext.bind(this.onNodeDragEnd, this));
        this.setNetwork(network);
        this.fireEvent('networkinited', this);
    },
    onNetworkAfterDraw(ctx) {
        const nodes = this.getNodes();
        const edges = this.getEdges().get();
        const nodeRadius = this.getNodeRadius();
        const startMarkerAdditionalRadius = this.getStartMarkerAdditionalRadius();
        const startMarkerColor = this.getStartMarkerColor();
        const startMarkerTranslate = CJ.t('view-map-block-labels-start', true);
        const startNodes = [];
        let node;    // save config for context (so we don't mess it up)
        // save config for context (so we don't mess it up)
        ctx.save();    // preset before rendering start markers
        // preset before rendering start markers
        ctx.lineWidth = 1;
        ctx.shadowColor = 'rgba(0,0,0,0.75)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px ProximaNova';
        ctx.fillStyle = startMarkerColor;
        ctx.strokeStyle = startMarkerColor;    // @IE10 not supporting setLineDash
        // @IE10 not supporting setLineDash
        if (ctx.setLineDash)
            ctx.setLineDash([startMarkerAdditionalRadius * 2]);
        for (let i = 0, ln = edges.length; i < ln; i++) {
            node = nodes.get(edges[i].from);
            if (!node || node.parentId || startNodes.indexOf(node.id) > -1)
                continue;
            startNodes.push(node.id);
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius + startMarkerAdditionalRadius, 0, 2 * Math.PI, false);
            ctx.stroke();
            ctx.fillText(startMarkerTranslate, node.x, node.y + nodeRadius + 15);
        }    // restore config for context
        // restore config for context
        ctx.restore();
    },
    /**
     * Applies position of markers
     * using original position and factor.
     */
    applyPositions() {
        const factor = this.getFactor();
        this.getNodes().forEach(node => {
            Ext.applyIf(node, {
                originalX: node.x,
                originalY: node.y
            });
            Ext.apply(node, {
                x: node.originalX / factor,
                y: node.originalY / factor
            });
            this.updateNode(node);
        });
    },
    /**
     * Stores original position using factor.
     */
    storePositions() {
        const factor = this.getFactor();
        this.getNetwork().storePositions();
        this.getNodes().forEach(node => {
            Ext.apply(node, {
                originalX: node.x * factor,
                originalY: node.y * factor
            });
            this.updateNode(node);
        });
    },
    /**
     * Returns factor between map image size and map container size on ui.
     * @returns {Number}
     */
    getFactor() {
        const el = this.element;
        const imageSize = this.getImageSize();
        const containerWidth = el.getWidth();
        const containerHeight = el.getHeight();
        const containerFactor = containerWidth / containerHeight;
        let factor;
        if (imageSize.factor > containerFactor)
            factor = imageSize.width / containerWidth;
        else
            factor = imageSize.height / containerHeight;
        return factor;
    },
    /**
     * Unselects all selected and reflow.
     */
    unselectAll() {
        this.getNetwork().selectionHandler.unselectAll();
        this.reflow();
    },
    /**
     * Reflows the network.
     */
    reflow() {
        Ext.each(this.getNodes().getIds(), function (id) {
            this.updateNode({ id });
        }, this);
        Ext.each(this.getEdges().getIds(), function (id) {
            this.updateEdge({ id });
        }, this);
    },
    /**
     * Handler of the event 'select' of the network.
     * @param {Object} data
     * @param {Array} data.nodes
     * @param {Array} data.edges
     */
    onNodeSelect(data) {
        //    this.reflow();
        this.fireEvent('select', this, data);
    },
    onMapClick(data) {
        //this.reflow();
        this.fireEvent('select', this, data);
    },
    onNetworkDOMDragging(e) {
        this.fireEvent('dragging', {
            x: e.touches[0].screenX,
            y: e.touches[0].screenY
        });
    },
    onNetworkDOMDragEnd(e) {
        this.fireEvent('dragend');
    },
    /**
     * Handler of the event 'dragend' of the network.
     * @param {Object} data
     * @param {Array} data.nodeIds
     */
    onNodeDragEnd(data) {
        if (!this.getEditing())
            return;
        if (!data.nodes.length)
            return;
        const network = this.getNetwork(), node = network.body.nodes[data.nodes[0]], imageSize = this.getImageSize(), factor = this.getFactor(), currentWidth = imageSize.width / factor, currentHeight = imageSize.height / factor,
            // (40 - half of the icon width)
            maxX = currentWidth / 2 - 40,
            // ((40 + (start label: 25)) - half of the icon height)
            maxY = currentHeight / 2 - 65, toUpdate = { id: node.id };
        if (Math.abs(node.x) > maxX)
            toUpdate.x = node.x > 0 ? maxX : maxX * -1;
        if (Math.abs(node.y) > maxY)
            toUpdate.y = node.y > 0 ? maxY : maxY * -1;
        if (toUpdate.x || toUpdate.y)
            this.getNodes().update(toUpdate);
        this.storePositions();
        this.fireEvent('dragend', this, data);
    }
});