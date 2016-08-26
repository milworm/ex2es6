import 'app/view/block/ContentBlock';
import 'app/view/block/options/User';

Ext.define('CJ.view.block.User', {
    extend: 'CJ.view.block.ContentBlock',
    xtype: 'view-block-user',
    isUserBlock: true,
    config: {
        cls: 'd-user',
        image: null,
        icon: null,
        companyIcon: null,
        user: null,
        name: null,
        role: null,
        company: null,
        headerTpl: Ext.create('Ext.XTemplate', [
            '<div class="d-menubutton"></div>',
            '<div class="d-icon">',
            '<span class="d-user" style="background-image: url({userIcon});"></span>',
            '<tpl if="companyIcon">',
            '<span class="d-company" style="background-image: url({brandIcon});"></span>',
            '</tpl>',
            '</div>',
            '<div class="d-name">{name}</div>',
            '<div class="d-info">',
            '<tpl if="role">',
            '<span class="d-role">{role}</span>',
            '</tpl>',
            '<tpl if="company">',
            '<span class="d-company">{company}</span>',
            '</tpl>',
            '</div>',
            { compiled: true }
        ]),
        /**
         * @cfg {Ext.Template} footerTpl
         */
        footerTpl: Ext.create('Ext.Template', '<div class="d-bottom-bar d-light-bottom-bar d-multicolumn-bottom-bar">', '<div class="d-html">', '<a class="d-button" href="#!u/{user}/a" onclick="return false">', '<div class="d-count">{activities}</div>', '<div class="d-label">{activitiesText}</div>', '</a>', '<a class="d-button" href="#!u/{user}/a" onclick="return false">', '<div class="d-count">{subscribed}</div>', '<div class="d-label">{subscribedText}</div>', '</a>', '<a class="d-button" href="#!u/{user}/a" onclick="return false">', '<div class="d-count">{subscribers}</div>', '<div class="d-label">{subscribersText}</div>', '</a>', '</div>', '</div>', { compiled: true })
    },
    tapListeners: {
        '.d-menubutton': 'onMenuButtonTap',
        '.d-bottom-bar .d-button': 'onBottomBarButtonTap',
        '.d-header': 'onTap'
    },
    getElementConfig() {
        return {
            reference: 'element',
            children: [
                { className: 'd-image' },
                { className: 'd-header' },
                { className: 'd-footer' }
            ]
        };
    },
    updateImage(image) {
        this.element.setStyle({ backgroundColor: CJ.tpl('hsla({0}, 35%, 50%,0.7)', CJ.Utils.randomHsl()) });
        if (image) {
            const imageEl = this.element.dom.querySelector('.d-image'), img = new Image();
            img.src = image;
            img.onload = () => {
                img.onload = null;
                imageEl.classList.add('shown');
                imageEl.style.backgroundImage = CJ.tpl('url({0})', image);
            };
        }
    },
    getHeaderTplData() {
        return {
            userIcon: this.getIcon(),
            companyIcon: this.getCompanyIcon(),
            name: this.getName(),
            role: this.getRole(),
            company: this.getCompany()
        };
    },
    /**
     * @return {Object}
     */
    getFooterTplData() {
        return {
            user: this.getUser(),
            activities: 0,
            subscribed: 0,
            subscribers: 0,
            activitiesText: CJ.t('block-user-button-activities'),
            subscribedText: CJ.t('block-user-button-subscribed'),
            subscribersText: CJ.t('block-user-button-subscribers')
        };
    },
    onMenuButtonTap() {
        Ext.factory({
            xtype: 'core-view-popup',
            title: 'block-popup-options-title',
            cls: 'd-menu-popup',
            layout: 'light',
            content: {
                xtype: 'view-block-options-user',
                block: this
            }
        });
    },
    onBottomBarButtonTap(e) {
        const button = e.getTarget('.d-button', 5), href = button.getAttribute('href');
        CJ.app.redirectTo(href.substr(1));
    },
    /**
     * @return {undefined}
     */
    onTap() {
        CJ.app.redirectTo(this.getLocalUrl());
    },
    /**
     * @inheritdoc
     */
    getLocalUrl() {
        return CJ.tpl('!u/{0}/a', this.getUser());
    }
});