import 'app/core/view/form/GrowField';
import 'app/view/comments/list/Full';
import 'app/view/comments/list/Reply';
import 'app/view/comments/list/Modal';
import 'app/view/comments/list/Inline';
import 'app/view/comments/list/Course';

/**
 * Defines a component that allows user to enter a comment
 * and upload an attachment.
 */
Ext.define('CJ.view.comments.LeaveCommentField', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.form.GrowField',
    /**
     * @property {String}
     */
    xtype: 'view-comments-leavecommentfield',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-growfield d-leave-comment-field',
        /**
         * @cfg {String} placeHolder
         */
        placeHolder: 'view-comments-placeholder',
        /**
         * @cfg {Number} minFieldHeight
         */
        minFieldHeight: 38,
        /**
         * @cfg {Number} maxFieldHeight
         */
        maxFieldHeight: 56,
        /**
         * @cfg {Object} attachmentComponent
         */
        attachmentComponent: null,
        /**
         * @cfg {Object} uploadField
         */
        uploadField: {},
        /**
         * @cfg {Number} count
         */
        count: 0,
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class=\'d-label\'>{label}</div>', '<tpl if=\'modern\'>', '<div class=\'d-field-content\' data-placeholder=\'{placeholder}\' contenteditable=\'true\'></div>', '<tpl else>', '<textarea class=\'d-field-content d-input\' placeholder=\'{placeholder}\' maxlength=\'{maxLength}\' rows=\'1\'></textarea>', '<textarea class=\'d-field-content d-shadow\' rows=\'1\' tabindex=\'-1\'></textarea>', '</tpl>', '<div class=\'d-hint\'>{hint}</div>', // display: none is needed in order to use Ext.Element.hide/show
        '<div class=\'attachment-container\' style=\'display: none\'></div>', '<div class=\'submit\'></div>', '{[CJ.Utils.templates.noAccess]}', { compiled: true })
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        this.callParent(args);
        this.attachmentContainer = this.element.down('.attachment-container');
    },
    /**
     * @param {Object} config
     * @return {CJ.core.view.form.Icon}
     */
    applyUploadField(config) {
        if (!config)
            return null;
        return Ext.factory({
            xtype: 'core-view-form-icon',
            ref: 'uploadfield',
            isIcon: false,
            renderTo: this.element,
            listeners: {
                scope: this,
                uploadsuccess: this.onFileUploadSuccess
            }
        });
    },
    /**
     * @param {CJ.core.view.form.Icon} newItem
     * @param {CJ.core.view.form.Icon} oldItem
     * @return {undefined}
     */
    updateUploadField(newItem, oldItem) {
        if (oldItem)
            oldItem.destroy();
    },
    /**
     * @param {Object} newItem
     * @param {Object} oldItem
     * @return {undefined}
     */
    updateAttachmentComponent(newItem, oldItem) {
        if (oldItem) {
            oldItem.destroy();
            this.attachmentContainer.hide();
            this.removeCls('d-has-attachment');
        }
        if (newItem) {
            newItem.renderTo(this.attachmentContainer);
            this.attachmentContainer.show();
            this.addCls('d-has-attachment');
        }
    },
    initialize() {
        this.callParent(args);
        this.on({
            focus: this.onFocusHandler,
            blur: this.onBlurHandler,
            tap: {
                fn: this.onSubmitTap,
                delegate: '.submit',
                element: 'element'
            },
            scope: this
        });
        if (!Ext.os.is.Desktop)
            return;
        this.on('keypress', this.onElementKeyPress, this);
    },
    onPainted() {
        if (this.getCount() == 0 && CJ.User.isLogged())
            this.focus();
    },
    onFocusHandler() {
        this.addCls('upload-button-visible');
        this.getUploadField().show();
        CJ.app.fireEvent('buttons.hide', this);
    },
    onBlurHandler() {
        CJ.app.fireEvent('buttons.show', this);
    },
    /**
     * @param {Ext.event.Dom} e
     */
    onElementKeyPress(e) {
        const browserEvent = e.event, keyCode = browserEvent.keyCode;
        if (browserEvent.shiftKey)
            return;
        if (keyCode == 13)
            this.onSubmitTap(e);
    },
    /**
     * Handler of event 'tap' of submit button.
     */
    onSubmitTap(e) {
        e.stopEvent();
        if (this.getUploadField().getUploading() || !this.validate())
            return;
        this.fireEvent('submit', this.getValue(), this.getAttachment(), this);
        this.setValue('');
    },
    /**
     * @param {Ext.Component} field
     * @param {Object} fileInfo
     * @param {String} fileInfo.uuid
     * @param {String} fileInfo.original_filename
     * @param {Object} fileUrls
     * @param {String} fileUrls.original
     * @param {String} fileUrls.preview
     * @return {undefined}
     */
    onFileUploadSuccess(field, fileInfo, fileUrls) {
        const url = fileUrls.original, fileName = fileInfo.original_filename, uuid = fileInfo.uuid;
        fileInfo = CJ.Utils.urlToFileInfo(url, fileName);
        fileInfo.uuid = uuid;
        this.setAttachmentComponent(Ext.factory({
            xtype: 'view-comments-attachment-view',
            ref: 'attachment-view',
            fileInfo,
            listeners: {
                removed: this.onAttachmentRemoved,
                scope: this
            }
        }));
        this.validate();
    },
    onAttachmentRemoved() {
        this.setAttachmentComponent(null);
    },
    resetAnimated() {
        // defer is needed because of mobile devices
        Ext.defer(() => {
            document.activeElement.blur();
        }, 1);
        this.setAttachmentComponent(null);
        this.hideContent(function () {
            this.showContent();
        }, this);
    },
    hideContent(callback, scope) {
        CJ.Animation.animate({
            el: this.element,
            cls: 'opacity-hide-animated',
            scope: this,
            before() {
                this.element.removeCls('opacity-show-animated opacity-hide-animated');
            },
            after() {
                this.reset();
                Ext.callback(callback, scope);
            }
        });
    },
    showContent() {
        CJ.Animation.animate({
            el: this.element,
            cls: 'opacity-show-animated',
            scope: this,
            before() {
                this.element.removeCls('opacity-show-animated opacity-hide-animated');
            },
            after() {
                this.setAttachmentComponent(null);
                this.element.removeCls('opacity-show-animated');
            }
        });
    },
    /**
     * @return {Object}
     */
    getAttachment() {
        const component = this.getAttachmentComponent();
        if (!component)
            return null;
        return component.getFileInfo();
    },
    validate() {
        const value = this.getValue(), attachment = this.getAttachmentComponent(), isValid = !!(value || attachment);
        this[isValid ? 'removeCls' : 'addCls']('invalid');
        return isValid;
    }
});