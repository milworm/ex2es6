import 'app/core/view/Popup';

Ext.define('CJ.view.tutorial.Popup', {
    extend: 'CJ.core.view.Popup',
    xtype: 'view-tutorial-popup',
    config: {
        cls: 'd-tutorial',
        titleBar: false,
        content: true,
        skipButton: true,
        nextButton: true,
        doneButton: false
    },
    initialize() {
        this.callParent(args);
        this.addCls(CJ.User.get('language'));
    },
    updateTitleBar: Ext.emptyFn,
    applyContent(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        Ext.applyIf(config, {
            xtype: 'carousel',
            height: 475,
            indicator: { bottom: -35 },
            animation: { duration: 1000 },
            defaults: {
                xtype: 'component',
                baseCls: 'wrapper',
                data: {}
            },
            items: [
                {
                    cls: 'get-started',
                    tpl: [
                        '<div class="image"></div>',
                        '<div class="description">',
                        '{[CJ.t("view-tutorial-get-started-desc")]}',
                        '</div>'
                    ]
                },
                {
                    cls: 'multimedia',
                    tpl: [
                        '<div class="image"></div>',
                        '<div class="description">',
                        '{[CJ.t("view-tutorial-multimedia-desc")]}',
                        '</div>'
                    ]
                },
                {
                    cls: 'playlists',
                    tpl: [
                        '<div class="image"></div>',
                        '<div class="description">',
                        '{[CJ.t("view-tutorial-playlists-desc")]}',
                        '</div>'
                    ]
                },
                {
                    cls: 'discover',
                    tpl: [
                        '<div class="image"></div>',
                        '<div class="description">',
                        '{[CJ.t("view-tutorial-discover-desc")]}',
                        '</div>'
                    ]
                },
                {
                    cls: 'follow',
                    tpl: [
                        '<div class="image"></div>',
                        '<div class="description">',
                        '{[CJ.t("view-tutorial-follow-desc")]}',
                        '</div>'
                    ]
                },
                {
                    cls: 'groups',
                    tpl: [
                        '<div class="image"></div>',
                        '<div class="description">',
                        '{[CJ.t("view-tutorial-groups-desc")]}',
                        '</div>'
                    ]
                }
            ],
            listeners: {
                activeitemchange: this.onActiveItemChange,
                scope: this
            }
        });
        return this.callParent([config]);
    },
    onActiveItemChange(carousel, newItem) {
        const index = carousel.indexOf(newItem), isLastIndex = index == carousel.items.length - 1;
        this.setNextButton(!isLastIndex);
        this.setDoneButton(isLastIndex);
    },
    applySkipButton(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        Ext.applyIf(config, {
            xtype: 'button',
            cls: 'skip',
            text: CJ.t('view-tutorial-skip-button-text'),
            handler: this.onSkipButtonTap,
            scope: this
        });
        return Ext.factory(config);
    },
    onSkipButtonTap() {
        this.hide();
    },
    updateSkipButton: CJ.Utils.updateComponent,
    applyNextButton(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        Ext.applyIf(config, {
            xtype: 'button',
            cls: 'next',
            text: CJ.t('view-tutorial-next-button-text'),
            isNextButton: true,
            handler: this.onNextButtonTap,
            scope: this
        });
        return Ext.factory(config);
    },
    updateNextButton: CJ.Utils.updateComponent,
    onNextButtonTap() {
        this.down('carousel').next();
    },
    applyDoneButton(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        Ext.applyIf(config, {
            xtype: 'button',
            cls: 'done',
            text: CJ.t('view-tutorial-done-button-text'),
            isNextButton: true,
            handler: this.onDoneButtonTap,
            scope: this
        });
        return Ext.factory(config);
    },
    updateDoneButton: CJ.Utils.updateComponent,
    onDoneButtonTap() {
        this.hide();
    }
});