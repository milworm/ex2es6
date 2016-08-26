import 'Ext/viewport/Default';
import 'app/view/viewport/TopBar';
import 'app/view/viewport/CreationToolbar';
import 'app/view/viewport/LanguageSelect';
import 'app/view/viewport/LanguageSwitcher';

Ext.define('CJ.view.viewport.Viewport', {
    extend: 'Ext.viewport.Default',
    /**
     * @property {Boolean} isFullScreen
     */
    isFullScreen: false,
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Boolean} useBodyElement
         */
        // useBodyElement: null,
        /**
         * @cfg {Boolean} autoRender
         */
        autoRender: false,
        /**
         * @cfg {Object} layout
         * @TODO should be changed to light and fixed all related bugs.
         */
        layout: false,
        /**
         * we use css for this.
         * @cfg {Number} width
         */
        width: null,
        /**
         * we use css for this.
         * @cfg {Number} height
         */
        height: null,
        /**
         * @cfg {Array} tapHandlers
         */
        tapHandlers: [],
        /**
         * @cfg {String} pageTitle Window's title.
         */
        pageTitle: null
    },
    /**
     * @property {Array} eventCoords Defines the coordinates of user's last tap.
     */
    lastTouchCoords: [],
    constructor(config) {
        const bind = Ext.Function.bind;
        this.doPreventPanning = bind(this.doPreventPanning, this);
        this.doPreventZooming = bind(this.doPreventZooming, this);
        this.onElementFocus = bind(this.onElementFocus, this);
        this.onElementBlur = bind(this.onElementBlur, this);
        this.doBlurInput = bind(this.doBlurInput, this);
        this.maximizeOnEvents = [
            'ready',
            'orientationchange'
        ];    // set default devicePixelRatio if it is not explicitly defined
        // set default devicePixelRatio if it is not explicitly defined
        window.devicePixelRatio = window.devicePixelRatio || 1;
        Ext.Container.prototype.constructor.apply(this, [config]);
        this.orientation = this.determineOrientation();
        this.windowWidth = this.getWindowWidth();
        this.windowHeight = this.getWindowHeight();
        this.windowOuterHeight = this.getWindowOuterHeight();
        if (!this.stretchHeights) {
            this.stretchHeights = {};
        }    // Android is handled separately
        // Android is handled separately
        if (Ext.os.is.Android) {
            this.addWindowListener('resize', bind(this.onResize, this));
        } else {
            if (this.supportsOrientation()) {
                this.addWindowListener('orientationchange', bind(this.onOrientationChange, this));
            } else {
                this.addWindowListener('resize', bind(this.onResize, this));
            }
        }
        document.addEventListener('blur', this.onElementBlur, true);
        if (!Ext.os.is.Desktop)
            document.addEventListener('focus', this.onElementFocus, true);
        Ext.onDocumentReady(this.onDomReady, this);
        this.on('ready', this.onReady, this, { single: true });    // this.getEventDispatcher().addListener('component', '*', 'fullscreen', 'onItemFullscreenChange', this);
        // this.getEventDispatcher().addListener('component', '*', 'fullscreen', 'onItemFullscreenChange', this);
        this.on({
            'draggable.dragstart': this.onDraggableDragStart,
            'draggable.dragend': this.onDraggableDragEnd,
            scope: this
        });
        CJ.User.on('session.reinit', this.detectPublicVersion, this);
        this.originalPageTitle = document.title;
    },
    /**
     * @param {String} title
     */
    updatePageTitle(title) {
        let newTitle = this.originalPageTitle;
        if (title)
            newTitle = `${ title } - ${ newTitle }`;
        document.title = newTitle;
    },
    /**
     * Correct IE detection goes here.
     */
    render() {
        this.callParent(args);    // ST detects IE11 on Win10 as Google Chrome.
                                  // MSInputMethodContext - will be a function only on IE11
        // ST detects IE11 on Win10 as Google Chrome.
        // MSInputMethodContext - will be a function only on IE11
        if (!!window.MSInputMethodContext) {
            document.body.classList.remove('x-webkit');
            document.body.classList.remove('x-chrome');
            document.body.classList.add('x-ie');
        }
        this.element.on('tap', this.onElementTap, this);
    },
    /**
     * @return {undefined}
     */
    initContainer() {
        this.container = this.add({ xtype: 'view-nav-content-container' });
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        this.saveLastTouchCoords(e);
        const tapHandlers = this.getTapHandlers(), args = arguments;
        for (let i = 0, handler; handler = tapHandlers[i]; i++)
            if (e.getTarget(handler.selector))
                Ext.callback(handler.callback, handler.scope, args);
        if (e.getTarget('.d-hint-element', 10))
            return this.onHintElementTap(e);
        if (e.getTarget('.d-sign-in', 10))
            return this.onSignInButtonTap(e);
        else if (e.getTarget('.d-sign-up', 10))
            return this.onSignUpButtonTap();
        else if (e.getTarget('.d-no-access'))
            this.onNoAccessTap();    // category list.
        else // category list.
        if (e.getTarget('.d-category-block', 10))
            return CJ.CategoryList.onBlockTap(e);    // block's content
        // block's content
        const selector = [
            '.d-tool.d-audio[id]',
            '.d-tool.d-link[id]',
            '.d-answer',
            '.d-single-column-bottom-bar',
            '.d-block'
        ].join(', ');
        const node = e.getTarget(selector, 20);
        if (node)
            return Ext.getCmp(node.id).onElementTap(e);    // popup's close button.
        // popup's close button.
        const popupCloseButton = e.getTarget('.d-popup-close-button', 10), popup = CJ.PopupManager.getActive();
        if (popupCloseButton && popup)
            popup.onCloseButtonTap(e);
    },
    /**
     * @return {undefined}
     */
    onHintElementTap(e) {
        const question = e.getTarget('.d-question');
        Ext.getCmp(question.id).onHintElementTap();
    },
    /**
     * @return {undefined}
     */
    onSignInButtonTap(e) {
        CJ.view.login.Login.popup();
    },
    /**
     * @return {undefined}
     */
    onSignUpButtonTap(e) {
        CJ.view.login.Register.popup();
    },
    /**
     * Handler of event 'tap' of 'no access' overlap.
     * Show the login window.
     */
    onNoAccessTap() {
        CJ.view.login.Login.popup();
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onAnswerTap(e) {
        Ext.getCmp(e.getTarget('.d-answer').id).onElementTap(e);
    },
    /**
     * @see http://stackoverflow.com/questions/15596111/sencha-touch-2-1-form-panel-keyboard-hides-active-textfield-on-android
     * fixed problem: android's keyboard covers text-field
     */
    onInputTap(node) {
        if (!Ext.os.is.Android)
            return;
        const oldHeight = window.innerHeight, pageBox = node.getBoundingClientRect();
        this.content.on('resize', this.onContentResize, this, {
            single: true,
            args: [
                node,
                oldHeight,
                pageBox
            ]
        });
    },
    /**
     * saves event's coordinates so we can use them for example to scroll the document to correct position when browser
     * opens a keyboard.
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    saveLastTouchCoords(e) {
        this.lastTouchCoords = e.getXY();
    },
    /**
     * @param {HTMLElement} node
     * @param {Number} oldHeight
     * @param {Object} pageBox
     */
    onContentResize(node, oldHeight, pageBox) {
        const newWindowHeight = window.innerHeight, keyboardHeight = oldHeight - newWindowHeight, bottomOffset = oldHeight - pageBox.top - pageBox.height, scrollHeight = keyboardHeight - bottomOffset;    // don't need to scroll.
        // don't need to scroll.
        if (scrollHeight <= 0)
            return;
        if (CJ.PopupManager.exists())
            this.onKeyboardShowInPopup(node, oldHeight, scrollHeight);
        else
            this.onKeyboardShow(node, oldHeight, scrollHeight);
    },
    /**
     * @param {HTMLElement} node
     * @param {Number} oldHeight
     * @param {Number} scrollHeight
     */
    onKeyboardShowInPopup(node, oldHeight, scrollHeight) {
        const innerNodes = document.body.querySelectorAll('.d-popup-overlay-inner'), innerNode = innerNodes[innerNodes.length - 1];
        innerNode.style.setProperty('height', `${ oldHeight }px`, 'important');    // popup-overlay is always scrollable.
        // popup-overlay is always scrollable.
        innerNode.parentNode.scrollTop += scrollHeight;    // user closed a keyboard.
        // user closed a keyboard.
        this.content.on('resize', this.onKeyboardHide, this, {
            single: true,
            args: [innerNode]
        });
    },
    /**
     * @param {HTMLElement} node
     * @param {Number} oldHeight
     * @param {Number} scrollHeight
     */
    onKeyboardShow(node, oldHeight, scrollHeight) {
        const scrollableNode = node.findParentNode('.d-scroll');    // @TODO need to add a check:
                                                                    // scrollableNode = scrollableNode || someElementWithOverlowAuto.
        // @TODO need to add a check:
        // scrollableNode = scrollableNode || someElementWithOverlowAuto.
        node.style.setProperty('height', `${ oldHeight }px`, 'important');
        scrollableNode.scrollTop += scrollHeight;    // user closed a keyboard.
        // user closed a keyboard.
        this.content.on('resize', this.onKeyboardHide, this, {
            single: true,
            args: [node]
        });
    },
    /**
     * @param {HTMLElement} node
     */
    onKeyboardHide(node) {
        node.style.removeProperty('height');
    },
    /**
     * simply adds mask to the content
     * @return {undefined}
     */
    setContentMask(state) {
        const content = this.content;
        if (state)
            content.setMasked({ xtype: 'loadmask' });
        else
            content.setMasked(false);
    },
    /**
     * simply replaces inner content with new items
     * @param {Object|Array} config
     * @return {Object|Array}
     */
    replaceContentWith(config) {
        const content = this.content;
        if (content.innerItem) {
            const item = content.innerItem;    // we're going to remove stream, so we also need to cleanup references.
            // we're going to remove stream, so we also need to cleanup references.
            if (item.isStream)
                CJ.Stream = null;
            if (item.isBlockList)
                CJ.BlockList = null;
            if (item.isComponent)
                item.element.detach();
            else if (item.htmlElement.parentNode)
                item.htmlElement.parentNode.removeChild(item.htmlElement);
            else
                item.htmlElement.dom.parentNode.removeChild(item.htmlElement.dom);
            Ext.TaskQueue.requestWrite(() => {
                item.destroy();
            });
        }
        config = Ext.factory(config);
        config.renderTo(content.innerElement.dom);
        config.setRendered(true);
        config.setParent(this);
        content.innerItem = config;
        return content;
    },
    /**
     * creates items and initializes the shortcuts
     */
    createAndInitItems() {
        if (this.itemsInitialized)
            return;
        this.itemsInitialized = true;
        const container = this.container;
        this.content = this.down('[isContent]');
        this.sidemenu = this.add({ xtype: 'view-nav-sidemenu' });
        this.buttons = Ext.factory({
            xtype: 'view-viewport-creation-toolbar',
            renderTo: Ext.Viewport.bodyElement,
            hidden: true
        });
        this.toolbar = Ext.factory({
            xtype: 'view-viewport-top-bar',
            renderTo: container.innerElement
        });
        fastdom.write(function () {
            Ext.fly('splash-screen').destroy();
            this.render();
        }, this);
        this.detectPublicVersion();
    },
    /**
     * Destroys items that shouldn't be displayed for the guest (unlogged user).
     */
    destroyUserItems() {
        this.sidemenu && this.sidemenu.destroy();
        if (this.toolbar) {
            this.toolbar.closeTagsList();
            this.toolbar.destroy();
        }
        delete this.sidemenu;
        delete this.toolbar;
    },
    /**
     * method is called to update viewport's component when user logs in/out.
     * @return {undefined}
     */
    onSessionReinit() {
        const searchBar = this.getSearchBar();
        if (searchBar)
            searchBar.refreshHidden();
        this.reinitSideMenu();
    },
    reinitSideMenu() {
        this.sidemenu.destroy();
        this.sidemenu = this.add({
            xtype: 'view-nav-sidemenu',
            searchBar: this.toolbar
        });
    },
    /**
     * Hide keyboard on ios/android
     */
    hideKbd() {
        const activeElement = document.activeElement || {};
        if ((Ext.os.is.iOS || Ext.os.is.Android) && Ext.isFunction(activeElement.blur))
            activeElement.blur();
    },
    /**
     * Apply fixes
     */
    applyFixes() {
        document.documentElement.setAttribute('data-agent', navigator.userAgent);
        document.documentElement.setAttribute('data-scroll', CJ.Utils.isNativeScrolling ? 'native' : 'custom');
        this.applyIos7OrientationFix();
        this.applyFullscreenFix();
        this.setAutoBlurInput(false);
        this.applyDragDropFix();
        this.applyBackspaceFix();
        this.applyIE11DetectionFix();
        this.applyOrienatationChangeFix();
        this.applyTouchDetectionFix();    //this.applyChromeProblemFix();
                                          //this.applyAndroidGapFix();
    },
    /**
     * fixes a problem, to be allowed to use native scrollbar
     * and be able to use dnd features
     * basically it overrides doPreventPanning method in order to prevent
     * touchmove events only when it's needed
     */
    applyDragDropFix() {
        this.addWindowListener('touchmove', e => {
            if (CJ.isDragging)
                e.preventDefault();
        }, false);
    },
    /**
     * method is going to fix ios7-problem in ipad-devices connected with changing
     * orientation from portrait to landscape, in case when bug exists, ios7 changes
     * the height of body to be smaller by 1px comparing to window.innerHeight
     * @return {undefined}
     */
    applyIos7OrientationFix() {
        if (!(Ext.os.is.iPad && Ext.os.version.major == 7 && Ext.browser.is.Safari))
            return;
        let applied = false;
        const interval = 250;
        Ext.Viewport.on('orientationchange', function (viewport, orientation) {
            const body = Ext.getBody();
            if (orientation == 'portrait') {
                body.setStyle({ marginTop: '0px' });
                return clearInterval(this.ios7OrientationInterval);
            }
            this.ios7OrientationInterval = setInterval(() => {
                if (window.innerHeight != body.getHeight(true)) {
                    if (applied)
                        return;
                    body.setStyle({ marginTop: '-22px' });
                    applied = true;
                } else {
                    if (!applied)
                        return;
                    body.setStyle({ marginTop: '0px' });
                    applied = false;
                }
            }, interval);
        }, this);
    },
    /**
     * Chrome font problem temporary fix
     * https://code.google.com/p/chromium/issues/detail?id=236298
     * https://code.google.com/p/chromium/issues/detail?id=336170
     */
    applyChromeProblemFix() {
        const is = Ext.os.is;
        if ((is.Windows || is.Linux || is.MacOS) && Ext.browser.is.Chrome) {
            window.setInterval(() => {
                document.body.style.cursor = 'default';
                document.body.style.cursor = 'auto';
            }, 500);
        }
    },
    /**
     * Is used to fix the html5 video issue #6137
     * @return {undefined}
     */
    applyFullscreenFix() {
        const fn = evt => {
            const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;
            const flag = !!fullscreenElement;
            this.element.swapCls('fullscreen', null, flag, 'd');
            this.fireEvent('html5fullscreenchange', flag, evt);
            this.isFullScreen = flag;
        };
        document.addEventListener('webkitfullscreenchange', fn);
        document.addEventListener('mozfullscreenchange', fn);
        document.addEventListener('fullscreenchange', fn);
    },
    /**
     * prevents browser going back on backspace
     */
    applyBackspaceFix() {
        document.addEventListener('keydown', e => {
            // check for backspace
            if (e.keyCode != 8)
                return;
            const focusedElement = document.activeElement || document.body;
            if (/input|textarea/i.test(focusedElement.tagName) || focusedElement.isContentEditable)
                return;
            return e.preventDefault();
        });
    },
    /**
     * Adds browser detections cls for the IE11
     */
    applyIE11DetectionFix() {
        if (Ext.browser.is.IE)
            Ext.getBody().addCls('x-ie');
    },
    /**
     * Adds x-touch for non-desktop devices. This allows us to write simular styles for phone and tablet without
     * duplicating a lot of code.
     */
    applyTouchDetectionFix() {
        if (!Ext.os.is.Desktop)
            Ext.getBody().addCls('x-touch');
    },
    applyOrienatationChangeFix() {
        this.on('orientationchange', function (viewport, orientation) {
            if (orientation == 'landscape')
                this.scrollToTop();
        }, this);
    },
    showLoadMask(config) {
        if (config === true)
            config = {};
        if (Ext.isString(config)) {
            config = { message: config };
        }
        this.container.setMasked(Ext.applyIf(config || {}, { xtype: 'loadmask' }));
        if (!this.masks)
            this.masks = 0;
        this.masks++;
    },
    hideLoadMask() {
        this.masks--;
        if (this.masks)
            return;
        this.container.setMasked(false);
    },
    /**
     * @return {Ext.Component} global search bar
     */
    getSearchBar() {
        if (!this.toolbar)
            return false;
        return this.toolbar.getSearchField();
    },
    getBlockList() {
        return CJ.BlockList;
    },
    isMeshFeed() {
        if (!Ext.Viewport.getSearchBar())
            return false;
        return !!this.getSearchBar().hasTags();
    },
    /**
     * https://redmine.iqria.com/issues/7184
     * @return {undefined}
     */
    applyAndroidGapFix() {
        if (!Ext.os.is.Android)
            return;
        const body = Ext.getBody();
        let timeout;
        body.setMinHeight(this.getWindowHeight());
        this.on('orientationchange', function (viewport, orientation) {
            // because of bug in android: innerHeight isn't calculated correctly
            // right after orientationchange, so need to wait a bit.
            clearTimeout(timeout);
            timeout = Ext.defer(function () {
                body.setMinHeight(this.getWindowHeight());
            }, 100, this);
        }, this);
    },
    onDraggableDragStart() {
        CJ.isDragging = true;
        Ext.TaskQueue.requestWrite(() => {
            document.body.classList.add('dragging');
        });
    },
    onDraggableDragEnd() {
        CJ.isDragging = false;
        Ext.TaskQueue.requestWrite(() => {
            document.body.classList.remove('dragging');
            window.getSelection().removeAllRanges();
        });
    },
    /**
     * @return {Array}
     */
    getPageTags() {
        let tags;
        try {
            tags = this.getSearchBar().getTags().split(' ');
        } catch (e) {
        }
        return tags || [];
    },
    /**
     * In case when user is on the group-page, method returns hashId of that group in array-format. We use this method
     * mostly when we want to create a block.
     * @return {Array}
     */
    getPageGroup() {
        const group = CJ.StreamHelper.getGroup();
        if (!group)
            return [];
        return [group.hashId];
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementFocus(e) {
        this.focusedElement = e.target;    // Do not move viewport's scroll for:
                                           // 1. editor, because editor has a toolbar
                                           // 2. nav-toolbar, as it's always appears at the top (@TODO should be removed after we refactor top-bar,
                                           // as now it cases an issue on iOS because of tag-list's absolute-position and scrollIntoView)
        // Do not move viewport's scroll for:
        // 1. editor, because editor has a toolbar
        // 2. nav-toolbar, as it's always appears at the top (@TODO should be removed after we refactor top-bar,
        // as now it cases an issue on iOS because of tag-list's absolute-position and scrollIntoView)
        if (Ext.fly(this.focusedElement).findParentNode('.d-tool-text', 15))
            return;    // wait for keyboard.
        // wait for keyboard.
        Ext.defer(function () {
            if (!this.focusedElement)
                return;
            CJ.Utils.scrollIntoViewIfNeeded(this.focusedElement);
        }, 500, this);
    },
    detectPublicVersion() {
        Ext.getBody()[CJ.User.isLogged() ? 'removeCls' : 'addCls']('d-public-version');
    },
    /**
     * adds new tap handler to #tapHandlers, so we have one place to catch all tap-events.
     * @param {Object} config
     * @param {Function} config.callback
     * @param {Object} config.scope
     * @return {undefined}
     */
    registerTapHandler(config) {
        this.getTapHandlers().push(config);
    }
});