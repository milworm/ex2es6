/**
 * Class provides the categories list component.
 */
Ext.define('CJ.view.category.List', {
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.CategoryList',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-category-list',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Ext.Evented} e
         * @return {undefined}
         */
        onBlockTap(e) {
            const href = e.getTarget('.d-category-block').getAttribute('href');
            if (href[0] == '#')
                return CJ.app.redirectTo(href);
            window.open(CJ.Utils.toUrl(href), '_blank');
        }
    },
    /**
     * @property {Ext.Template} itemTpl
     */
    itemTpl: Ext.create('Ext.XTemplate', '<tpl if="banner" >', '<a class="d-category-info-banner-block" target="_blank" href="{banner.banner_url}">', '<div class="d-body d-hbox d-flex-row d-flex-wrap">', '<div class="info-inner-container info-logo" style="background-image: url({banner.banner_image})"></div>', '<div class="info-inner-container info-content">', '<h1 class="inside-content info-title">{banner.banner_header}</h1>', '<h2 class="inside-content info-hint" >{banner.banner_title}</h2>', '<div class="info-separator"></div>', '<span class="inside-content info-description" >{banner.banner_description}</span>', '</div>', '</div>', '</a>', '</tpl>', '<tpl for="items">', '<a class="d-category-block" href="{[ values.url ? values.url : \'#!e/$\' + values.hashId ]}" onclick="return false;">', '<div class="d-body">', '<div class="blur" style="background-image: url({iconBlur})">', '</div>', '<div class="icon" style="background-image: url({icon})"></div>', '<div class="title">', '<span>{name}</span>', '</div>', '</div>', '<div class="d-footer">', '<div class="activities">', '<span class="count">{documents}</span>', '<span class="label">{documentsLabel}</span>', '</div>', '<div class="subscribers">', '<span class="count">{followers}</span>', '<span class="label">{followersLabel}</span>', '</div>', '</div>', '</a>', '</tpl>', { compiled: true }),
    initElement() {
        this.htmlElement = document.createElement('div');
        this.htmlElement.className = 'd-list d-category-list d-scroll';
        this.innerHtmlElement = document.createElement('div');
        this.innerHtmlElement.className = 'x-inner d-category-list-inner';
        this.htmlElement.appendChild(this.innerHtmlElement);
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.initialConfig = config;
        this.initElement();
        this.renderItems();
        CJ.on('language.change', this.onLanguageChange, this);
        CJ.on('beforetagslistopen', this.onBeforeTagslistOpen, this);
    },
    onBeforeTagslistOpen() {
        return false;
    },
    /**
     * reloads the list in case when user is viewing category page.
     */
    onLanguageChange() {
        this.renderItems();
    },
    /**
     * updated #add method that a little bit faster than sencha's implemetation,
     * because of making one DOM insert operation.
     * @return {undefined}
     */
    renderItems() {
        const items = CJ.User.getCategories().slice();
        const banner = Core.session.location.banner;
        const data = [];
        let documentsCount;
        let followersCount;
        Ext.Array.sort(items, (a, b) => a.position - b.position);
        for (let i = 0, item; item = items[i]; i++) {
            documentsCount = CJ.Utils.getShortCount(item.documents);
            followersCount = CJ.Utils.getShortCount(item.followers);
            data.push(Ext.applyIf({
                followersLabel: CJ.t(CJ.Utils.pluralizeQuantity('view-category-subscriber', followersCount)),
                documentsLabel: CJ.t(CJ.Utils.pluralizeQuantity('view-category-activity', documentsCount)),
                documents: documentsCount,
                followers: followersCount
            }, item));
        }
        this.innerHtmlElement.innerHTML = this.itemTpl.apply({
            items: data,
            banner
        });
    },
    /**
     * @param {HTMLElement} element
     */
    renderTo(element undefined this.initialConfig.renderTo) {
        if (!element)
            return;
        element.appendChild(this.htmlElement);
    },
    /**
     * @param {Boolean} rendered
     */
    setRendered(rendered) {
        this.rendered = rendered;
    },
    /**
     * @TODO it's for compatibility.
     * @param {Ext.Component} parent
     */
    setParent(parent) {
        this.parent = parent;
    },
    /**
     * Remove display: none
     * @return undefined
     */
    show() {
        this.htmlElement.style.removeProperty('display');
    },
    /**
     * Set element to display: none
     * @return undefined
     */
    hide() {
        this.htmlElement.style.display = 'none';
    },
    /**
     * @return {CJ.view.category.List}
     */
    destroy() {
        CJ.un('language.change', this.onLanguageChange, this);
        CJ.un('beforetagslistopen', this.onBeforeTagslistOpen, this);
        const parentNode = this.htmlElement.parentNode;
        if (parentNode)
            parentNode.removeChild(this.htmlElement);
        delete this.htmlElement;
        delete this.innerHtmlElement;
        return this;
    }
});