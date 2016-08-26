import 'Ext/Container';
import 'app/view/comments/ReplyContainer';
import 'app/view/comments/AttachmentView';

/**
 * Defines the base class for comments lists.
 */
Ext.define('CJ.view.comments.list.Base', {
    alias: 'widget.view-comments-list-base',
    extend: 'Ext.Container',
    /**
     * @property {Boolean} isList
     */
    isList: true,
    /**
     * @cfg {Object} config
     */
    config: {
        /**
         * @cfg {Number} docId Parent comment's id.
         */
        docId: null,
        /**
         * @cfg {Number} level Comment's level.
         */
        level: 0,
        /**
         * @cfg {String} itemSelector
         */
        itemSelector: '.d-comment-item',
        /**
         * @cfg {Boolean} payAttention Should be true when you want component
         *                             to pay attention on comments/comments-tab
         *                             after rendering.
         */
        payAttention: null,
        /**
         * @cfg {Object} lastResponse
         */
        lastResponse: null,
        /**
         * @cfg {Object} lastRequest
         */
        lastRequest: null,
        /**
         * @cfg {CJ.view.block.BaseBlock} block
         */
        block: null,
        /**
         * @cfg {Object} comments
         */
        comments: {
            items: [],
            total: 0,
            subtreeTotal: 0
        },
        /**
         * @cfg {String} cls
         */
        baseCls: 'd-comments-list',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-comments-list-inner',
        /**
         * @cfg {Ext.Component} field
         */
        field: {},
        /**
         * @cfg {Boolean} empty Will be true when list is empty and made
         *                      a request to get the data.
         */
        empty: null,
        /**
         * @cfg {String|Ext.XTemplate} itemTpl
         */
        itemTpl: Ext.create('Ext.XTemplate', [
            '<div class="d-comment-item {[ values.expanded ? "expanded" : ""]}"',
            ' id="comment-item-{docId}"',
            ' data-doc-id={docId}',
            ' data-user="{user}"',
            ' data-expanded="{expanded}">',
            '<div class="d-comment-body">',
            '<div class="comment-body-top-bar">',
            '<div class="expand-area">',
            '<div class="arrow {[ values.showArrows ? "" : "x-hidden" ]}"></div>',
            '<div class="user-fullname">',
            '<tpl if="deleted">',
            '{[ CJ.app.t("view-comments-list-deleted-user") ]}',
            '<tpl else>',
            '{[ values.userFullname ]}',
            '</tpl>',
            '</div>',
            '</div>',
            '<div class="date-edited">',
            '<tpl if="!values.deleted">',
            '{[ CJ.app.t("view-comments-item-edited") ]} ',
            '{[ CJ.Utils.formatUTCDate(values.edited, "Y/m/d - g:i A") ]}',
            '</tpl>',
            '</div>',
            '</div>',
            '<div class="content">',
            '<div class="content-inner">',
            '<tpl if="values.deleted">',
            '{[ CJ.app.t("view-comments-list-deleted-content") ]}',
            '<tpl else>',
            '{[ CJ.Utils.linkify(values.content) ]}',
            '</tpl>',
            '</div>',
            '<div class="attachment-container"></div>',
            '</div>',
            '</div>',
            '<div class="d-bottom-bar">',
            '{[ values.bottomBarTpl || "" ]}',
            '</div>',
            '</div>'
        ]),
        /**
         * @cfg {Ext.XTemplate} bottomBarTpl
         */
        bottomBarTpl: Ext.create('Ext.XTemplate', '<div class="d-comments-menu" data-expanded="true">', '<tpl if="isAll">', '<tpl if="hasPinFeature">', '<div class=\'d-comments-pin d-item\' data-event=\'pin\'></div>', '</tpl>', '</tpl>', '<tpl if="isFaq">', '<tpl if="hasPinFeature">', '<div class=\'d-comments-unpin d-item\' data-event=\'unpin\'></div>', '</tpl>', '</tpl>', '<div class=\'d-comments-reply d-item\' data-event=\'reply\'></div>', '<tpl if=\'values.type == "blockOwner"\'>', '<div class=\'d-comments-user d-item\' data-event=\'user\'></div>', '<div class=\'d-comments-delete d-item\' data-event=\'delete\'></div>', '<tpl elseif=\'values.type == "commentOwner"\'>', '<div class=\'d-comments-edit d-item\' data-event=\'edit\'></div>', '<div class=\'d-comments-delete d-item\' data-event=\'delete\'></div>', '<tpl elseif=\'values.type == "reader"\'>', '<div class=\'d-comments-user d-item\' data-event=\'user\'></div>', '<div class=\'d-comments-flag d-item\' data-event=\'flag\'></div>', '<tpl elseif=\'values.type == "notLogged"\'>', '<div class=\'d-comments-user d-item\' data-event=\'user\'></div>', '<tpl elseif=\'values.type == "portalAdmin"\'>', '<div class=\'d-comments-user d-item\' data-event=\'user\'></div>', '<div class=\'d-comments-moderate d-item\' data-event=\'moderate\'>', '{[CJ.app.t(values.item.moderated ? "view-comments-item-moderate-off" : "view-comments-item-moderate-on")]}', '</div>', '</tpl>', '</div>', { compiled: true })
    },
    /**
     * @cfg {Object} mixins
     */
    mixins: { attentionable: 'CJ.view.mixins.Attentionable' },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.store = new Ext.util.MixedCollection();
        this.callParent(args);
        this.innerElement.onBefore('tap', this.onBeforeInnerElementTapHander, this);
        this.innerElement.on('tap', this.onInnerElementTapHandler, this, { delegate: '> .d-comment-item > .d-comment-body' });
        this.innerElement.on('tap', this.onMenuItemTap, this, { delegate: '> .d-comment-item > .d-bottom-bar > .d-comments-menu .d-item' });
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            classList: [
                'x-container',
                'x-unsized'
            ],
            children: [
                {
                    reference: 'innerElement',
                    cls: 'x-inner'
                },
                {
                    reference: 'fieldElement',
                    cls: 'd-field-container'
                }
            ]
        };
    },
    /**
     * @param {Boolean} state
     */
    updatePayAttention(state) {
        if (!state)
            return;    // doing using taskqueue because lists could hide/show static display
                       // items using afterrenderitems callback, so they could change scroll
        // doing using taskqueue because lists could hide/show static display
        // items using afterrenderitems callback, so they could change scroll
        Ext.TaskQueue.requestWrite(function () {
            this.payAttention();
        }, this);
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyField(config) {
        if (!config)
            return false;
        config = Ext.factory(Ext.apply(config, {
            xtype: 'view-comments-leavecommentfield',
            count: this.getBlock().getCommentsCount(),
            parent: this
        }));
        config.on({
            scope: this,
            submit: this.onFieldSubmit
        });
        return config;
    },
    /**
     * @param {Ext.Component} newField
     * @param {Ext.Component} oldField
     */
    updateField(newField, oldField) {
        if (oldField)
            oldField.destroy();
        if (newField)
            Ext.Viewport.bottom.replaceItems(newField);
    },
    /**
     * method will be called when user submits the leave-a-comment field.
     * @param {String} comment
     * @param {Object} fileInfo
     * @param {CJ.view.comments.LeaveCommentField} field
     */
    onFieldSubmit(comment, fileInfo, field) {
        field.resetAnimated();
        CJ.Comment.create(this.getBlock().getDocId(), {
            comment,
            attachment: fileInfo,
            scope: this,
            success: this.onFieldSubmitSuccess
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onFieldSubmitSuccess(response, request) {
        const data = response.ret, args = request.initialConfig.args, user = CJ.User, block = this.getBlock();
        Ext.apply(data, {
            content: args.content,
            userFullname: user.get('name'),
            user: user.get('user'),
            edited: data.date,
            deleted: false,
            comments: {
                items: [],
                total: 0,
                subtreeTotal: 0
            },
            // @TODO it will be cool if server always returns
            // the same key names. Currently on commentlist it returns docId
            // on comment creation it's just an id
            docId: data.id
        });
        this.insertComment(0, data);
        block.fireEvent('commentcreate', this.getCount(), block);
    },
    /**
     * @param {Ext.dom.Event} e
     */
    onBeforeInnerElementTapHander(e) {
        const anchor = e.getTarget('a');
        let href;
        if (!anchor)
            return;
        href = anchor.getAttribute('href');
        if (href.indexOf('mailto:') === 0)
            window.location.href = href;
        else
            window.open(href, '_blank');
        return false;
    },
    /**
     * @param {Object} comments
     */
    updateComments(comments) {
        this.setLastResponse({ ret: comments });
        this.setLastRequest(comments.request);
        this.renderItems(comments.items);
    },
    /**
     * adds some required fileds
     * @param {Array} items
     */
    prepareItemsToInsert(items) {
        return Ext.isArray(items) ? items : [items];
    },
    /**
     * @param {Object} item
     * @return {undefined}
     */
    prepareBottomBarTpl(item) {
        if (!item.deleted)
            item.bottomBarTpl = this.getBottomBarTpl().apply({
                type: this.getUserType(item),
                item
            });
    },
    /**
     * @return {Number} count of the comments (current level)
     */
    getCount() {
        const comments = this.getComments();
        if (comments)
            return comments.subtreeTotal;
        return 0;
    },
    /**
     * @param {Number} value
     */
    setCount(value) {
        const comments = this.getComments();
        if (comments)
            return comments.subtreeTotal = value;
    },
    /**
     * @inheritdoc
     */
    initItemComponents(htmlElement, item) {
        this.initAttachment(htmlElement, item);
        this.initReplyList(htmlElement, item);
    },
    /**
     * @param {HTMLElement} element
     * @param {Object} comment
     */
    initAttachment(element, comment) {
        if (comment.attachmentName)
            this.createAttachment(element, comment);
        else
            this.destroyAttachment(element, comment);
    },
    /**
     * @param {HTMLElement} element
     * @param {Object} comment
     * @return {undefined}
     */
    destroyAttachment(element, comment) {
        if (!element.attachment)
            return;
        element.attachment.destroy();
        delete element.attachment;
    },
    /**
     * @param {HTMLElement} element
     * @param {Object} comment
     * @return {undefined}
     */
    createAttachment(element, comment) {
        const fileInfo = CJ.Utils.urlToFileInfo(comment.attachmentUrl, comment.attachmentName);
        if (element.attachment)
            return element.attachment.setFileInfo(fileInfo);
        Ext.TaskQueue.requestWrite(() => {
            element.attachment = Ext.factory({
                xtype: 'view-comments-attachment-view',
                editable: false,
                fileInfo
            });
            element.attachment.renderTo(element.querySelector('.attachment-container'));
        }, this);
    },
    /**
     * this method is needed, as we cannot use useBodyElement == false
     * because ST ignores it for example while adding a mask
     */
    updateUseBodyElement: Ext.emptyFn,
    /**
     * @param {Object} comment
     * @param {Number} position
     * @return {undefined}
     */
    insertComment(position, comment) {
        let element;
        this.setEmpty(false);
        this.setCount(this.getCount() + 1);
        this.onChange();
        this.prepareItemsToInsert(comment);
        comment.expanded = false;
        element = this.renderItemTpl(comment).firstChild;
        this.store.insert(0, comment);
        this.getItemsElement().insertFirst(element);
        this.setCommentExpanded(element, true);    // if(this.getLevel())
                                                   //     this.scrollToEl(element);
    },
    /**
     * @param {Ext.Element} element
     * @return {undefined}
     */
    scrollToEl(element) {
        const blockList = this.getBlock().getParent(), region = CJ.Utils.flyPageBox(element), bottom = blockList.element.getHeight() - region.bottom;
        if (bottom >= 0)
            return;
        blockList.scrollTop(-bottom, true);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.removeAllItems();
        this.callParent(args);
        this.setField(null);
    },
    /**
     * removes all items in list
     */
    removeAllItems() {
        const items = this.getItemsElement().query(this.getItemSelector());
        let item;
        while (item = items.pop())
            this.destroyElement(item);
        this.store.clear();
    },
    /**
     * @param {Object} comment
     */
    removeCommentLocally(comment) {
        if (comment.comments.total)
            return;    // we are dependent on last comment in store for paging.
                       // this.store.remove(comment);
        // we are dependent on last comment in store for paging.
        // this.store.remove(comment);
        Ext.removeNode(this.getItemNodeByDocId(comment.docId));
    },
    /**
     * @inheritdoc
     */
    payAttention() {
        if (CJ.app.getActiveRoute().getMeta('scroll') === false)
            return;
        const id = CJ.app.getRouteParam('commentId') || CJ.app.getRouteParam('replyId');
        if (!id)
            return;
        return this.mixins.attentionable.payAttention(this.getItemNodeByDocId(id));
    },
    /**
     * prepends items from response to the list
     * @param {Object} response
     * @param {Object} request
     */
    prependItems(response, request) {
        const items = response.ret.items || [];
        if (items.length == 0)
            return;
        this.prepareItemsToInsert(items);
        const fragment = this.renderItemTpl(items), separator = document.createElement('div');
        separator.className = 'd-paging-separator';
        fragment.appendChild(separator);
        const store = this.store;
        for (let i = items.length - 1, item; item = items[i]; i--)
            store.insert(0, item.docId, item);
        this.getItemsElement().insertFirst(fragment);
    },
    /**
     * appends items from response to the list
     * @param {Object} response
     * @param {Object} request
     */
    appendItems(response, request) {
        const items = response.ret.items || [];
        if (items.length == 0)
            return;
        this.prepareItemsToInsert(items);
        const fragment = this.renderItemTpl(items), separator = document.createElement('div');
        separator.className = 'd-paging-separator';
        fragment.insertBefore(separator, fragment.firstChild);
        const store = this.store;
        for (let i = 0, item; item = items[i]; i++)
            store.add(item.docId, item);
        this.getItemsElement().appendChild(fragment);
    },
    /**
     * removes comment on the server by making rpc-request
     * @param {String} result [yes, no]
     */
    removeComment(result, commentId) {
        if (result != 'yes')
            return;
        CJ.Comment.destroy(commentId, {
            stash: { commentId },
            scope: this,
            success: this.onRemoveCommentSuccess
        });
    },
    /**
     * will be called after comment has been removed
     */
    onRemoveCommentSuccess(response, request) {
        const commentId = request.stash.commentId;
        this.eraseComment(commentId);
    },
    /**
     * @param {String} commentId
     * @return {undefined}
     */
    eraseComment(commentId) {
        const item = this.store.get(commentId), node = this.getItemNodeByDocId(commentId);
        item.deleted = true;
        Ext.removeNode(node.querySelector('.d-comments-menu'));
        this.switchMenu(node, false);
        this.updateNode(node, item, [
            '.user-fullname',
            '.content-inner',
            '.date-edited'
        ]);
        if (node.attachment)
            node.attachment.destroy();
        this.removeCommentLocally(item);
    },
    /**
     * processes tap-event on the whole list
     */
    onInnerElementTapHandler(e) {
        e.stopEvent();
        const node = e.getTarget('.d-comment-item', 10), docId = CJ.getNodeData(node, 'docId'), expanded = CJ.getNodeData(node, 'expanded') == 'true', comment = this.store.get(docId);
        if (!expanded)
            return this.setCommentExpanded(node, true);
        if (e.getTarget('.expand-area', 10))
            return this.setCommentExpanded(node, false);
        if (e.getTarget('.d-comment-body', 10) && !comment.deleted)
            return this.switchMenu(node);
    },
    /**
     * @param {Ext.Evented} e
     */
    onMenuItemTap(e) {
        e.stopEvent();
        const target = e.getTarget('.d-item'), event = CJ.getNodeData(target, 'event'), node = e.getTarget('.d-comment-item'), method = CJ.tpl('on{0}ButtonHandler', CJ.capitalize(event)), commentId = CJ.getNodeData(node, 'docId');
        if (this[method])
            this[method](target, commentId);
    },
    /**
     * hides or shows comment's content
     * @param {HTMLElement} node
     * @param {Boolean} state
     */
    setCommentExpanded(node, state) {
        const contentDom = node.querySelector('.content'), contentEl = CJ.fly(contentDom);
        Ext.TaskQueue.requestWrite(() => {
            CJ.setNodeData(node, 'expanded', state);
        });    // expand
        // expand
        if (state) {
            CJ.Animation.animate({
                el: contentEl,
                cls: 'show-animated',
                before() {
                    node.classList.add('expanded');
                    contentEl.show();
                    contentEl.removeCls('show-animated hide-animated');
                },
                after() {
                    CJ.unFly(contentEl);
                }
            });
            Ext.TaskQueue.requestWrite(function () {
                const id = CJ.getNodeData(node, 'docId');
                node.replyList = this.createReplyList(node, { docId: id });
                CJ.Comment.loadReplyItems(id, {
                    scope: this,
                    success(comments) {
                        node.replyList.setComments(comments.ret);
                        node.replyList.renderItems(comments.ret.items);
                    }
                });
            }, this);
        } else {
            CJ.Animation.animate({
                el: contentEl,
                cls: 'hide-animated',
                scope: this,
                before() {
                    contentEl.removeCls('show-animated hide-animated');
                },
                after() {
                    node.classList.remove('expanded');
                    CJ.unFly(contentEl);
                }
            });
            Ext.TaskQueue.requestWrite(function () {
                this.destroyReplyList(node);
            }, this);
        }
        this.switchMenu(node, state);
    },
    /**
     * hides or shows menu for a specific node.
     * @param {HTMLElement} node
     * @param {Boolean} state True to keep menu expanded
     */
    switchMenu(node, state) {
        const menu = node.querySelector('.d-comments-menu');    // comment had been deleted
        // comment had been deleted
        if (!menu)
            return;
        const isExpanded = CJ.getNodeData(menu, 'expanded') == 'true', el = CJ.fly(menu);
        if (state == isExpanded)
            return;
        CJ.setNodeData(menu, 'expanded', !isExpanded);
        CJ.Animation.animate({
            maxDelay: 500,
            el,
            cls: isExpanded ? 'hide-animated' : 'show-animated',
            before() {
                el.removeCls('hide-animated show-animated');
            },
            after() {
                CJ.unFly(el);
            }
        });
    },
    /**
     * destroyes replyList if exists
     * @param {HTMLElement} node
     */
    destroyReplyList(node) {
        if (!node.replyList)
            return;
        node.replyList.destroy();
        delete node.replyList;
    },
    /**
     * shows the delete confirm
     */
    onDeleteButtonHandler(button, commentId) {
        CJ.confirm('view-comments-delete-confirm-title', 'view-comments-delete-confirm-text', Ext.bind(function (result) {
            this.removeComment(result, commentId);
        }, this));
    },
    /**
     * @param {HTMLElement} node
     * @param {HTMLElement} newNode
     * @param {Array} selectors list of strings
     * @return {undefined}
     */
    updateNode(node, newData, selectors) {
        const div = document.createElement('div');
        div.innerHTML = this.getItemTpl().apply(newData);
        for (let i = 0, selector; selector = selectors[i]; i++)
            node.querySelector(selector).innerHTML = div.querySelector(selector).innerHTML;
        Ext.removeNode(div);
    },
    /**
     * redirects user to profile of a user who made the comment
     * @param {Ext.Button} button
     * @param {Number} commentId
     */
    onUserButtonHandler(button, commentId) {
        const item = this.store.get(commentId);
        CJ.app.redirectTo(`!u/${ item.user }`);
    },
    /**
     * sends an ajax request to the server in order to send user an email
     * @param {HTMLElement} node
     * @param {Number} commentId
     */
    onFlagButtonHandler(node, commentId) {
        if (node.flagged)
            return;
        CJ.Comment.flag(commentId);
        node.flagged = true;
        const el = CJ.fly(node);
        el.addCls('active');
        CJ.unFly(el);
    },
    /**
     * @param {HTMLElement} node
     * @param {String} commentId
     * @return {undefined}
     */
    onModerateButtonHandler(node, commentId) {
        const item = this.store.get(commentId), moderated = !item.moderated;
        item.moderated = moderated;
        CJ.Comment.moderate(moderated, commentId);
        CJ.feedback({ message: CJ.t(moderated ? 'view-comments-message-moderate-on' : 'view-comments-message-moderate-off') });
        node.innerHTML = CJ.t(moderated ? 'view-comments-item-moderate-off' : 'view-comments-item-moderate-on');
    },
    /**
     * @param {Ext.Button} button
     * @param {Number} commentId
     */
    onEditButtonHandler(button, commentId) {
        const item = this.store.get(commentId);
        const attachment = this.getItemNodeByDocId(commentId).attachment;
        let popup;
        popup = Ext.factory({
            xtype: 'core-view-popup',
            title: 'view-comments-edit-popup-title',
            actionButton: { text: CJ.app.t('view-comments-edit-popup-submit') },
            content: {
                xtype: 'view-comments-reply-container',
                originValue: item.content,
                attachment: attachment && attachment.getFileInfo()
            },
            listeners: {
                scope: this,
                order: 'after',
                actionbuttontap(popup) {
                    this.saveEditChanges(popup, item);
                }
            }
        });    // because on ios focus works only in tap-handler function
        // because on ios focus works only in tap-handler function
        popup.down('[isGrowField]').focus();
    },
    /**
     * @param {CJ.core.view.Popup} popup
     * @param {Object} item Comment's information
     */
    saveEditChanges(popup, item) {
        const cmp = popup.getContent(), content = cmp.getEditedValue();
        CJ.Comment.update(item.docId, {
            comment: content,
            attachment: cmp.getAttachment(),
            stash: {
                item,
                content
            },
            scope: this,
            success: this.onCommentChangesSaved
        });
    },
    /**
     * will be called after comment's changes will be saved
     *
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onCommentChangesSaved(response, request) {
        const stash = request.stash, item = stash.item, element = this.getItemNodeByDocId(item.docId);    // in order to remove attachment from a comment.
        // in order to remove attachment from a comment.
        Ext.applyIf(response.ret, {
            attachmentName: null,
            attachmentUrl: null
        });
        Ext.apply(item, response.ret);
        Ext.apply(item, {
            edited: item.date,
            expanded: false,
            content: stash.content
        });
        this.switchMenu(element, false);
        this.updateNode(element, item, [
            '.date-edited',
            '.content-inner'
        ]);
        this.initAttachment(element, item);
    },
    /**
     * @param {Ext.Button} button
     * @param {Number} commentId
     */
    onReplyButtonHandler(button, commentId) {
        if (!CJ.User.isLogged())
            return CJ.view.login.Login.popup();
        const popup = Ext.factory({
            xtype: 'core-view-popup',
            title: 'view-comments-reply-popup-title',
            actionButton: { text: CJ.app.t('view-comments-reply-popup-submit') },
            content: {
                xtype: 'view-comments-reply-container',
                attachment: false
            },
            listeners: {
                scope: this,
                order: 'after',
                actionbuttontap(popup) {
                    return this.createReply(popup, commentId);
                }
            }
        });    // because on ios focus works only in tap-handler function
        // because on ios focus works only in tap-handler function
        popup.down('[isGrowField]').focus();
    },
    /**
     * creates new comment and show nested-list
     * @param {CJ.core.view.Popup} popup
     */
    createReply(popup, commentId) {
        const item = this.store.get(commentId), element = this.getItemNodeByDocId(commentId), contentCmp = popup.getContent(), value = contentCmp.getEditedValue();
        CJ.Comment.create(commentId, {
            comment: value,
            attachment: contentCmp.getAttachment(),
            stash: {
                element,
                item
            },
            scope: this,
            success: this.onReplyCreated
        });
    },
    /**
     * method will be called after reply has been created
     */
    onReplyCreated(response, request) {
        const block = this.getBlock(), element = request.stash.element, params = request.initialConfig.args, parentComment = this.store.get(request.params.id), item = {
                userFullname: CJ.User.get('name'),
                user: CJ.User.get('user'),
                comments: {
                    items: [],
                    total: 0,
                    subtreeTotal: 0
                }
            };
        Ext.apply(item, params, response.ret);
        item.docId = item.id;
        item.edited = item.date;
        parentComment.comments.total += 1;
        parentComment.comments.subtreeTotal += 1;
        element.replyList = element.replyList || this.createReplyList(element);
        element.replyList.insertComment(0, item);
        this.setCount(this.getCount() + 1);
        block.fireEvent('commentcreate', block.getCommentsCount() + 1, block);
    },
    onChange: Ext.emptyFn,
    /**
     * @param {HTMLElement} element
     * @param {Object} item
     */
    initReplyList(element, item) {
        const replies = item.comments;
        if (replies.items.length == 0)
            return;
        element.replyList = this.createReplyList(element, {
            comments: replies,
            docId: item.docId
        });
    },
    /**
     * @param {HTMLElement} element
     * @param {Object} config
     */
    createReplyList(element, config) {
        const list = Ext.factory(Ext.applyIf(config || {}, {
            xtype: 'view-comments-list-reply',
            level: this.getLevel() + 1,
            block: this.getBlock()
        }));
        list.renderTo(element.querySelector('.d-bottom-bar'));
        return list;
    },
    /**
     * @param {HTMLElement} buttonEl
     * @param {String} commentId
     */
    onPinButtonHandler(buttonEl, commentId) {
        CJ.Comment.pin(commentId);
    },
    /**
     * @param {HTMLElement} buttonEl
     * @param {String} commentId
     */
    onUnpinButtonHandler(buttonEl, commentId) {
        const store = this.store;
        Promise.resolve().then(() => {
            CJ.Comment.unpin(commentId);
        }).then(() => {
            this.eraseComment(commentId);
        }).then(() => {
            store.removeAtKey(commentId);
            this.setEmpty(store.getCount() == 0);
        });
    },
    /**
     * @param {Ext.Element} element Comment's element
     */
    destroyElement(element) {
        const node = element.isElement ? element.dom : element, attachment = node.attachment;
        Ext.TaskQueue.requestWrite(() => {
            attachment && attachment.destroy();
        });
        if (element.isElement)
            element.destroy();
        else
            Ext.removeNode(element);
    },
    /**
     * @param {Object} item
     * @return {String} one of [reader, blockOwner, commentOwner]
     */
    getUserType(item) {
        const username = CJ.User.get('user');
        if (!CJ.User.isLogged())
            return 'notLogged';
        if (CJ.User.isPortalAdmin())
            return 'portalAdmin';
        if (item.user == username)
            return 'commentOwner';
        if (this.getBlock().getUserInfo().user == username)
            return 'blockOwner';
        return 'reader';
    },
    /**
     * @param {Boolean} state
     */
    updateEmpty(state) {
        this[state ? 'addCls' : 'removeCls']('d-empty-list');
    },
    initStore(items) {
        for (let i = 0, item; item = items[i]; i++)
            this.store.add(item.docId, item);
    },
    /**
     * @param {Number} docId
     * @return {HTMLElement}
     */
    getItemNodeByDocId(docId) {
        const el = this.getItemsElement(), selector = CJ.tpl('[data-doc-id=\'{0}\']', docId);
        return el.dom.querySelector(selector);
    },
    /**
     * @return {Ext.Element}
     */
    getItemsElement() {
        return this.innerElement;
    },
    /**
     * @param {Array} items
     */
    renderItems(items) {
        this.itemsLoaded = true;
        this.removeAllItems();
        this.initStore(items);
        this.prepareItemsToInsert(items);
        this.getItemsElement().dom.appendChild(this.renderItemTpl(items));
        this.setEmpty(items.length == 0);
        this.fireEvent('afterrenderitems', this);
    },
    /**
     * @param {Array|Object} items
     */
    renderItemTpl(items) {
        items = Ext.isArray(items) ? items : [items];
        const tpl = this.getItemTpl(), result = [], html = [];
        for (var i = 0, item; item = items[i]; i++) {
            if (item.deleted && item.comments.total == 0)
                continue;
            html.push(tpl.apply(item));
            result.push(item);
        }
        const fragment = document.createDocumentFragment(), div = document.createElement('div'), i = 0;
        div.innerHTML = html.join('');
        while (div.firstChild) {
            this.initItemComponents(div.firstChild, result[i]);
            fragment.appendChild(div.firstChild);
            i++;
        }
        return fragment;
    },
    /**
     * @return {Object}
     */
    getFirstItem() {
        return { element: this.getItemsElement().first(this.getItemSelector()) };
    },
    /**
     * method will scroll(if needed) in order to make leave-field visible.
     */
    scrollToField() {
        // using taskqueue here because unmask and rendering attachment
        // components methods are using RAF
        const field = this.getField();
        Ext.TaskQueue.requestWrite(() => {
            CJ.Utils.scrollIntoViewIfNeeded(field.element.dom);
        });
    }
});