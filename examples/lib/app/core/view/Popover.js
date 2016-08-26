import 'Ext/Component';

Ext.define('CJ.core.view.Popover', {
    /**
     * @inheritdoc
     */
    extend: 'Ext.Component',
    /**
     * @inheritdoc
     */
    xtype: 'core-view-popover',
    config: {
        /**
         * @inheritdoc
         */
        baseCls: 'd-core-view-popover',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-popover-inner',
        /**
         * @cfg {Object} position
         * @cfg {String} position.x         Possible values: 'left, right, middle'
         * @cfg {String} position.y         Possible values: 'top, bottom, middle'
         * @cfg {Boolean} position.inside   If true will place the popover inside
         * @cfg {Boolean} position.noArrow  If true will remove the arrow on the popover
         */
        position: {
            x: 'middle',
            y: 'middle'
        },
        targetBounds: null,
        target: null,
        offset: {
            x: 0,
            y: 0
        },
        closeOnTap: true,
        innerComponent: null
    },
    statics: {
        show(config) {
            return Ext.factory(Ext.apply({ xtype: this.xtype }, config));
        }
    },
    constructor(config) {
        this.callParent(args);
        if (this.getCloseOnTap())
            this.attachListeners();
        this.renderTo(Ext.Viewport.bodyElement);
        this.element.dom.style.zIndex = CJ.ZIndexManager.getZIndex();
        this.show();
    },
    show() {
        this.startPositionCycle();
        CJ.Animation.animate({
            el: this.element,
            cls: 'showing',
            after: this.doShow,
            scope: this
        });
    },
    doShow() {
        this.element.replaceCls('showing', 'shown');
    },
    attachListeners() {
        Ext.Viewport.bodyElement.on({
            'touchstart': this.onViewportPoint,
            'contextmenu': this.onViewportPoint,
            scope: this
        });
    },
    onViewportPoint(e) {
        if (!e.getTarget(`#${ this.element.id }`))
            this.close();
    },
    applyTarget(config) {
        if (!config) {
            Ext.Viewport.element.dom;
            this.setPosition({
                x: 'middle',
                y: 'middle'
            });
        }
        return config;
    },
    startPositionCycle() {
        fastdom.write(Ext.bind(this.updatePositionCycle, this));
    },
    applyOffset(config) {
        if (!config)
            return {
                x: 0,
                y: 0,
                inside: false
            };
        config.x = config.x || 0;
        config.y = config.y || 0;
        return config;
    },
    updatePositionCycle() {
        if (this.isDestroyed)
            return;
        const target = this.getTarget();
        let targetBounds;
        if (!target)
            this.close();
        targetBounds = target.getBoundingClientRect();
        this.setBounds(this.calculateBounds(targetBounds));
        this.setTargetBounds(targetBounds);
        Ext.defer(function () {
            fastdom.write(Ext.bind(this.updatePositionCycle, this));
        }, 1, this);
    },
    calculateBounds(targetBounds) {
        const element = this.element.dom, elBounds = element.getBoundingClientRect(), position = this.getPosition(), offset = this.getOffset(), vpBounds = Ext.Viewport.element.dom.getBoundingClientRect(), targetPosition = {};
        targetBounds.halfWidth = targetBounds.width / 2;
        targetBounds.halfHeight = targetBounds.height / 2;
        targetPosition.x = targetBounds.left + targetBounds.halfWidth + offset.x;
        targetPosition.y = targetBounds.top + targetBounds.halfHeight + offset.y;
        targetPosition.width = elBounds.width;
        targetPosition.height = elBounds.height;
        targetPosition.halfWidth = targetPosition.width / 2;
        targetPosition.halfHeight = targetPosition.height / 2;
        if (targetPosition.width >= vpBounds.width - 40) {
            position.x = 'middle';
            position.noArrow = true;
            targetPosition.bLimitWidth = true;
            targetPosition.width = vpBounds.width - 40;
            targetPosition.x = vpBounds.width / 2;
        }
        if (targetPosition.height >= vpBounds.height - 40) {
            position.y = 'middle';
            position.noArrow = true;
            targetPosition.bLimitHeight = true;
            targetPosition.height = vpBounds.height - 40;
            targetPosition.y = vpBounds.height / 2;
        }
        if (position.x == 'middle') {
            targetPosition.left = targetPosition.x - targetPosition.halfWidth;
            if (targetPosition.left + targetPosition.width > vpBounds.width)
                position.x = 'left';
            if (targetPosition.left < 0)
                position.x = 'right';
        }
        if (position.x == 'left') {
            targetPosition.left = targetPosition.x - targetPosition.width;
            if (position.inside)
                targetPosition.left = targetBounds.left + offset.x;
            if (targetPosition.left < 0)
                position.x = 'middle';
        }
        if (position.x == 'right') {
            targetPosition.left = targetPosition.x;
            if (position.inside)
                targetPosition.left = targetBounds.left + targetBounds.width + offset.x - targetPosition.width;
            if (targetPosition.left + targetPosition.width > vpBounds.width)
                position.x = 'middle';
        }
        if (position.y == 'middle') {
            targetPosition.top = targetPosition.y - targetPosition.halfHeight;
            if (targetPosition.top + targetPosition.height > vpBounds.height)
                position.y = 'top';
            if (targetPosition.top < 0)
                position.y = 'bottom';
        }
        if (position.y == 'top') {
            targetPosition.top = targetPosition.y - targetPosition.height;
            if (position.inside)
                targetPosition.top = targetBounds.top;
            if (targetPosition.top < 0)
                position.y = 'middle';
        }
        if (position.y == 'bottom') {
            targetPosition.top = targetPosition.y;
            if (position.inside)
                targetPosition.top = targetBounds.top + targetBounds.height + offset.y - targetPosition.height;
            if (targetPosition.top + targetPosition.height > vpBounds.height)
                position.y = 'middle';
        }
        this.setPosition(position);
        return targetPosition;
    },
    setBounds(config) {
        const element = this.element;
        element.setTop(config.top);
        element.setLeft(config.left);
        if (config.bLimitWidth)
            element.setMaxWidth(config.width);
        if (config.bLimitHeight)
            element.setMaxHeight(config.width);
        this.updateDirectionClasses({
            element,
            position: this.getPosition()
        });
    },
    applyPosition(config) {
        if (!config)
            return {
                x: 'middle',
                y: 'middle'
            };
        return config;
    },
    updateDirectionClasses(config) {
        const el = config.element.dom, classes = el.classList, pos = config.position, hTarget = pos.inside ? 'x-middle' : pos.x == 'middle' ? 'x-middle' : pos.x, vTarget = pos.inside ? 'y-middle' : pos.y == 'middle' ? 'y-middle' : pos.y, horizontals = [
                'x-middle',
                'left',
                'right'
            ], verticals = [
                'y-middle',
                'top',
                'bottom'
            ];
        for (let hz = 0, lnHZ = horizontals.length; hz < lnHZ; hz++) {
            if (hTarget == horizontals[hz] && !classes.contains(horizontals[hz]))
                classes.add(horizontals[hz]);
            else if (hTarget != horizontals[hz] && classes.contains(horizontals[hz]))
                classes.remove(horizontals[hz]);
        }
        for (let vt = 0, lnVT = verticals.length; vt < lnVT; vt++) {
            if (vTarget == verticals[vt] && !classes.contains(verticals[vt]))
                classes.add(verticals[vt]);
            else if (vTarget != verticals[vt] && classes.contains(verticals[vt]))
                classes.remove(verticals[vt]);
        }
        if (pos.noArrow && !classes.contains('d-no-arrow'))
            classes.add('d-no-arrow');
    },
    /**
     * Instantiates the innerComponent
     * @param {Object} config
     */
    applyInnerComponent(config, oldConfig) {
        if (oldConfig)
            oldConfig.destroy();
        return Ext.factory(config);
    },
    /**
     * Adds hiding listeners to the innerComponent
     * and renders it to innerElement
     * @param {Object} innerComponent
     */
    updateInnerComponent(innerComponent) {
        if (!innerComponent)
            return;
        innerComponent.on({
            close: this.close,
            hide: this.close,
            scope: this
        });
        if (innerComponent.hasOwnProperty('setPopover'))
            innerComponent.setPopover(this);
        innerComponent.renderTo(this.element);
    },
    updateTargetBounds(bounds, oldBounds) {
        if (oldBounds && bounds && this.getCloseOnTap()) {
            if (oldBounds.top != bounds.top || oldBounds.left != bounds.left)
                this.close();
        }
    },
    close() {
        CJ.Animation.animate({
            el: this.element,
            cls: 'hiding',
            after: this.destroy,
            scope: this
        });
    },
    destroy() {
        this.setInnerComponent(null);
        this.callParent(args);
    }
});