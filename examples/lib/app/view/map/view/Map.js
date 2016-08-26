import 'app/view/map/Map';

/**
 * The class provides the map component for editing of map block.
 */
Ext.define('CJ.view.map.view.Map', {
    /**
     * @inheritdoc
     */
    extend: 'CJ.view.map.Map',
    /**
     * @inheritdoc
     */
    xtype: 'view-map-view-map',
    /**
     * @inheritdoc
     */
    config: {
        /**
         * @inheritdoc
         */
        markersConfig: {
            passed: { src: `${ Core.opts.resources_root }/resources/images/map/s2.png` },
            allowed: { src: `${ Core.opts.resources_root }/resources/images/map/s1.png` },
            locked: `${ Core.opts.resources_root }/resources/images/map/locked.png`
        }
    },
    /**
     * Configures a node.
     * @param {Object} config
     * @returns {Object}
     */
    configureNode(config) {
        const markers = this.getMarkers();
        let isAllowed = config.isAllowed;
        const isPassed = this.isPassed(config);
        Ext.applyIf(config, {
            label: '',
            shape: 'image',
            fixed: true
        });
        if (!config.parentId && !isPassed)
            isAllowed = true;
        config.isPassed = isPassed;
        config.isAllowed = isAllowed || isPassed;
        switch (true) {
        case isPassed:
            config.image = markers.passed;
            break;
        case isAllowed:
            config.image = markers.allowed;
            break;
        default:
            config.image = markers.locked;
        }
        return config;
    },
    initNetwork() {
        const options = this.getOptions();    // don't show any selection on edges in view mode
        // don't show any selection on edges in view mode
        options.edges.selectionWidth = 0;
        this.setOptions(options);
        this.callParent(args);
    },
    /**
     * Configures an edge.
     * @param {Object} config
     * @returns {Object}
     */
    configureEdge(config) {
        Ext.apply(config, { color: CJ.Utils.hexToRgba(this.getEdgeColor()) });
        return config;
    },
    /**
     * Returns true in case when node is passed.
     * @param {Object} nodeData
     * @returns {Boolean}
     */
    isPassed(nodeData) {
        const parentId = nodeData.parentId;    // we allow users to move forward only if parent node is passed.
        // we allow users to move forward only if parent node is passed.
        if (parentId) {
            const nodes = this.getNodes();
            let parentNode;
            let parentNodePassed;
            if (nodes)
                parentNode = nodes.get(parentId);
            if (parentNode)
                parentNodePassed = parentNode.isPassed;
            if (!parentNodePassed)
                return false;
        }
        const completeness = nodeData.completeness;
        if (!completeness)
            return true;    // if block has no question we need to act accordingly
        // if block has no question we need to act accordingly
        if (completeness.total == 0)
            return true;
        let completenessRate = 0, allQuestionsAnswered = false;
        if (completeness.incorrect + completeness.complete == completeness.total)
            allQuestionsAnswered = true;
        if (completeness.total == completeness.notvalidatable)
            completenessRate = 100;
        else
            completenessRate = completeness.complete / completeness.total * 100;
        return completenessRate >= nodeData.completionRate && allQuestionsAnswered;
    },
    /**
     * Returns true in case when node is passed or
     * a block that related to node doesn't has a question.
     * @param {Object} nodeData
     * @returns {Boolean}
     */
    isAccessible(nodeData) {
        const parentNode = nodeData.parentId ? this.getNodes().get(nodeData.parentId) : null;
        if (!parentNode && !nodeData.parentId || parentNode && parentNode.isPassed)
            return true;
        else
            return false;
    }
});