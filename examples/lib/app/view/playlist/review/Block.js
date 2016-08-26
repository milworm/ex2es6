import 'app/view/block/DefaultBlock';

Ext.define('CJ.view.playlist.review.Block', {
    extend: 'CJ.view.block.DefaultBlock',
    xtype: 'view-playlist-review-block',
    isPlaylistReviewBlock: true,
    config: {
        headerTpl: Ext.create('Ext.XTemplate', [
            '<tpl if="reuseInfo && reuseInfo.userInfo">',
            '<div class="d-user-icon d-creator-icon" ',
            'style="background-image: url({reuseInfo.userInfo.icon});">',
            '</div>',
            '</tpl>',
            '<div class="d-user-icon" style="background-image: url({userInfo.icon})"></div>',
            '<div class="d-content">',
            '<div class="d-title">{userInfo.name}</div>',
            '</div>',
            '<div class="x-button delete"></div>',
            '<tpl if="!reuseInfo || (reuseInfo && !reuseInfo.reusesContent)">',
            '<div class="x-button edit"></div>',
            '</tpl>'
        ])
    },
    /**
     * @inheritdoc
     */
    getElementConfig() {
        return {
            reference: 'element',
            children: [{
                    className: 'd-wrapper',
                    children: [
                        {
                            className: 'd-block-content',
                            children: [
                                { className: 'd-header' },
                                {
                                    reference: 'innerElement',
                                    classList: [
                                        'x-inner',
                                        'd-body'
                                    ]
                                }
                            ]
                        },
                        { className: 'd-footer' }
                    ]
                }]
        };
    },
    initialize() {
        this.callParent(args);
        this.tapListeners = Ext.apply({
            '.d-header .x-button.edit': 'onEditTap',
            '.d-header .x-button.delete': 'onDeleteTap'
        }, this.tapListeners);
        this.element.dom.addEventListener('touchmove', e => {
            e.stopPropagation();
        });
        if (this.isReused())
            this.element.dom.classList.add('d-reused');
    },
    applyQuestion(config) {
        if (Ext.isObject(config))
            config.answer = null;
        return this.callParent([config]);
    },
    /**
     * @param {Ext.dom.Event} e
     */
    onElementTap(e) {
        this.callParent(args);
        if (e.isStopped)
            return;
        this.fireEvent('blocktap', this.getIndex());
    },
    onEditTap(e) {
        e.stopPropagation();
        this.fireEvent('blockedit', this.getIndex());
    },
    onDeleteTap(e) {
        e.stopPropagation();
        CJ.confirm('block-popup-options-confirm-title', 'reused-block-popup-options-confirmtext', function (state) {
            if (state == 'yes') {
                this.fireEvent('blockremove', this.getIndex());
            }
        }, this);
    },
    getIndex() {
        return this.parent.indexOf(this);
    },
    onOwnerUserTap: Ext.emptyFn,
    onContentTap: Ext.emptyFn
});