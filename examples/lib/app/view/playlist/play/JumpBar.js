import 'app/core/view/Component';

Ext.define('CJ.view.playlist.play.JumpBar', {
    xtype: 'view-playlist-play-jump-bar',
    extend: 'CJ.core.view.Component',
    config: {
        container: null,
        type: 'light',
        cls: 'd-jump-bar d-hbox d-hcenter',
        tpl: Ext.create('Ext.XTemplate', '<div class="d-jump-bar-inner d-hbox {[values.isAnimating ? "d-unavailable": ""]}">', '<tpl for="items">', '<tpl if="xcount != xindex">', '<div class="d-item {[xindex != (parent.active + 1) ? "": "d-active"]}" data-item-number="{#}">{#}</div>', '</tpl>', '</tpl>', '</div>'),
        data: null
    },
    initialize() {
        this.callParent(args);
        this.element.on({
            tap: this.onTap,
            scope: this
        });
    },
    onTap(e) {
        const target = e.getTarget('.d-item', 3);
        if (!target || this.getData().isAnimating)
            return;
        const item = CJ.Utils.getNodeData(target, 'itemNumber');
        if (item)
            this.fireEvent('item.set', item - 1);
    },
    updateData() {
        this.callParent(args);
        const active = this.element.dom.querySelector('.d-active');
        const list = this.element.dom.querySelector('.d-jump-bar-inner');
        let activeBox;
        if (!(active && list))
            return;    // scrollLeft 0 to reinitialize bounding client rect left.
        // scrollLeft 0 to reinitialize bounding client rect left.
        list.scrollLeft = 0;
        activeBox = active.getBoundingClientRect();
        list.scrollLeft = activeBox.left + activeBox.width / 2 - window.innerWidth / 2;
    }
});