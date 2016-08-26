import 'Ext/Container';
import 'app/view/comments/AttachmentView';

/**
 * Class defines the content for comment's reply-popup
 */
Ext.define('CJ.view.comments.ReplyContainer', {
    extend: 'Ext.Container',
    alias: 'widget.view-comments-reply-container',
    config: {
        cls: 'comments-reply-container',
        items: [],
        /**
         * @cfg {String} originValue Text that will be displayed in textarea
         */
        originValue: '',
        /**
         * @cfg {Object} attachment
         */
        attachment: null,
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null
    },
    /**
     * @param {Object} attachment
     */
    applyAttachment(attachment) {
        const viewField = this.getField('view'), editField = this.getField('edit');
        if (!attachment) {
            editField.setHidden(false);
            viewField.setHidden(true);
        } else {
            editField.setHidden(true);
            viewField.setHidden(false);
            viewField.setFileInfo(attachment);
        }
    },
    /**
     * @param {Array} items
     */
    applyItems(items) {
        items = [
            {
                ref: 'value',
                xtype: 'core-view-form-growfield',
                value: this.getOriginValue(),
                placeHolder: 'view-comments-reply-placeholder',
                margin: '0 15px',
                minFieldHeight: 41,
                maxFieldHeight: 76,
                listeners: {
                    keyup: this.onTextareaKeyUp,
                    buffer: 250,
                    scope: this
                }
            },
            {
                xtype: 'container',
                cls: 'attachment',
                ref: 'attachment',
                items: [
                    {
                        xtype: 'core-view-form-icon',
                        isIcon: false,
                        ref: 'edit',
                        labelText: 'view-comments-add-attachment',
                        listeners: {
                            scope: this,
                            uploadstart: this.onFileUploadStart,
                            uploadsuccess: this.onFileUploadSuccess
                        }
                    },
                    {
                        xtype: 'view-comments-attachment-view',
                        ref: 'view',
                        listeners: {
                            removed: this.onAttachmentRemoved,
                            scope: this
                        }
                    }
                ]
            }
        ];
        return this.callParent(args);
    },
    onTextareaKeyUp() {
        if (this.element.hasCls('invalid'))
            this.validate();
    },
    /**
     * @return {undefined}
     */
    onAttachmentRemoved() {
        const viewField = this.getField('view'), editField = this.getField('edit');
        viewField.hide();
        editField.show();
    },
    /**
     * @return {String} 
     */
    getEditedValue() {
        return this.down('[ref=value]').getValue();
    },
    /**
     * @return {Object} 
     */
    getAttachment() {
        return this.getField('view').getFileInfo();
    },
    /**
     * @return {undefined}
     */
    onFileUploadStart() {
        this.getPopup().denySubmit();
    },
    /**
     * @param {CJ.core.view.form.Icon} field
     * @param {Object} fileInfo
     */
    onFileUploadSuccess(field, fileInfo, fileUrls) {
        const url = fileUrls.original, fileName = fileInfo.original_filename, uuid = fileInfo.uuid;
        fileInfo = CJ.Utils.urlToFileInfo(url, fileName);
        fileInfo.uuid = uuid;
        const viewField = this.getField('view'), editField = this.getField('edit');
        editField.hide();
        viewField.setFileInfo(fileInfo);
        viewField.show();
        this.getPopup().allowSubmit();
        this.validate();
    },
    /**
     * @param {String} ref
     * @return {}
     */
    getField(ref) {
        return this.down(Ext.String.format('[ref={0}]', ref));
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    updatePopup(popup) {
        popup.on('actionbuttontap', this.onBeforeActionButtonTap, this, { order: 'before' });
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    onBeforeActionButtonTap(popup) {
        if (!this.validate())
            return false;
    },
    validate() {
        const value = this.getEditedValue(), attachment = this.getAttachment(), isValid = !!(value || attachment);
        this[isValid ? 'removeCls' : 'addCls']('invalid');
        return isValid;
    }
});