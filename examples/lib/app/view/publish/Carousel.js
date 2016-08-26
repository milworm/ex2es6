import 'Ext/Component';
import 'app/view/publish/Popup';
import 'app/view/publish/CategorySelect';
import 'app/view/publish/TagSelect';
import 'app/view/publish/VisibilitySelect';
import 'app/view/publish/PurchasedVisibilitySelect';
import 'app/view/publish/PlaylistForm';
import 'app/view/publish/ExamForm';
import 'app/view/publish/FgaOptions';

/**
 * Defines a component to show different options before publishing:
 * tag-select,
 * category-select,
 * playlist-title form,
 * playlist-exam-mode form,
 * visibility-field,
 * payment form.
 */
Ext.define('CJ.view.publish.Carousel', {
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.PublishCarousel',
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-publish-carousel',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @property {Number} ITEM_WIDTH
         */
        ITEM_WIDTH: 358,
        /**
         * @param {Object} config
         */
        popup(config) {
            Ext.factory({
                xtype: 'view-publish-popup',
                content: Ext.apply({ xtype: this.xtype }, config)
            });
        }
    },
    /**
     * @property {Object} eventedConfig
     */
    eventedConfig: null,
    /**
     * @property {Object} config
     */
    config: {
        floatingCls: null,
        hiddenCls: null,
        styleHtmlCls: null,
        tplWriteMode: null,
        disabledCls: null,
        /**
         * @cfg {CJ.view.block.BaseBlock} block
         */
        block: null,
        /**
         * @cfg {Boolean} useMargin
         */
        useMargin: null,
        /**
         * @cfg {Boolean} loading
         */
        loading: null,
        /**
         * @cfg {Object} titles
         */
        titles: {
            tagSelect: 'view-publish-carousel-tag-select-title',
            categorySelect: 'view-publish-carousel-category-select-title',
            visibilitySelect: 'view-publish-carousel-visibility-select-title',
            playlistForm: 'view-publish-carousel-playlist-form-title',
            examForm: 'view-publish-carousel-exam-form-title',
            purchasedVisibilitySelect: 'view-publish-carousel-purchased-visibility-select-title',
            fgaOptions: 'view-publish-carousel-fga-options-title'
        },
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null,
        /**
         * @cfg {String} type Defines a type of activity [activity, playlist, course etc...] Depending on this property
         *                    carousel will be correctly transformed in order to show correct carousel-items.
         */
        type: 'activity',
        /**
         * @cfg {Array} items
         */
        items: null,
        /**
         * @cfg {Number} activeIndex
         */
        activeIndex: 0,
        /**
         * @cfg {String} cls
         */
        cls: 'd-publish-carousel d-circle-navigation-container d-vbox d-vcenter',
        /**
         * @cfg {String} button
         */
        button: 'publish'
    },
    constructor(config) {
        // just to be sure that tags-array contains staticTags.
        config.tags = Ext.Array.merge(config.staticTags || [], config.tags || []);
        this.callParent(args);
        this.element.on({
            scope: this,
            tap: this.onElementTap,
            swipe: Ext.os.is.Desktop ? false : this.onElementSwipe
        });
        if (this.configureForSmallScreen())
            Ext.Viewport.on('orientationchange', this.configureForSmallScreen, this);    // https://redmine.iqria.com/issues/9851
        // https://redmine.iqria.com/issues/9851
        if (Ext.os.is.iOS7)
            this.setUseMargin(true);
    },
    /**
     * @param {Boolean} state
     * @return {undefined}
     */
    updateLoading(state) {
        this.element[state ? 'addCls' : 'removeCls']('d-loading');
    },
    /**
     * @return {undefined}
     */
    updateUseMargin(state) {
        this.element[state ? 'addCls' : 'removeCls']('d-use-margin');
    },
    /**
     * @return {undefined}
     */
    configureForSmallScreen() {
        const windowWidth = Ext.Viewport.getWindowWidth(), windowHeight = Ext.Viewport.getWindowHeight();
        if (windowWidth >= 360 && windowHeight >= 570) {
            this.self.ITEM_WIDTH = 358;
            this.innerElement.setHeight(null);
            this.innerElement.removeCls('d-small');
            return false;
        } else {
            if (windowWidth >= 360)
                this.self.ITEM_WIDTH = 358;
            else
                this.self.ITEM_WIDTH = windowWidth;
            if (windowHeight >= 570)
                this.innerElement.setHeight(null);
            else
                this.innerElement.setHeight(windowHeight - 170);
            this.innerElement.addCls('d-small');
            return true;
        }
    },
    /**
     * @param {String} type publish, save etc..
     */
    updateButton(type) {
        if (!type)
            return;
        const html = CJ.t(`view-publish-carousel-button-${ type }`);
        this.element.dom.querySelector('.d-bottom-element .d-button').innerHTML = html;
    },
    /**
     * @param {Ext.Evented} e
     */
    onElementTap(e) {
        if (e.getTarget('.d-bottom-element .d-button', 1))
            return this.onButtonTap();
        if (e.getTarget('.d-bottom-element .d-circle-navigation span', 1))
            return this.onNavigationCircleTap(e);
        const carouselItem = e.getTarget('.d-carousel-item');
        if (carouselItem)
            this.onCarouselItemTap(carouselItem);
    },
    /**
     * handles button's tap event.
     */
    onButtonTap() {
        if (this.getLoading())
            return;
        this.getPopup().close();
        this.fireEvent('complete', this.getValues(), this);
    },
    /**
     * method will be called when user taps on navigation circle.
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onNavigationCircleTap(e) {
        this.setActiveIndex(Ext.query('.d-circle-navigation span').indexOf(e.target));
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementSwipe(e) {
        if ([
                'left',
                'right'
            ].indexOf(e.direction) == -1)
            return;
        const index = e.direction == 'left' ? 1 : -1;
        this.setActiveIndex(this.getActiveIndex() + index);
    },
    /**
     * @param {Ext.Element} element
     */
    onCarouselItemTap(element) {
        element = Ext.get(element);
        if (element.hasCls('d-carousel-active-item'))
            return;
        const item = Ext.getCmp(element.id), index = this.getItems().indexOf(item);
        this.setActiveIndex(index);
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            children: [
                {
                    className: 'd-inner-element d-hbox',
                    reference: 'innerElement'
                },
                {
                    className: 'd-bottom-element',
                    html: [
                        '<button class=\'d-button\'></button>',
                        '<div class=\'d-circle-navigation\'></div>'
                    ].join('')
                }
            ]
        };
    },
    /**
     * @param {Number} index
     * @return {Number}
     */
    applyActiveIndex(index) {
        if (index < 0)
            return 0;
        const length = this.getItemsCount();
        if (index >= length)
            return length;
        return index;
    },
    /**
     * @param {Number} newIndex
     * @param {Number} oldIndex
     */
    updateActiveIndex(newIndex, oldIndex) {
        const items = this.getItems(), oldItem = items[oldIndex], newItem = items[newIndex], pixels = newIndex * this.self.ITEM_WIDTH * -1;
        if (oldItem)
            oldItem.removeCls('d-carousel-active-item');
        newItem.addCls('d-carousel-active-item');
        if (this.getUseMargin()) {
            this.innerElement.down('div').setStyle({ marginLeft: `${ pixels }px` });
        } else {
            // @TODO for Chrome we have very strange bug related to composite-layers.
            // https://redmine.iqria.com/issues/10054
            if (Ext.browser.is.Chrome)
                this.innerElement.setLeft(pixels);
            else
                this.innerElement.translate(pixels);
        }
        this.element.set({ 'data-active-step': newIndex });
        this.getPopup().changeTitleBar({
            title: CJ.t(this.getTitles()[newItem.initialConfig.ref]),
            index: this.getActiveIndex() + 1,
            total: this.getItemsCount()
        });
    },
    /**
     * @param {String} type
     * @return {undefined}
     */
    updateType(type) {
        const method = CJ.tpl('get{0}Items', CJ.capitalize(type)), items = this[method]();
        this.setItems(items);
        this.element.addCls(`d-type-${ type }`);
    },
    /**
     * @return {Array} list of items that we need to display for simple activity block-type.
     */
    getActivityItems() {
        return [
            {
                ref: 'categorySelect',
                xtype: 'view-publish-category-select',
                categories: this.initialConfig.categories
            },
            {
                ref: 'tagSelect',
                xtype: 'view-publish-tag-select',
                tags: this.initialConfig.tags,
                staticTags: this.initialConfig.staticTags
            },
            {
                ref: 'visibilitySelect',
                xtype: 'view-publish-visibility-select',
                visibility: this.initialConfig.docVisibility
            }
        ];
    },
    /**
     * @return {Array} list of items that we need to display for simple activity block-type.
     */
    getPlaylistItems() {
        return [
            {
                ref: 'playlistForm',
                xtype: 'view-publish-playlist-form',
                title: this.initialConfig.title,
                description: this.initialConfig.description,
                iconCfg: this.initialConfig.iconCfg
            },
            {
                ref: 'examForm',
                xtype: 'view-publish-exam-form',
                badge: this.initialConfig.badge,
                passingGrade: this.initialConfig.passingGrade
            },
            {
                ref: 'categorySelect',
                xtype: 'view-publish-category-select',
                categories: this.initialConfig.categories
            },
            {
                ref: 'tagSelect',
                xtype: 'view-publish-tag-select',
                tags: this.initialConfig.tags,
                staticTags: this.initialConfig.staticTags
            },
            {
                ref: 'visibilitySelect',
                xtype: 'view-publish-visibility-select',
                visibility: this.initialConfig.docVisibility,
                licensingOptions: this.initialConfig.licensingOptions
            }
        ];
    },
    /**
     * @return {Array} list of items that we need to display for simple activity block-type.
     */
    getCourseItems() {
        return [
            {
                ref: 'categorySelect',
                xtype: 'view-publish-category-select',
                categories: this.initialConfig.categories
            },
            {
                ref: 'tagSelect',
                xtype: 'view-publish-tag-select',
                tags: this.initialConfig.tags,
                staticTags: this.initialConfig.staticTags
            },
            {
                ref: 'visibilitySelect',
                xtype: 'view-publish-visibility-select',
                visibility: this.initialConfig.docVisibility,
                licensingOptions: this.initialConfig.licensingOptions
            },
            {
                ref: 'fgaOptions',
                xtype: 'view-publish-fga-options',
                totalHours: this.initialConfig.totalHours
            }
        ];
    },
    /**
     * @return {Array} list of items that we need to display for simple activity block-type.
     */
    getMapItems() {
        return [
            {
                ref: 'categorySelect',
                xtype: 'view-publish-category-select',
                categories: this.initialConfig.categories
            },
            {
                ref: 'tagSelect',
                xtype: 'view-publish-tag-select',
                tags: this.initialConfig.tags,
                staticTags: this.initialConfig.staticTags
            },
            {
                ref: 'visibilitySelect',
                xtype: 'view-publish-visibility-select',
                visibility: this.initialConfig.docVisibility,
                licensingOptions: this.initialConfig.licensingOptions
            }
        ];
    },
    /**
     * @return {Array}
     */
    getReusedItems() {
        const items = [
            {
                ref: 'categorySelect',
                xtype: 'view-publish-category-select',
                categories: this.initialConfig.categories
            },
            {
                ref: 'tagSelect',
                xtype: 'view-publish-tag-select',
                tags: this.initialConfig.tags,
                staticTags: this.initialConfig.staticTags
            },
            {
                ref: 'visibilitySelect',
                xtype: 'view-publish-visibility-select',
                visibility: this.initialConfig.docVisibility
            }
        ];    // if(this.getBlock().isAcquired())
              //     items.push({
              //         ref: "purchasedVisibilitySelect",
              //         xtype: "view-publish-purchased-visibility-select",
              //         visibility: this.initialConfig.docVisibility
              //     });
        // if(this.getBlock().isAcquired())
        //     items.push({
        //         ref: "purchasedVisibilitySelect",
        //         xtype: "view-publish-purchased-visibility-select",
        //         visibility: this.initialConfig.docVisibility
        //     });
        return items;
    },
    /**
     * @param {Array} items
     * @return {Array}
     */
    applyItems(items) {
        if (!items)
            return false;
        const result = [], block = this.getBlock(), isPortal = CJ.User.isPortal(), hasPremiumTools = CJ.User.hasPremiumTools(), hasExamForm = CJ.User.hasPlaylistExamMode(), isPaid = block.isPaid(), isFga = CJ.User.isFGA();
        for (let i = items.length - 1, item, ref; item = items[i]; i--) {
            item.block = block;
            item = Ext.factory(item);
            item.addCls('d-carousel-item');
            ref = item.initialConfig.ref;
            if (ref == 'categorySelect' && !isPortal) {
                item.setHidden(true);
                result.push(item);
            } else if (ref == 'examForm' && !hasExamForm) {
                item.setHidden(true);
                result.push(item);
            } else if (ref == 'visibilitySelect' && isPaid) {
                item.setHidden(true);
                result.push(item);
            } else if (ref == 'fgaOptions' && !isFga) {
                item.setHidden(true);
                result.push(item);
            } else {
                result.unshift(item);
            }    // setting caroussel for each item
            // setting caroussel for each item
            item.setCarousel(this);
        }
        return result;
    },
    /**
     * @param {Array} newItems
     * @param {Array} oldItems
     */
    updateItems(newItems, oldItems) {
        if (oldItems) {
            for (var i = 0, item; item = oldItems[i]; i++) {
                item.destroy();
            }
        }
        if (newItems) {
            for (var i = 0, item; item = newItems[i]; i++) {
                item.renderTo(this.innerElement.dom);
            }
            this.renderNavigation();
        }
    },
    /**
     * renders navigation circles.
     * @return {undefined}
     */
    renderNavigation() {
        const count = this.getItemsCount(), html = Ext.String.repeat('<span></span>', count), el = this.element.dom.querySelector('.d-bottom-element .d-circle-navigation');
        el.innerHTML = html;
        if (count == 1)
            el.classList.add('d-hidden');
    },
    /**
     * @return {Object}
     */
    getValues() {
        const tagSelect = this.getItem('tagSelect'), categorySelect = this.getItem('categorySelect'), visibilitySelect = this.getItem('visibilitySelect'), purchasedVisibilitySelect = this.getItem('purchasedVisibilitySelect'), playlistForm = this.getItem('playlistForm'), examForm = this.getItem('examForm'), fgaOptions = this.getItem('fgaOptions'), values = {}, type = this.getType();
        if (tagSelect)
            tagSelect.applyChanges();
        if (categorySelect)
            categorySelect.applyChanges();
        if (visibilitySelect)
            visibilitySelect.applyChanges();
        if (playlistForm)
            playlistForm.applyChanges();
        if (examForm)
            examForm.applyChanges();
        if (purchasedVisibilitySelect)
            purchasedVisibilitySelect.applyChanges();
        if (fgaOptions)
            fgaOptions.applyChanges();
        switch (type) {
        case 'course':
        case 'map':
        case 'activity':
            Ext.apply(values, {
                tags: tagSelect.getTags(),
                categories: categorySelect.getCategories(),
                docVisibility: visibilitySelect.getVisibility()
            });
            break;
        case 'playlist':
            Ext.apply(values, {
                title: playlistForm.getTitle(),
                description: playlistForm.getDescription(),
                iconCfg: playlistForm.getIconCfg(),
                tags: tagSelect.getTags(),
                categories: categorySelect.getCategories(),
                docVisibility: visibilitySelect.getVisibility(),
                badge: examForm.getBadge(),
                passingGrade: examForm.getPassingGrade(),
                licensingOptions: visibilitySelect.getLicensingOptions()
            });
            break;
        case 'reused': {
                const select = purchasedVisibilitySelect || visibilitySelect;
                Ext.apply(values, {
                    tags: tagSelect.getTags(),
                    categories: categorySelect.getCategories(),
                    docVisibility: select.getVisibility()
                });
            }
        }
        if ([
                'course',
                'playlist',
                'map'
            ].indexOf(type) > -1)
            values.licensingOptions = visibilitySelect.getLicensingOptions();
        if (type == 'course')
            values.totalHours = fgaOptions.getTotalHours();
        return values;
    },
    /**
     * @param {String} ref
     * @return {Ext.Component}
     */
    getItem(ref) {
        const items = this.getItems();
        for (let i = 0, item; item = items[i]; i++)
            if (item.initialConfig.ref == ref)
                return item;
    },
    /**
     * @return {Number}
     */
    getItemsCount() {
        let count = this.getItems().length;
        const block = this.getBlock();
        const isPaid = block.isBlock && block.isPaid();
        if (this.getType() == 'playlist') {
            if (!CJ.User.hasPlaylistExamMode())
                count--;
        }    // non-portal users have category-select hidden.
        // non-portal users have category-select hidden.
        if (!CJ.User.isPortal())
            count--;    // don't show visibility-select for paid blocks.
        // don't show visibility-select for paid blocks.
        if (isPaid)
            count--;
        return count;
    },
    /**
     * @param {Boolean} state
     * @return {undefined}
     */
    allowSubmit(state) {
        this.element.dom.querySelector('.d-bottom-element .d-button').disabled = !state;
    },
    /**
     * This will set the focus on any item in items that has a focus or something was changed (like an input)
     * @param {Ext.Component} item
     * @return {undefined}
     */
    setFocusOn(item) {
        const index = this.getItems().indexOf(item);
        if (index != -1 && index != this.getActiveIndex())
            this.setActiveIndex(index);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setItems(null);
        Ext.Viewport.un('orientationchange', this.configureForSmallScreen, this);
    }
});