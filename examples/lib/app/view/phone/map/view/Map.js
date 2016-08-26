import 'app/view/map/view/Map';

Ext.define('CJ.view.phone.map.view.Map', {
    extend: 'CJ.view.map.view.Map',
    xtype: 'view-phone-map-view-map',
    initialize() {
        this.callParent(args);
        const viewport = Ext.Viewport;
        viewport.un('resize', this.onViewportResize, this);
        viewport.on('orientationchange', this.onOrientationChange, this);
    },
    onOrientationChange() {
        const network = this.getNetwork(), el = this.element;
        if (network)
            network.destroy();
        el.setWidth(0);
        el.setHeight(0);
        Ext.defer(this.initNetwork, 16, this);
    },
    initNetwork() {
        this.adaptSize();
        this.callParent(args);
        this.scrollToAllowed();
    },
    adaptSize() {
        const el = this.element;
        const imageSize = this.getImageSize();
        const orientation = Ext.Viewport.getOrientation();
        let width;
        let height;
        if (orientation == 'portrait') {
            height = el.parent().getHeight();
            width = height * imageSize.factor;
        } else {
            width = el.parent().getWidth();
            height = width / imageSize.factor;
        }
        el.setWidth(width);
        el.setHeight(height);
    },
    scrollToAllowed() {
        const el = this.element;
        const scrollableDom = el.dom.parentNode;
        const nodeData = this.findAllowed();
        let pos;
        if (!nodeData)
            return;
        pos = {
            x: el.getWidth() / 2 + nodeData.x,
            y: el.getHeight() / 2 + nodeData.y
        };
        scrollableDom.scrollLeft = pos.x - scrollableDom.clientWidth / 2;
        scrollableDom.scrollTop = pos.y - scrollableDom.clientHeight / 2;
    },
    findAllowed() {
        let nodeData;    // find first allowed node
                         // maybe will be better to find first allowed from beginning
        // find first allowed node
        // maybe will be better to find first allowed from beginning
        this.getNodes().forEach(data => {
            if (data.isAllowed && !data.isPassed && !nodeData)
                nodeData = data;
        });
        return nodeData;
    }
});