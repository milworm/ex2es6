import 'Ext/DataView';

Ext.define('CJ.view.notifications.List', {
    extend: 'Ext.DataView',
    alias: 'widget.view-notifications-list',
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-notifications-list',
        /**
         * @cfg {Number} unseen
         */
        unseen: null,
        /**
         * @cfg {Object} scrollable
         */
        scrollable: CJ.Utils.getScrollable(),
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null,
        /**
         * @cfg {Object} store
         */
        store: {
            autoLoad: true,
            fields: [
                'id',
                'type',
                'seen',
                'activityId',
                'target',
                'subtarget',
                'targetCls',
                'targetName',
                'targetHashId',
                'userIcon',
                'userName',
                'commentRootId',
                'badge',
                'pinned',
                {
                    name: 'count',
                    type: 'number'
                },
                {
                    name: 'date',
                    type: 'date',
                    convert(value) {
                        return Ext.Date.parse(value, 'Y-m-d H:i:s');
                    }
                }
            ],
            proxy: {
                type: 'ajax',
                url: CJ.constant.request.rpc,
                enablePagingParams: false,
                extraParams: {
                    model: 'Notification',
                    method: 'load_notifications',
                    kwargs: Ext.encode({
                        offset: 0,
                        limit: 20
                    })
                },
                reader: {
                    type: 'json',
                    rootProperty: 'ret.items',
                    totalProperty: 'ret.total'
                }
            },
            listeners: {
                load: 'onStoreLoad',
                single: true
            }
        },
        /**
         * @cfg {Ext.XTemplate} itemTpl
         */
        itemTpl: [
            '<tpl if="values.type == \'notification-badge-earned\'">',
            '<div class="wrapper d-notification-badge-earned {[ this.getUnseenCls(values.seen) ]}">',
            '<div class="d-user-info">',
            '<div class="icon">',
            '<img src="{userIcon}">',
            '</div>',
            '<div class="message">',
            '<span class="user">{[this.getUserLabel(values)]} </span>',
            '</div>',
            '</div>',
            '<div class="d-badge-info">',
            '<div class="d-badge-icon" style="background-image: url(\'{badge.icon}\');"></div>',
            '<div class="d-learned-message">',
            '{[ CJ.t("view-notifications-list-badge-congrats-message") ]}',
            '</div>',
            '<div class="d-badge-title">',
            '{badge.name}',
            '</div>',
            '<div class="d-pin-button">',
            '<tpl if="badge.display || pinned">',
            '{[ CJ.t("view-notifications-list-badge-show-skills") ]}',
            '<tpl else>',
            '{[ CJ.t("view-notifications-list-badge-pin") ]}',
            '</tpl>',
            '</div>',
            '</div>',
            '</div>',
            '<tpl else>',
            '<div class="wrapper {[ this.getUnseenCls(values.seen) ]}">',
            '<div class="icon"><img src="{userIcon}"></div>',
            '<div class="message">',
            '<tpl if="this.getShowUserNameState(values)">',
            '<span class="user">{[this.getUserLabel(values)]} </span>',
            '</tpl>',
            '{[ this.getText(values) ]}',
            '</div>',
            '<div class="date">{[this.getFormattedDate(values.date)]}</div>',
            '</div>',
            '</tpl>',
            {
                getUnseenCls(seen) {
                    return !seen ? 'unseen' : '';
                },
                getUserLabel(values) {
                    const count = values.count, userLabel = count > 1 ? `${ count } ${ CJ.app.t('notification-persons') }` : values.userName;
                    return userLabel;
                },
                getText(values) {
                    let action, target, plurality = true;
                    switch (values.type) {
                    case 'notification-your-activity-answered':
                        action = 'notification-action-has-answered';
                        target = 'notification-target-your-activity';
                        break;
                    case 'notification-your-activity-commented':
                        action = 'notification-action-has-commented';
                        target = 'notification-target-your-activity';
                        break;
                    case 'notification-your-comment-commented':
                        action = 'notification-action-has-replied-to';
                        target = 'notification-target-your-comment';
                        break;
                    case 'notification-your-answer-commented':
                        action = 'notification-action-has-commented';
                        target = 'notification-target-your-response';
                        break;
                    case 'notification-your-key-followed':
                        action = 'notification-action-is-now-following';
                        target = values.target;
                        break;
                    case 'notification-your-comment-deleted':
                        action = 'notification-action-has-deleted';
                        target = 'notification-target-your-comment';
                        break;
                    case 'notification-your-answer-deleted':
                        action = 'notification-action-has-deleted';
                        target = 'notification-target-your-answer';
                        break;
                    case 'notification-your-block-reused':
                        let entity;
                        switch (values.targetCls) {
                        case 'Document':
                            entity = 'block';
                            break;
                        case 'Playlist':
                            entity = 'playlist';
                            break;
                        case 'Map':
                            entity = 'map';
                            break;
                        }
                        action = `notification-action-${ entity }-reused`;
                        target = `notification-target-your-${ entity }-reused`;
                        break;
                    case 'notification-reused-block-content-changed':
                        action = 'notification-action-reused-content-changed';
                        plurality = false;
                        break;
                    case 'notification-reused-block-permissions-changed':
                        action = 'notification-action-reused-permissions-changed';
                        plurality = false;
                        break;
                    case 'notification-reused-block-deleted':
                        action = 'notification-action-reused-deleted';
                        plurality = false;
                        break;
                    case 'notification-group-join-request':
                        action = 'notification-action-group-join-request';
                        target = values.targetName;
                        break;
                    case 'notification-group-join-approved':
                        action = 'notification-action-group-join-approved';
                        plurality = false;
                        target = values.targetName;
                        break;
                    case 'notification-group-join-denied':
                        return this.generateGroupJoinDeniedText(values);
                    case 'notification-group-join-invited':
                        action = 'notification-action-group-join-invited';
                        plurality = false;
                        target = values.targetName;
                        break;
                    case 'notification-group-member-left':
                        action = 'notification-action-group-member-left';
                        target = values.targetName;
                        break;
                    case 'notification-group-member-kicked':
                        action = 'notification-action-group-member-kicked';
                        plurality = false;
                        target = values.targetName;
                        break;
                    case 'notification-group-post-removed':
                        action = 'notification-action-group-post-removed';
                        plurality = false;
                        target = values.targetName;
                        break;
                    default:
                        return '';
                    }
                    if (plurality && values.count > 1)
                        action += '-plurality';
                    const html = CJ.app.t(action);
                    if (target)
                        return `${ html } <span>${ CJ.app.t(target) }</span>`;
                    return html;
                },
                getFormattedDate(date) {
                    return Ext.Date.format(date, 'Y:m:d - H:i');
                },
                /**
                 * @return {Boolean} true to show user name
                 */
                getShowUserNameState(values) {
                    const hidden = [
                        'notification-reused-block-content-changed',
                        'notification-reused-block-permissions-changed',
                        'notification-reused-block-deleted',
                        'notification-group-join-approved',
                        'notification-group-join-denied',
                        'notification-group-member-kicked',
                        'notification-group-post-removed'
                    ];
                    return hidden.indexOf(values.type) == -1;
                },
                /**
                 * @param {Object} values
                 * @return {String}
                 */
                generateGroupJoinDeniedText(values) {
                    const tpl = CJ.app.t('notification-action-group-join-denied'), target = CJ.tpl('<span>{0}</span>', values.targetName);
                    return CJ.tpl(tpl, target);
                }
            }
        ],
        /**
         * @param {Object} plugins
         */
        plugins: [{ xclass: 'CJ.core.plugins.SimpleDataViewPaging' }],
        /**
         * @cfg {Ext.Button} button
         */
        button: null
    },
    /**
     * @param {Object} config
     */
    constructor(config undefined {}) {
        Ext.apply(config, { emptyText: CJ.app.t('notifications-empty-text') });
        return this.callParent(args);
    },
    /**
     * Initializes component.
     */
    initialize() {
        this.callParent(args);
        this.on({
            itemtap: this.onListItemTap,
            destroy: this.onDestroy,
            scope: this
        });
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    updatePopup(popup) {
        popup.on('actionbuttontap', this.markAllAsRead, this);
    },
    /**
     * @return {undefined}
     */
    onDestroy() {
        this.getStore().destroy();
    },
    /**
     * Sets the popup title with count of 'unseen' notifications.
     * @param {Number} count
     * @returns {Number}
     */
    applyUnseen(count) {
        if (this.isDestroyed)
            return count;
        const titleText = CJ.app.t('notification-popup-title'), countText = count ? `(${ count })` : '', popup = this.getPopup();
        if (popup) {
            popup.setTitle([
                titleText,
                countText
            ].join(' '));
            popup.setTitleBar(true);    // to refresh title-bar @TODO
        }
        return count;
    },
    /**
     * @param {Number} count
     */
    updateUnseen(count) {
        if (!this.initialized)
            return;
        CJ.fire('notifications.do', 'seen');
    },
    /**
     * Handler of the dataview event 'itemtap'.
     * @param {Ext.dataview.DataView} dataview
     * @param {Number} index
     * @param {Ext.Element} target
     * @param {Ext.data.Model} record
     * @param {Ext.Evented} e
     */
    onListItemTap(dataview, index, target, record, e) {
        if (!record.get('seen'))
            this.doSeenRequest(record.get('id'));
        const type = record.get('type');
        const handlerName = `${ CJ.Utils.camelCase(type) }TapHandler`;
        const popup = this.getPopup();
        let result;
        if (this[handlerName])
            result = this[handlerName](record, e);
        if (result !== false && popup)
            popup.hide();
    },
    /**
     * Makes a request to the server to set a seen state of the notification.
     * @param {Number} id
     */
    doSeenRequest(id) {
        CJ.request({
            rpc: {
                model: 'Notification',
                method: 'set_seen'
            },
            params: { id },
            success: this.onSetSeenSuccess,
            scope: this
        });
    },
    /**
     * Callback of successful request to the server to set 'seen' state.
     * @param {Object} response
     */
    onSetSeenSuccess(response) {
        this.setUnseen(response.ret);
    },
    /**
     * Callback of popup event 'hide'.
     * Tries to run the handler for the notification, that was tapped,
     * dependent on the notifications type.
     * @param {Ext.data.Model} record
     */
    handleNotificationTap(record) {
    },
    /**
     * Handler of notification for type 'notification-your-activity-answered'.
     * @param {Ext.data.Model} record
     */
    notificationYourActivityAnsweredTapHandler(record) {
        const blockId = record.get('target'), answerId = record.get('subtarget'), route = Ext.String.format('!a/{0}/answer/{1}', blockId, answerId);
        CJ.app.redirectTo(route);
    },
    /**
     * Handler of notification for type 'notification-your-activity-commented'.
     * @param {Ext.data.Model} record
     */
    notificationYourActivityCommentedTapHandler(record) {
        const blockId = record.get('target'), commentId = record.get('subtarget'), route = Ext.String.format('!c/{0}/comment/{1}', blockId, commentId);
        CJ.app.redirectTo(route);
    },
    /**
     * Handler of notification for type 'notification-your-answer-commented'.
     * @param {Ext.data.Model} record
     */
    notificationYourCommentCommentedTapHandler(record) {
        const activityId = record.get('commentRootId');
        const targetId = record.get('target');
        const subtargetId = record.get('subtarget');
        let route = '!c/{0}/reply/{1}/{2}';
        route = Ext.String.format(route, activityId, targetId, subtargetId);
        CJ.app.redirectTo(route);
    },
    /**
     * Handler of notification for type 'notification-your-answer-commented'.
     * @param {Ext.data.Model} record
     */
    notificationYourAnswerCommentedTapHandler(record) {
        const answerId = record.get('target'), commentId = record.get('subtarget'), route = Ext.String.format('!c/{0}/comment/{1}', answerId, commentId);
        CJ.app.redirectTo(route);
    },
    /**
     * Handler of notification for type 'notification-your-key-followed'.
     * @param {Ext.data.Model} record
     */
    notificationYourKeyFollowedTapHandler(record) {
        const tags = record.get('target'), route = CJ.Utils.tagsToPath(tags);
        CJ.app.redirectTo(route);
    },
    /**
     * Handler of notification for type 'notification-your-comment-deleted'.
     * @param {Ext.data.Model} record
     */
    notificationYourCommentDeletedTapHandler(record) {
        const blockId = record.get('commentRootId');
        const targetId = record.get('target');
        const subtargetId = record.get('subtarget');
        const targetCls = record.get('targetCls');
        let route;
        if (targetCls == 'Document')
            route = Ext.String.format('!c/{0}/comment/{1}', record.get('activityId'), subtargetId);
        else
            route = Ext.String.format('!c/{0}/reply/{1}/{2}', record.get('commentRootId'), targetId, subtargetId);
        CJ.app.redirectTo(route);
    },
    /**
     * Handler of notification for type 'notification-your-answer-deleted'.
     * @param {Ext.data.Model} record
     */
    notificationYourAnswerDeletedTapHandler(record) {
        const blockId = record.get('target'), route = Ext.String.format('!a/{0}', blockId);
        CJ.app.redirectTo(route);
    },
    /**
     * Handler of notification for type 'notification-your-block-reused'.
     * redirects user to newly created/reused block
     * @param {Ext.data.Model} record
     */
    notificationYourBlockReusedTapHandler(record) {
        const blockId = record.get('target');
        let route;
        switch (record.get('targetCls')) {
        case 'Document':
            route = CJ.tpl('!{0}', blockId);
            break;
        case 'Playlist':
            route = CJ.tpl('!p/{0}', blockId);
            break;
        case 'Map':
            route = CJ.tpl('!m/{0}', blockId);
            break;
        default:
            return;
        }
        CJ.app.redirectTo(route);
    },
    /**
     * Handler of notification for type 'notification-reused-block-deleted'.
     * redirects user to user's deleted block
     * @param {Ext.data.Model} record
     */
    notificationReusedBlockDeletedTapHandler(record) {
        CJ.app.redirectTo(`!m/${ record.get('target') }`);
    },
    /**
     * Handler of notification for type 'reused-block-content-changed'.
     * redirects user to user's reused block
     * @param {Ext.data.Model} record
     */
    notificationReusedBlockContentChangedTapHandler(record) {
        CJ.app.redirectTo(`!m/${ record.get('target') }`);
    },
    /**
     * Handler of notification for type 'reused-block-permissions-changed'.
     * redirects user to user's reused block
     * @param {Ext.data.Model} record
     */
    notificationReusedBlockPermissionsChangedTapHandler(record) {
        CJ.app.redirectTo(`!m/${ record.get('target') }`);
    },
    /**
     * Handler of notification for type 'group-join-request'.
     * redirects user to group feed
     * @param {Ext.data.Model} record
     */
    notificationGroupJoinRequestTapHandler(record) {
        // because user could be already on targetHashId-group page, so redirect could be skipped and user will not see
        // members-popup.
        if (CJ.StreamHelper.getGroup())
            CJ.Stream.getHeader().setTags(null);
        CJ.app.AUTO_OPEN_MEMBERS = true;
        CJ.app.redirectTo(`!g/+${ record.get('targetHashId') }`);
    },
    /**
     * Handler of notification for type 'notification-group-join-approved'.
     * redirects user to group feed
     * @param {Ext.data.Model} record
     */
    notificationGroupJoinApprovedTapHandler(record) {
        CJ.app.redirectTo(`!g/+${ record.get('targetHashId') }`);
    },
    /**
     * Handler of notification for type 'notification-group-join-denied'.
     * redirects user to group feed
     * @param {Ext.data.Model} record
     */
    notificationGroupJoinDeniedTapHandler(record) {
        CJ.app.redirectTo(`!g/+${ record.get('targetHashId') }`);
    },
    /**
     * Handler of notification for type 'notification-group-join-invited'.
     * joins user to a group and redirects group's feed
     * @param {Ext.data.Model} record
     */
    notificationGroupJoinInvitedTapHandler(record) {
        CJ.Group.join(record.get('target'), {
            success() {
                CJ.app.fireEvent('group.joined');
                CJ.app.redirectTo(`!g/+${ record.get('targetHashId') }`);
            }
        });
    },
    /**
     * Handler of notification for type 'notification-group-member-left'.
     * redirects user to group feed
     * @param {Ext.data.Model} record
     */
    notificationGroupMemberLeftTapHandler(record) {
        CJ.app.redirectTo(`!g/+${ record.get('targetHashId') }`);
    },
    /**
     * Handler of notification for type 'notification-group-member-kicked'.
     * redirects user to group feed
     * @param {Ext.data.Model} record
     */
    notificationGroupMemberKickedTapHandler(record) {
        CJ.app.redirectTo(`!g/+${ record.get('targetHashId') }`);
    },
    /**
     * Handler of notification for type 'notification-group-post-removed'.
     * redirects user to group feed
     * @param {Ext.data.Model} record
     */
    notificationGroupPostRemovedTapHandler(record) {
        CJ.app.redirectTo(`!m/${ record.get('subtarget') }`);
    },
    /**
     * Handler of notification for type 'notification-badge-earned'.
     * redirects user to group feed
     * @param {Ext.data.Model} record
     * @return {Boolean}
     */
    notificationBadgeEarnedTapHandler(record, e) {
        record.set('seen', true);
        if (!e.getTarget('.d-pin-button', 1))
            return;
        let url;
        if (record.get('pinned')) {
            url = CJ.tpl('!u/{0}/s', CJ.User.get('user'));
            CJ.app.redirectTo(url);
        } else {
            CJ.Badge.pin(record.get('target'));
            record.set('pinned', true);
            return false;
        }
    },
    /**
     * simply makes a request in order to mark all list-items as read
     */
    markAllAsRead() {
        this.mask();
        CJ.request({
            rpc: {
                model: 'Notification',
                method: 'set_seen_all'
            },
            success: this.onMarkAllAsReadSuccess,
            callback: this.onMarkAllAsReadCallback,
            scope: this
        });
        return false;
    },
    /**
     * Handler of a success request to the server
     * to mark all notifications as seen.
     * Mask all notifications as seen.
     */
    onMarkAllAsReadSuccess() {
        this.getStore().each(record => {
            record.set('seen', true);
        });
        this.setUnseen(0);
    },
    /**
     * Callback of a request to the server
     * to mark all notifications as seen.
     * Hides load mask.
     */
    onMarkAllAsReadCallback() {
        this.unmask();
    }
});