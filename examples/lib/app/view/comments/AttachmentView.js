import 'app/core/view/Component';

/**
 * Class is used to display the attachment information (filetype, title).
 */
Ext.define('CJ.view.comments.AttachmentView', {
    extend: 'CJ.core.view.Component',
    alias: 'widget.view-comments-attachment-view',
    config: {
        cls: 'attachment-view',
        /**
         * @cfg {Object} fileInfo
         */
        fileInfo: null,
        /**
         * @cfg {Boolean} editable
         */
        editable: true
    },
    /**
     * shows or hides close-icon
     * @param {Boolean} value
     */
    updateEditable(value) {
        if (value)
            this.replaceCls('d-viewable', 'd-editable');
        else
            this.replaceCls('d-editable', 'd-viewable');
    },
    initialize() {
        this.callParent(args);
        this.element.on('tap', this.onElementTapped, this);
    },
    getElementConfig() {
        return {
            reference: 'element',
            classList: ['x-unsized'],
            children: [
                { reference: 'fileTypeIconEl' },
                {
                    cls: 'file-name',
                    reference: 'fileNameEl'
                },
                {
                    tag: 'div',
                    cls: 'remove-icon',
                    reference: 'closeButtonEl'
                }
            ]
        };
    },
    /**
     * @param {Ext.EventObject} e
     */
    onElementTapped(e) {
        e.stopEvent();
        if (e.getTarget('.remove-icon')) {
            this.setFileInfo(null);
            this.fireEvent('removed');
            return;
        }    // show the file
        // show the file
        window.open(CJ.Utils.fileInfoToUrl(this.getFileInfo()));
    },
    /**
     * @param {String} fileType
     * @return {String} correct css-class name 
     */
    getIconClsFromFileType(fileType) {
        const cls = 'file-type-icon ';
        switch (fileType) {
        case 'jpeg':
        case 'jpg':
        case 'png':
            return `${ cls }file-image-icon`;
        case 'mp3':
        case 'ogg':
        case 'wav':
            return `${ cls }file-audio-icon`;
        case 'avi':
        case 'mpeg':
        case 'mov':
        case 'ogv':
        case 'mp4':
            return `${ cls }file-video-icon`;
        }
        return `${ cls }file-document-icon`;
    },
    /**
     * @param {Object} fileInfo
     */
    updateFileInfo(fileInfo) {
        if (!fileInfo)
            return;
        const cls = this.getIconClsFromFileType(fileInfo.filetype), fileTypeIconEl = this.fileTypeIconEl, fileNameEl = this.fileNameEl;    // adds correct css class for file type
        // adds correct css class for file type
        if (fileTypeIconEl.oldCls)
            fileTypeIconEl.removeCls(fileTypeIconEl.oldCls);
        fileTypeIconEl.oldCls = cls;
        fileTypeIconEl.addCls(cls);
        fileNameEl.setHtml(fileInfo.fileName);
    }
});