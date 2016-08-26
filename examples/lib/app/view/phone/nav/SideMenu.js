import 'app/view/nav/SideMenu';

Ext.define('CJ.view.phone.nav.SideMenu', {
    extend: 'CJ.view.nav.SideMenu',
    xtype: 'view-phone-nav-sidemenu',
    config: {
        tpl: Ext.create('Ext.XTemplate', [
            '<tpl if="isPublic">',
            '<div class="public">',
            '<div class=\'d-action-container\'>',
            '<div class=\'d-close\'></div>',
            '<div class=\'d-buttons\'>',
            '<div class=\'d-button d-sign-in\'>',
            '{[ CJ.app.t(\'sign-in\')]}',
            '</div>',
            '<div class=\'d-button d-sign-up\'>',
            '{[ CJ.app.t(\'sign-up\')]}',
            '</div>',
            '</div>',
            '</div>',
            '<a class=\'d-button d-business\' href=\'http://info.challengeu.com/business\' data-external=\'true\' onclick=\'return false;\'>',
            '{[ CJ.app.t(\'nav-slidemenu-public-section-business\')]}',
            '</a>',
            '<a class=\'d-button d-schools\' href=\'http://info.challengeu.com/education\' data-external=\'true\' onclick=\'return false;\'>',
            '{[ CJ.app.t(\'nav-slidemenu-public-section-schools\') ]}',
            '</a>',
            '<a class=\'d-button d-explore\' href=\'#!explore\' onclick=\'return false;\'>',
            '{[ CJ.app.t(\'nav-slidemenu-public-section-explore\') ]}',
            '</a>',
            '</div>',
            '<tpl else>',
            '<div class="d-menu-header">',
            '<a class="d-button d-user" href="{userUrl}" onclick="return false;">',
            '<span class="d-menu-item-icon" style="background-image: url({userIcon})"></span>',
            '<span class="d-text">{userName}</span>',
            '</a>',
            '<div class="d-button d-close"></div>',
            '</div>',
            '<div class="d-menu-body">',
            '<ul>',
            '<li class="d-main">',
            '<ul>',
            '<li class="help">{[CJ.t("nav-slidemenu-help")]}</li>',
            '<li class="about">{[CJ.t("nav-slidemenu-about")]}</li>',
            '</ul>',
            '<div class="d-more">{[CJ.t("view-phone-nav-sidemenu-main-more")]}</div>',
            '</li>',
            '<li class="notifications"></li>',
            '<tpl if="isPortal">',
            '<li class="portal">',
            '<a class="d-button" href="#!pu/{portal.tag}/f" onclick="return false;">',
            '<span class="d-menu-item-icon" style="background-image: url({portal.icon})"></span>',
            '<span class="d-text">{portal.name}</span>',
            '</a>',
            '</li>',
            '</tpl>',
            '<tpl if="!isFgaStudent">',
            '<li class="explore">',
            '<a class="d-button" href="#!explore" onclick="return false;">',
            '{[CJ.t("view-nav-sidemenu-container-explore")]}',
            '</a>',
            '</li>',
            '<li class="purchased">',
            '<a class="d-button" href="#!purchased" onclick="return false;">',
            '{[ CJ.t("nav-slidemenu-public-section-purchased") ]}',
            '</a>',
            '</li>',
            '</tpl>',
            '<li class="courses expanded">',
            '<div class="d-button d-no-hide">',
            '{[CJ.t("nav-slidemenu-courses")]}',
            '</div>',
            '<ul></ul>',
            '<div class="d-more">{[CJ.t("view-phone-nav-sidemenu-courses-more")]}</div>',
            '</li>',
            '<tpl if="!isFgaStudent">',
            '<li class="feed expanded">',
            '<a class="d-button" href="#!feed" onclick="return false;">',
            '{[CJ.t("nav-slidemenu-feed")]}',
            '</a>',
            '<ul></ul>',
            '<div class="d-more">{[CJ.t("view-phone-nav-sidemenu-feed-more")]}</div>',
            '</li>',
            '<li class="groups expanded">',
            '<div class="d-button d-no-hide">',
            '{[CJ.t("nav-slidemenu-my-groups")]}',
            '</div>',
            '<ul></ul>',
            '<div class="d-more">{[CJ.t("view-phone-nav-sidemenu-my-groups-more")]}</div>',
            '<div class="add-group">{[CJ.t("nav-sidemenu-addgroupbutton-popuptitle")]}</div>',
            '</li>',
            '</tpl>',
            '</ul>',
            '</div>',
            '<div class="d-menu-footer">',
            '<div class="d-button d-settings">{[CJ.t("view-phone-nav-sidemenu-settings")]}</div>',
            '<div class="d-button d-logout">{[CJ.t("view-phone-nav-sidemenu-logout")]}</div>',
            '</div>',
            '</tpl>',
            { compiled: true }
        ]),
        tapListeners: {
            '.d-more': 'onMoreTap',
            '.d-menu-footer .d-settings': 'onSettingsTap',
            '.d-menu-footer .d-logout': 'onLogoutTap',
            '.d-menu-header .d-user': 'onUserButtonTap',
            '.d-menu-header .d-close': 'onCloseButtonTap',
            '.d-menu-body .d-main .help': 'onHelpTap',
            '.d-menu-body .d-main .about': 'onAboutTap',
            '.public .d-action-container .d-close': 'hideMenu',
            '.portal': 'onPortalButtonTap',
            '.public': 'onPublicTap',
            '.d-button:not(.d-no-hide)': 'hideMenu'
        }
    },
    initialize() {
        this.callParent(args);
        CJ.on('sidemenu.hide', this.onMenuHide, this);
        CJ.un('tags.change', this.onSearchChange, this);
        if (!CJ.User.isLogged())
            return;
        CJ.un('contentblock.created', this.onBlockChange, this);
        CJ.un('contentblock.deleted', this.onBlockChange, this);
        CJ.un('contentblock.updated', this.onBlockChange, this);
        this.onCoursesExpand();
        if (CJ.User.isFgaStudent())
            return;
        this.onFeedExpand();
        this.onGroupsExpand();
    },
    getElementConfig() {
        return {
            reference: 'element',
            tag: 'div'
        };
    },
    destroy() {
        this.callParent(args);
        CJ.un('sidemenu.hide', this.onMenuHide, this);
    },
    expand: Ext.emptyFn,
    collapse: Ext.emptyFn,
    updateListRequest: Ext.emptyFn,
    configureFeedItems() {
        const items = this.callParent(args);
        Ext.each(items, item => {
            Ext.apply(item, {
                title: item.hint || item.title,
                hint: null
            });
        });
        return items;
    },
    renderList(items, target) {
        this.callParent(args);
        const el = this.element.dom.querySelector(CJ.tpl('li.{0}', target)), classList = el.classList;
        classList.remove('empty');
        classList[items.length > 1 ? 'remove' : 'add']('single');
    },
    renderEmptyLabel(target) {
        this.callParent(args);
        this.element.dom.querySelector(CJ.tpl('li.{0}', target)).classList.add('empty');
    },
    configureLengthCls(target) {
        const el = this.element.dom.querySelector(CJ.tpl('li.{0}', target)), items = el.querySelectorAll('li:not(.d-empty-label)'), length = items.length, classList = el.classList;
        if (length > 1) {
            classList.remove('empty', 'single');
        } else if (length == 1) {
            classList.add('single');
            classList.remove('empty');
        } else {
            classList.add('empty');
            classList.remove('single');
        }
    },
    toggleExpandedList(skip) {
        const expanded = this.element.dom.querySelector('ul.expanded');
        if (expanded && expanded.parentNode != skip)
            this.toggleList(expanded.parentNode);
    },
    toggleList(target) {
        if (Ext.isString(target))
            target = this.element.dom.querySelector(CJ.tpl('li.{0}', target));
        const list = target.querySelector('ul'), button = target.querySelector('.d-more'), items = target.querySelectorAll('li'), itemHeight = items[0].offsetHeight;
        if (list.classList.contains('expanded')) {
            list.style.height = `${ itemHeight }px`;
            list.classList.remove('expanded');
            button.innerHTML = 'More';
        } else {
            list.style.height = `${ itemHeight * items.length }px`;
            list.classList.add('expanded');
            button.innerHTML = 'Less';
        }
    },
    hideMenu() {
        CJ.fire('dohidesidemenu');
    },
    onMenuHide() {
        this.toggleExpandedList();
    },
    onAddGroupTap() {
        this.callParent(args);
        this.hideMenu();
    },
    onListItemTap() {
        this.callParent(args);
        this.hideMenu();
    },
    onMoreTap(e) {
        const el = e.target.parentNode;
        this.toggleExpandedList(el);
        this.toggleList(el);
    },
    onUserUpdate(data) {
        this.element.dom.querySelector('.d-menu-header .d-button.d-user .d-menu-item-icon').style.backgroundImage = CJ.tpl('url({0})', data.icon);
    },
    onFollowingChange() {
        this.callParent(args);
        this.configureLengthCls('feed');
    },
    onGroupCreate() {
        this.callParent(args);
        this.configureLengthCls('groups');
    },
    onGroupDestroy() {
        this.callParent(args);
        this.configureLengthCls('groups');
    },
    onCourseEnroll() {
        this.callParent(args);
        this.configureLengthCls('courses');
    },
    onCourseLeave() {
        this.callParent(args);
        this.configureLengthCls('courses');
    }
});