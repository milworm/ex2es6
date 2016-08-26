import 'Ext/Component';

/* [TODO] (side scrolling functionality with arrows(SEE DESIGN))
    due to time and deadline comming fast ,
    this class on refactor I purposefully removed side scrolling functionality
    since we only have 1 use case for now that contains only 2 elements (it works just right)

    It will be implemented back when we will get the time
    or if I get the time before the 1.7 release

*/
Ext.define('CJ.view.popovers.PopoverMenu', {
    extend: 'Ext.Component',
    xtype: 'view-popovers-popovermenu',
    scrollableElement: null,
    overlayElement: null,
    isDragging: false,
    config: {
        cls: 'd-popover-menu',
        callbackScope: null,
        callbackFn: null,
        // use to prevent closing if caller uses touchend
        skipFirstTouchend: false,
        stash: null,
        /**
         * @cfg {Boolean} noTranslation Used when we have custom rules for translation.
         */
        noTranslation: false,
        tpl: Ext.create('Ext.XTemplate', '<div class="d-inner-popover-menu">', '<div class="d-inner-scrollable">', '<div class="d-dummy d-left-side">&nbsp;</div>', '<tpl for="choices">', '<div class="d-button" data-button-value="{value}">{text}</div>', '<tpl if="xindex < xcount">', '<div class="d-middle-bar"></div>', '</tpl>', '</tpl>', '<div class="d-dummy d-right-side">&nbsp;</div>', '</div>', '<div class="d-popover-menu-overlay"></div>', '</div>'),
        handleContextMenuEvent: false
    },
    statics: {
        showTo(config) {
            return Ext.factory(Ext.apply({
                xtype: 'core-view-popover',
                position: {
                    x: 'middle',
                    y: 'bottom'
                },
                cls: 'd-no-padding d-dark-themed',
                innerComponent: Ext.apply(config.innerComponent, { xtype: this.xtype })
            }, config));
        }
    },
    initialize(config) {
        this.callParent(args);
        this.overlayElement = this.element.dom.querySelector('.d-popover-menu-overlay');
        this.scrollableElement = this.element.dom.querySelector('.d-inner-scrollable');
        this.attachListeners();
    },
    onTap(e) {
        if (!this.isDragging && !this.getSkipFirstTouchend()) {
            if (!e.getTarget('.d-popover-menu'))
                this.fireEvent('close');
            if (e.getTarget('.d-button', 5)) {
                const value = CJ.Utils.getNodeData(e.target, 'buttonValue');
                if (this.initialConfig.callbackScope && this.initialConfig.callbackFn)
                    Ext.callback(this.initialConfig.callbackFn, this.initialConfig.callbackScope, [
                        value,
                        this.getStash()
                    ]);
                this.fireEvent('close');
            }
        }
        if (this.getSkipFirstTouchend())
            this.setSkipFirstTouchend(false);
        if (this.isDragging)
            this.isDragging = false;
    },
    onDrag(e) {
        this.isDragging = true;
    },
    applyData(data) {
        if (!this.getNoTranslation())
            this.translateChoices(data);
        return data;
    },
    translateChoices(config) {
        for (let choices = config.choices, i = choices.length - 1; i >= 0; i--) {
            choices[i].text = CJ.t(choices[i].text);
        }
    },
    attachListeners() {
        const me = this;
        me.element.on('touchend', me.onTap, me);
        me.element.on('touchmove', me.onDrag, me);
        if (me.getHandleContextMenuEvent())
            Ext.Viewport.element.on('contextmenu', me.onViewportRightClick, me);
    },
    onViewportRightClick() {
        this.fireEvent('close');
    },
    destroy() {
        Ext.Viewport.element.un('contextmenu', this.onViewportRightClick, this);
        this.callParent(args);
    }
});