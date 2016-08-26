/**
 * Defines block's bottom-bar for default and playlist block for course-editor
 * section's list.
 */
Ext.define('CJ.view.course.edit.section.block.BottomBar', {
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-edit-section-block-bottom-bar',
    /**
     * @property {Ext.XTemplate} tpl
     */
    tpl: Ext.create('Ext.XTemplate', '<div class="d-bottom-bar d-light-bottom-bar">', '<div class="d-html">', '<div class="d-button d-reuse-button" data-type="reuse"></div>', '<tpl if="canEdit">', '<div class="d-button d-edit-button" data-type="edit"></div>', '</tpl>', '<div class="d-button d-delete-button" data-type="delete"></div>', '</div>', '</div>'),
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.initialConfig = config;
        this.initBlock();
        this.renderTo();
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @return {undefined}
     */
    initBlock(block) {
        this.block = block || this.initialConfig.block;
    },
    /**
     * @param {HTMLElement|Ext.Element} element
     * @return {undefined}
     */
    renderTo(element undefined this.initialConfig.renderTo) {
        if (!element)
            return;
        element.innerHTML = this.tpl.apply({ canEdit: CJ.User.isMine(this.block) });
        this.element = element.querySelector('.d-bottom-bar');
    },
    /**
     * @param {Ext.dom.Event} e
     * @param {HTMLElement} button
     */
    onButtonTap(e, button) {
        const block = this.block;
        let type;
        let fn;
        if (block.getSaving())
            return;
        e.stopEvent();
        type = CJ.Utils.getNodeData(button, 'type');
        fn = CJ.tpl('on{0}ButtonTap', CJ.capitalize(type));
        if (this[fn])
            this[fn]();
    },
    /**
     * @return {undefined}
     */
    onReuseButtonTap() {
        const block = this.block;
        CJ.view.block[block.isPlaylist ? 'Assign' : 'Repost'].popup({ block });
    },
    /**
     * @return {undefined}
     */
    onEditButtonTap() {
        const block = this.block;
        if (block.isPlaylist)
            block.setState('review');
        else
            block.setEditing(true);
    },
    /**
     * @return {undefined}
     */
    onDeleteButtonTap() {
        CJ.CourseHelper.getOpenedEditor().deleteBlockFromCourse(this.block);
    },
    /**
     * removes an needed items in order to clean up used memory.
     * node: keep in mind, that this method doesn't remove HTMLElement.
     * @return {undefined}
     */
    destroy() {
        this.tpl.destroy();    // delete this.initialConfig;
                               // delete this.element;
                               // delete this.block;
                               // delete this.tpl;
    }
});