import 'Ext/Component';

Ext.define('CJ.view.course.edit.section.list.BlockCreator', {
    /**
	 * @property {String} extend
	 */
    extend: 'Ext.Component',
    /**
	 * @property {String} alias
	 */
    alias: 'widget.view-course-edit-section-list-block-creator',
    /**
	 * @property {Object} config
	 */
    config: {
        /**
		 * @cfg {String} cls
		 */
        cls: 'd-block-creator',
        /**
		 * @cfg {Number} docId
		 */
        docId: null
    },
    /**
	 * @param {Object} config
	 */
    constructor(config) {
        this.callParent(args);
        this.element.setHtml([
            '<div class="d-content">',
            '<div class="d-icon"></div>',
            '<div class="d-title">',
            CJ.t('view-course-edit-section-list-list-add-new-block'),
            '</div>',
            '</div>'
        ].join(''));
    }
});