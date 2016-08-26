/**
 * Defines a component that adds paging functionality to section-list. 
 */
Ext.define('CJ.view.course.base.section.Paging', {
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Ext.Component} component
         */
        component: null,
        /**
         * @cfg {Number} lastScrollTop
         */
        lastScrollTop: null,
        /**
         * @cfg {Number} pageCount
         */
        pageCount: Ext.os.is.Desktop ? 20 : 12,
        /**
         * @cfg {Number} maxCount
         */
        maxCount: Ext.os.is.Desktop ? 60 : 36,
        /**
         * @cfg {Array} visibleSections
         */
        visibleSections: [],
        /**
         * @cfg {Number} visibleCount
         */
        visibleCount: 0,
        /**
         * @cfg {Boolean} isFirstPage
         */
        isFirstPage: true,
        /**
         * @cfg {Boolean} isLastPage
         */
        isLastPage: false,
        /**
         * @cfg {Boolean} scrolling
         */
        scrolling: null,
        /**
         * @cfg {Boolean} scrollRestored
         */
        scrollRestored: null,
        /**
         * @cfg {Number} columns
         */
        columns: null
    },
    constructor(config) {
        this.initConfig(config || {});
        this.callParent(args);
        this.renderInitialSections();
        this.getComponent().getScrollEl().onDom('scroll', this.onComponentScroll, this);    // can't attach resize-handler to a component, because ST creates
                                                                                            // x-size-monitors and x-paint-monitor elements in the component's 
                                                                                            // element node, which will cause to rerender the full list in each 
                                                                                            // frame instead of just repainting the scroll. And as list is only one
                                                                                            // item in Viewport's content, we can use this line.
        // can't attach resize-handler to a component, because ST creates
        // x-size-monitors and x-paint-monitor elements in the component's 
        // element node, which will cause to rerender the full list in each 
        // frame instead of just repainting the scroll. And as list is only one
        // item in Viewport's content, we can use this line.
        Ext.Viewport.content.on('resize', this.onComponentResize, this);
        fastdom.defer(fastdom.frames.length + 1, this.onComponentResize, this);
    },
    /**
     * detects how much columns will be rendered in the list and 
     * updates #listCols property.
     *
     * 358px * 2 + 3 = 2 columns
     * 358px * 3 + 4 = 3 columns
     * 358px * 4 + 5 = 4 columns
     * 358px * 5 + 6 = 5 columns
     * 358px * 6 + 7 = 6 columns
     */
    onComponentResize() {
        if (this.isDestroyed)
            return;
        const width = this.getComponent().element.getWidth();
        const blockWidth = 358;
        let count = 1;
        for (let i = 6; i > 1; i--) {
            if (width > blockWidth * i + 72) {
                // 72px is left/right padding.
                count = i;
                break;
            }
        }
        this.setColumns(count);
    },
    /**
     * @return {undefined}
     */
    renderInitialSections() {
        this.removeVisibleSections();
        this.setIsFirstPage(true);
        this.setIsLastPage(false);
        this.getComponent().getStore().next({
            count: this.getPageCount(),
            scope: this,
            success: this.showNextItems
        });
    },
    /**
     * @param {Boolean} state
     */
    updateIsFirstPage(state) {
        this.getComponent().displayStatics(state);
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     */
    updateComponent(newComponent, oldComponent) {
        if (newComponent) {
            newComponent.on('showsection', this.onShowSection, this);
            newComponent.element.on({
                touchstart: this.onComponentTouchStart,
                touchend: this.onComponentTouchEnd,
                scope: this
            });
        }
        if (oldComponent) {
            oldComponent.un('showsection', this.onShowSection, this);
            oldComponent.element.un({
                touchstart: this.onComponentTouchStart,
                touchend: this.onComponentTouchEnd,
                scope: this
            });
        }
    },
    /**
     * @param {Boolean} state
     * @return {undefined}
     */
    displayLoadBar(state) {
        if (state) {
            const component = this.getComponent(), popup = component.getEditor().getPopup();
            if (!CJ.LoadBar.rendered)
                CJ.LoadBar.run({
                    renderTo: popup.element,
                    maskedEl: component.element
                });
            Ext.Viewport.setPreventPanning(true);
        } else {
            CJ.LoadBar.finish();
            Ext.defer(() => {
                Ext.Viewport.setPreventPanning(false);
            }, 500);
        }
    },
    /**
     * @return {undefined}
     */
    onComponentScroll() {
        if (this.scrollTimerId)
            return;
        this.scrollTimerId = Ext.defer(function () {
            delete this.scrollTimerId;
            this.processScroll();
        }, 80, this);
    },
    /**
     * @return {undefined}
     */
    processScroll() {
        if (this.getScrollRestored())
            return this.setScrollRestored(false);
        if (Ext.os.is.iOS)
            this.processIOsScroll();
        else
            this.processDefaultScroll();
    },
    /**
     * @return {undefined}
     */
    processIOsScroll() {
        const component = this.getComponent();
        const scrollTop = component.getScrollTop();
        const maxScrollTop = component.getMaxScrollTop();
        const percentage = this.calcScrollPercentage(scrollTop, maxScrollTop);
        let method;
        this.setLastScrollTop(scrollTop);
        if (percentage > 75 && scrollTop > maxScrollTop - 1000 && !this.getIsLastPage())
            method = 'loadNextItems';
        else if (percentage < 25 && scrollTop < 1000 && !this.getIsFirstPage())
            method = 'loadPreviousItems';
        if (!method)
            return;
        this.displayLoadBar(true);
        this.onScrollStop(function () {
            this.onAfterScrollStop(method);
        }, this);
    },
    /**
     * @param {String} method
     */
    onAfterScrollStop(method) {
        if (this.touchStarted)
            return Ext.defer(this.onAfterScrollStop, 100, this, [method]);
        if (!this.isDestroyed)
            this[method]();
        this.displayLoadBar(false);
    },
    /**
     * executes callback when browser stops scrolling.
     * @param {Function} callback
     * @param {Object} scope
     * @return {undefined}
     */
    onScrollStop(callback, scope) {
        clearTimeout(this.scrollStopTimerId);
        this.scrollStopTimerId = Ext.defer(function () {
            const component = this.getComponent(), scrollTop = component.getScrollTop(), lastScrollTop = this.getLastScrollTop();
            if (scrollTop != lastScrollTop) {
                this.setLastScrollTop(scrollTop);
                this.onScrollStop(callback, scope);
            } else {
                Ext.callback(callback, scope);
            }
        }, 250, this);
    },
    /**
     * @return {undefined}
     */
    processDefaultScroll() {
        const component = this.getComponent(), scrollTop = component.getScrollTop(), maxScrollTop = component.getMaxScrollTop(), percentage = this.calcScrollPercentage(scrollTop, maxScrollTop);
        if (maxScrollTop - scrollTop < 1000 && percentage > 75)
            return this.loadNextItems();
        if (scrollTop < 1000 && percentage < 25)
            return this.loadPreviousItems();
    },
    /**
     * @return {undefined}
     */
    onComponentTouchStart() {
        delete this.touchStarted;
    },
    /**
     * @return {undefined}
     */
    onComponentTouchEnd() {
        delete this.touchStarted;
    },
    /**
     * @return {Boolean} true in case when we need to remove previous items.
     */
    canRemovePreviousItems() {
        return this.getVisibleCount() > this.getMaxCount();
    },
    /**
     * @param {Ext.Component} section
     * @return {undefined}
     */
    removeVisibleSection(section) {
        Ext.Array.remove(this.getVisibleSections(), section);
        section.destroy();
    },
    /**
     * @param {Ext.Component} section
     * @param {Number} count
     * @return {undefined}
     */
    removeVisibleSectionBlocks(section, count) {
        const blocks = section.getItems();
        const oldBlocksCount = blocks.length + section.getIntegrityBlocks().length;
        const newBlocksCount = blocks.length - count;
        const columns = this.getColumns();
        let integrity = (oldBlocksCount - newBlocksCount) % columns;
        if (integrity < 0)
            integrity = columns + integrity;
        section.removeIntegrityBlocks();
        section.renderIntegrityBlocks(integrity);
        while (count-- > 0)
            blocks.shift().destroy();
    },
    /**
     * @return {undefined}
     */
    removePreviousItems() {
        if (!this.canRemovePreviousItems())
            return;
        const pageCount = this.getPageCount();
        const sections = this.getVisibleSections();
        const columns = this.getColumns();
        let counter = pageCount;
        let blocksCount;
        this.saveScroll();
        this.setIsFirstPage(false);
        for (let i = 0, section; section = sections[i]; i++) {
            // removed all needed items.
            if (counter == 0)
                break;
            blocksCount = section.getItems().length;
            if (blocksCount > counter) {
                this.removeVisibleSectionBlocks(section, counter);
                break;
            }    // remove the whole section.
            // remove the whole section.
            counter -= blocksCount;
            this.removeVisibleSection(section);
            i--;
        }
        this.setVisibleCount(this.getVisibleCount() - pageCount);
        this.restoreScroll();
    },
    /**
     * @return {undefined}
     */
    removeNextItems() {
        const visibleCount = this.getVisibleCount(), maxCount = this.getMaxCount();
        if (visibleCount <= maxCount)
            return;
        const pageCount = this.getPageCount();
        const sections = this.getVisibleSections();
        let redundant = visibleCount - maxCount;
        this.setIsLastPage(false);
        for (let i = sections.length - 1, section; section = sections[i]; i--) {
            // removed all needed items.
            if (redundant == 0)
                break;
            const blocks = section.getItems(), blocksCount = blocks.length;
            if (blocksCount <= redundant) {
                redundant -= blocksCount;    // remove the whole section.
                // remove the whole section.
                section.destroy();
                sections.splice(i, 1);
            } else {
                // remove lastest blocks from this section.
                for (let j = blocksCount - 1; j >= 0; j--) {
                    redundant--;
                    blocks[j].destroy();
                    blocks.splice(j, 1);
                    if (redundant == 0)
                        break;
                }
            }
        }
        this.setVisibleCount(maxCount);
    },
    /**
     * saves current scroll position of y-axis
     * @return {undefined}
     */
    saveScroll() {
        const nodes = this.getComponent().element.query('.d-section'), node = nodes[nodes.length - 1];
        this.scrollState = {
            node,
            region: node.getBoundingClientRect()
        };
    },
    /**
     * saves current scroll position of y-axis
     * @return {undefined}
     */
    restoreScroll() {
        const state = this.scrollState, node = state.node, oldRegion = state.region, newRegion = node.getBoundingClientRect();
        this.setScrollRestored(false);
        this.getComponent().scrollTop(newRegion.bottom - oldRegion.bottom, true);
    },
    /**
     * @return {undefined}
     */
    onShowSection(sectionId) {
        this.setIsFirstPage(false);
        this.setIsLastPage(false);
        this.setVisibleCount(0);
        this.removeVisibleSections();
        this.getComponent().getStore().middle(sectionId, {
            scope: this,
            success: this.showBlocksInMiddle,
            count: this.getMaxCount(),
            pageCount: this.getPageCount()
        });
    },
    /**
     * @param {Array} blocks
     * @param {Number} sectionId
     */
    showBlocksInMiddle(blocks, sectionId) {
        if (blocks.length == 0)
            return;
        const renderTree = document.createDocumentFragment();
        const columns = this.getColumns();
        const sections = this.groupBlocks(blocks);
        const visibleSections = this.getVisibleSections();
        let maintainIntegrity = true;
        for (let i = 0, section; section = sections[i]; i++) {
            if (section.id == sectionId)
                maintainIntegrity = false;
            const item = this.createSection(section.id);
            item.appendBlocks(section.blocks);
            item.renderTo(renderTree);
            if (maintainIntegrity)
                item.maintainIntegrity(columns);
            visibleSections.push(item);
        }
        this.setVisibleCount(blocks.length);
        this.getComponent().innerElement.appendChild(renderTree);
        const el = this.getComponent().getSectionNodeById(sectionId);
        CJ.Utils.scrollIntoViewWithinParent(el);
    },
    /**
     * @param {Number} scrollTop
     * @param {Number} maxScrollTop
     */
    calcScrollPercentage(scrollTop, maxScrollTop) {
        return scrollTop / maxScrollTop * 100;
    },
    /**
     * appends new sections to the list or/and blocks to the section.   
     * @return {undefined}
     */
    loadPreviousItems() {
        if (this.getIsFirstPage())
            return;
        const sections = this.getVisibleSections();
        let refId = null;
        if (sections.length > 0)
            refId = sections[0].getFirstBlockId();
        this.getComponent().getStore().prev({
            refId,
            count: this.getPageCount(),
            scope: this,
            success: this.onLoadPreviousItemsSuccess
        });
    },
    /**
     * @return {undefined}
     */
    fillEmptySpace() {
        const maxCount = this.getMaxCount(), visibleCount = this.getVisibleCount(), diff = maxCount - visibleCount;
        if (diff == 0)
            return;
        const sections = this.getVisibleSections();
        let refId = null;
        if (sections.length > 0)
            refId = sections[sections.length - 1].getLastBlockId();
        this.getComponent().getStore().next({
            refId,
            count: diff,
            scope: this,
            success: this.showNextItems
        });
    },
    /**
     * appends new sections to the list or/and blocks to the section.   
     * @return {undefined}
     */
    loadNextItems() {
        if (this.getIsLastPage())
            return;
        const sections = this.getVisibleSections();
        let refId = null;
        if (sections.length > 0)
            refId = sections[sections.length - 1].getLastBlockId();
        this.getComponent().getStore().next({
            refId,
            count: this.getPageCount(),
            scope: this,
            success: this.onLoadNextItemsSuccess
        });
    },
    /**
     * @param {Number} id
     * @return {Object}
     */
    createSection(id) {
        return this.getComponent().createSection(id);
    },
    /**
     * @param {Array} blocks
     * @return {undefined}
     */
    onLoadPreviousItemsSuccess(blocks) {
        this.saveScroll();
        if (blocks.length < this.getPageCount())
            this.setIsFirstPage(true);
        if (blocks.length > 0)
            return this.showPreviousItems(blocks);
        this.restoreScroll();
    },
    /**
     * @return {Number}
     */
    getFirstSection() {
        const sections = this.getVisibleSections();
        if (sections.length > 0)
            return sections[0];
        return null;
    },
    /**
     * @param {Ext.Component} section
     * @param {Array} blocks
     * @return {undefined}
     */
    appendBlocksToFirstSection(section, blocks) {
        const items = section.getItems();
        const oldBlocksCount = items.length + section.getIntegrityBlocks().length;
        const newBlocksCount = items.length + blocks.length;
        const columns = this.getColumns();
        let integrity = (oldBlocksCount - newBlocksCount) % columns;
        if (integrity < 0)
            integrity = columns + integrity;
        section.removeIntegrityBlocks();
        section.prependBlocks(blocks);
        section.renderIntegrityBlocks(integrity);
    },
    /**
     * @param {Array} blocks
     * @return {undefined}
     */
    showPreviousItems(blocks) {
        if (blocks.length == 0)
            return;
        const renderTree = document.createDocumentFragment(), visibleSections = this.getVisibleSections(), sections = this.groupBlocks(blocks), firstSection = visibleSections[0], firstSectionId = firstSection && firstSection.getDocId(), columns = this.getColumns();
        for (let i = 0, section; section = sections[i]; i++) {
            if (section.id == firstSectionId) {
                this.appendBlocksToFirstSection(firstSection, section.blocks);
            } else {
                const item = this.createSection(section.id);
                item.renderTo(renderTree);
                item.appendBlocks(section.blocks);
                item.maintainIntegrity(columns);
                visibleSections.splice(i, 0, item);
            }
        }
        this.setVisibleCount(this.getVisibleCount() + blocks.length);
        this.getComponent().innerElement.insertFirst(renderTree);
        this.restoreScroll();
        this.removeNextItems();
    },
    /**
     * @param {Array} blocks
     * @return {undefined}
     */
    onLoadNextItemsSuccess(blocks) {
        if (blocks.length != this.getPageCount())
            this.setIsLastPage(true);
        this.showNextItems(blocks);
    },
    /**
     * @param {Array} blocks
     * @return {Array}
     */
    groupBlocks(blocks) {
        const sections = {}, result = [];
        for (let i = 0, block; block = blocks[i]; i++) {
            if (!sections[block.sectionId]) {
                sections[block.sectionId] = [];
                result.push({
                    id: block.sectionId,
                    blocks: sections[block.sectionId]
                });
            }
            sections[block.sectionId].push(block);
        }
        return result;
    },
    /**
     * @param {Array} blocks
     * @return {undefined}
     */
    showNextItems(blocks) {
        if (blocks.length == 0)
            return;
        this.setVisibleCount(this.getVisibleCount() + blocks.length);
        this.removePreviousItems();
        const renderTree = document.createDocumentFragment(), visibleSections = this.getVisibleSections(), sections = this.groupBlocks(blocks), lastSection = visibleSections[visibleSections.length - 1], lastSectionId = lastSection && lastSection.getDocId();
        for (let i = 0, section; section = sections[i]; i++) {
            if (section.id == lastSectionId) {
                lastSection.appendBlocks(section.blocks);
            } else {
                const item = this.createSection(section.id);
                item.renderTo(renderTree);
                item.appendBlocks(section.blocks);
                visibleSections.push(item);
            }
        }
        this.getComponent().innerElement.appendChild(renderTree);
    },
    /**
     * @return {Object}
     */
    getLastVisibleSection() {
        const sections = this.getVisibleSections();
        return sections[sections.length - 1];
    },
    /**
     * @return {undefined}
     */
    removeVisibleSections() {
        const sections = this.getVisibleSections();
        let section;
        while (section = sections.pop())
            section.destroy();
    },
    /**
     * @return {undefined}
     */
    incVisibleCount() {
        this.setVisibleCount(this.getVisibleCount() + 1);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.removeVisibleSections();
        this.setComponent(null);
        this.callParent(args);
    }
});