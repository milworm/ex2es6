import 'Ext/Component';

/**
 * Base class that contains common logic for Playlist, Map and Course Scoreboards.
 * Data format:
 *
 items: [{
    user: "@user1",
    date: "",
    total: 92,
    sections: [{
        id: 1,
        total: 50,
        answers: [{
            id: 1,
            correct: true
        }, {
            id: 2,
            correct: false
        }]
    }, {
        id: 2,
        total: 100,
        answers: [{
            id: 1,
            correct: true
        }, {
            id: 2,
            correct: true
        }]
    }]
}]
 */
Ext.define('CJ.component.Scoreboard', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.component-scoreboard',
    /**
     * @property {Object} property
     */
    inheritableStatics: {
        /**
         * @property {Number} PAGE_SIZE
         */
        PAGE_SIZE: 40,
        /**
         * loads and shows scoreboard popup.
         * @param {Object} config
         * @param {CJ.view.block.BaseBlock} config.block
         */
        popup(config) {
            const xtype = this.xtype, block = config.block;
            CJ.LoadBar.run();
            this.load(block.getDocId(), {
                success(response) {
                    Ext.factory({
                        xtype: 'core-view-popup',
                        cls: 'd-popup-transparent',
                        titleBar: false,
                        fitMode: true,
                        isHistoryMemeber: true,
                        isUrlLessHistoryMemeber: true,
                        content: {
                            xtype,
                            block,
                            items: response.ret.items,
                            paging: response.ret.paging
                        }
                    });
                },
                callback() {
                    CJ.LoadBar.finish();
                }
            });
        }
    },
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * must be overrided in subclass.
         * @param {Number} id
         * @param {Object} config
         * @return {undefined}
         */
        load: Ext.emptFn
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-scoreboard',
        /**
         * @cfg {Boolean} loading
         */
        loading: null,
        /**
         * @cfg {CJ.view.block.BaseBlock} block
         */
        block: null,
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null,
        /**
         * @cfg {Object} paging
         */
        paging: null,
        /**
         * @cfg {Array} items
         */
        items: null,
        /**
         * @cfg {Ext.Component} filterButton
         */
        filterButton: {},
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: null,
        /**
         * @cfg {Ext.XTemplate} pageTpl
         */
        pageTpl: null,
        /**
         * @cfg {String} userCellTpl
         */
        userCellTpl: [
            '<div class=\'d-cell d-user-cell\'>',
            '<div class=\'d-name\'>{0}</div>',
            '<div class=\'d-date\'>{1}</div>',
            '</div>'
        ].join(''),
        /**
         * @cfg {String} totalCellTpl
         */
        totalCellTpl: '<div class=\'d-cell d-total-cell\'>{0}</div>',
        /**
         * @cfg {String} sectionCellTpl
         */
        sectionCellTpl: '<div class=\'d-cell d-section-cell\'>{0}</div>',
        /**
         * @cfg {String} sectionAnswerCellTpl
         */
        answerCellTpl: Ext.create('Ext.XTemplate', '<tpl if=\'values.isPlaylist\'>', '<div class=\'d-cell d-answer-cell d-playlist-answer-cell\' data-activity-id=\'{activityId}\'>', '{correct}/{total}', '</div>', '<tpl else>', '<tpl if=\'values.isAnswered\'>', '<tpl if=\'values.isCorrectable\'>', '<div class=\'d-cell d-answer-cell d-correctness-{isCorrect} {solutionCls}\' data-activity-id=\'{activityId}\' data-answer-id=\'{answerId}\'></div>', '<tpl else>', '<div class=\'d-cell d-answer-cell d-correctness-unknown {solutionCls}\' data-activity-id=\'{activityId}\' data-answer-id=\'{answerId}\'></div>', '</tpl>', '<tpl else>', '<div class=\'d-cell d-answer-cell d-correctness-none {solutionCls}\' data-activity-id=\'{activityId}\'></div>', '</tpl>', '</tpl>'),
        /**
         * @cfg {String} emptyCellTpl
         */
        emptyCellTpl: '<div></div>',
        /**
         * @cfg {Object} data
         */
        data: null
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
        CJ.on('popuphide', this.reloadOnPopupHide, this);
    },
    /**
     * @param {CJ.core.view.Popup} popup
     * @return {undefined}
     */
    reloadOnPopupHide(popup) {
        if (this.getPopup() == popup)
            return;
        if (popup.isAnswersFilterPopup)
            return;
        const paging = this.getPaging(), groupId = this.getFilteredGroupId(), params = {
                offset: 0,
                limit: paging.offset + paging.limit
            };
        if (groupId)
            params.groupId = groupId;
        this.reload(params);
    },
    getFilteredGroupId() {
        const button = this.getFilterButton(), key = button && button.getKey();
        if (!key)
            return null;
        return key.get('docId');
    },
    /**
     * @return {undefined}
     */
    reload(params) {
        CJ.LoadBar.run();
        this.self.load(this.getBlock().getDocId(), {
            scope: this,
            params,
            success: this.onReloadSuccess,
            callback: this.onReloadCallback
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onReloadSuccess(response, request) {
        const params = request.initialConfig.params, nodes = this.element.dom.querySelectorAll('.d-items');
        this.setPaging({
            limit: params.limit,
            offset: params.offset
        });
        Ext.each(nodes, node => {
            node.innerHTML = '';
            node.scrollTop = 0;
        });
        this.onLoadMoreSuccess(response);
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onReloadCallback() {
        CJ.LoadBar.finish();
    },
    /**
     * @param {HTMLElement} node
     * @param {Number} scrollTop
     */
    onScroll(node, scrollTop) {
        if (this.lastPage)
            return;
        if (this.getLoading())
            return;    // if(this.getPaging().count == 0)
                       //     return ;
        // if(this.getPaging().count == 0)
        //     return ;
        const maxScrollTop = node.scrollHeight - node.clientHeight, percentage = scrollTop / maxScrollTop * 100;
        if (percentage > 70 && maxScrollTop - scrollTop < 1000)
            return this.loadMore();
    },
    /**
     * @return {undefined}
     */
    loadMore() {
        const paging = this.getPaging(), limit = paging.limit, offset = paging.offset + limit, groupId = this.getFilteredGroupId(), params = {
                offset,
                limit
            };
        if (groupId)
            params.groupId = groupId;
        this.setLoading(true);
        this.setPaging(params);
        this.self.load(this.getBlock().getDocId(), {
            params,
            scope: this,
            success: this.onLoadMoreSuccess,
            callback() {
                this.setLoading(false);
            }
        });
    },
    /**
     * @param {Object} response
     * @param {Array} response.ret
     * @return {undefined}
     */
    onLoadMoreSuccess(response) {
        this.setLoading(false);
        const response = response.ret;
        const items = response.items;
        const paging = response.paging;
        let template;
        let html;
        if (paging.count == 0)
            return this.onLastPageLoad();
        html = this.getPageTpl().apply({
            items,
            content: this.renderPage(items)
        });
        if (CJ.Utils.supportsTemplate()) {
            template = document.createElement('template');
            template.innerHTML = html;
            template = template.content;
        } else {
            template = document.createElement('div');
            template.innerHTML = html;
        }
        const columns = this.element.dom.querySelectorAll('.d-items'), newColumns = template.querySelectorAll('.d-items');
        Ext.each(columns, (node, index) => {
            node.innerHTML += newColumns[index].innerHTML;
        });
    },
    onLastPageLoad() {
        this.lastPage = true;
    },
    onLoadMoreFailure() {
        this.setLoading(false);
    },
    /**
     * @param {Boolean} state
     */
    updateLoading(state) {
        CJ.LoadBar[state ? 'run' : 'finish']();
    },
    /**
     * @param {Ext.Evented}
     */
    onElementTap(e) {
        if (e.getTarget('.d-close-button', 1))
            this.onCloseButtonTap(e);
        else if (e.getTarget('.d-answer-cell'))
            this.onAnswerCellTap(e);
        else if (e.getTarget('.d-answer-header-cell'))
            this.onAnswerHeaderCellTap(e);
        else if (e.getTarget('.d-section-header-cell', 5))
            this.onSectionHeaderTap(e);
        else if (e.getTarget('.d-section-cell', 5))
            this.onSectionCellTap(e);
    },
    /**
     * @return {undefined}
     */
    onCloseButtonTap() {
        this.getPopup().close();
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onSectionHeaderTap(e) {
        const cell = e.getTarget('.d-section-header-cell', 5), index = CJ.getNodeData(cell, 'index');
        this.displaySectionAnswers(index);
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onSectionCellTap(e) {
        const column = e.getTarget('.d-section-column', 5), index = CJ.getNodeData(column, 'index');
        this.displaySectionAnswers(index);
    },
    /**
     * @param {Number} sectionIndex
     * @return {undefined}
     */
    displaySectionAnswers(sectionIndex) {
        const header = this.getSectionHeaderNode(sectionIndex), column = this.getSectionColumnNode(sectionIndex), cls = 'd-expanded';
        if (header.classList.contains(cls)) {
            header.classList.remove(cls);
            column.classList.remove(cls);
        } else {
            header.classList.add(cls);
            column.classList.add(cls);
        }
    },
    /**
     * @param {Number} index
     * @return {HTMLElement}
     */
    getSectionColumnNode(index) {
        const selector = CJ.tpl('.d-section-column[data-index=\'{0}\']', index);
        return this.element.dom.querySelector(selector);
    },
    /**
     * @param {Number} index
     * @return {HTMLElement}
     */
    getSectionHeaderNode(index) {
        const selector = CJ.tpl('.d-section-header-cell[data-index=\'{0}\']', index);
        return this.element.dom.querySelector(selector);
    },
    /**
     * @param {Ext.Evented} e
     */
    onAnswerCellTap(e) {
        const cell = e.getTarget('.d-answer-cell'), activityId = CJ.getNodeData(cell, 'activityId'), answerId = CJ.getNodeData(cell, 'answerId');
        if (cell.classList.contains('d-playlist-answer-cell'))
            return CJ.Playlist.scoreboard(activityId);
        if (cell.classList.contains('d-correctness-none'))
            return;    // no answer, so nothing to be shown.
        // no answer, so nothing to be shown.
        CJ.History.keepPopups = true;
        CJ.app.redirectTo(CJ.tpl('!an/{0}', answerId));
    },
    /**
     * @param {Ext.Evented} e
     */
    onAnswerHeaderCellTap(e) {
        const target = e.getTarget('.d-answer-header-cell'), blockId = CJ.getNodeData(target, 'activityId');
        if (target.classList.contains('d-playlist-answer-header-cell'))
            return CJ.Playlist.scoreboard(blockId);
        CJ.app.redirectTo(CJ.tpl('!m/{0}/a', blockId), true);
        CJ.Block.popup({
            blockId,
            state: 'answers'
        });
    },
    /**
     * @param {Array} items
     */
    updateItems(items) {
        this.setData({
            title: this.getBlock().getTitle(),
            content: this.renderPage(items),
            items
        });
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
        this.userColumnScroller = this.element.down('.d-user-column .d-column-content');
        this.answerColumnScroller = this.element.down('.d-answer-column .d-column-content');
        this.userColumnScroller.on('scroll', this.onUserColumnScroll, this);
        this.answerColumnScroller.on('scroll', this.onAnswerColumnScroll, this);
    },
    /**
     * @return {undefined}
     */
    onUserColumnScroll() {
        if (this.userColumnScroller.dom.skipEvent)
            return this.userColumnScroller.dom.skipEvent = false;
        if (this.userColumnScrollRafId)
            return;
        this.userColumnScrollRafId = fastdom.write(function () {
            delete this.userColumnScrollRafId;
            const scrollTop = this.userColumnScroller.dom.scrollTop;
            this.answerColumnScroller.dom.skipEvent = true;
            this.answerColumnScroller.dom.scrollTop = scrollTop;
            this.onScroll(this.userColumnScroller.dom, scrollTop);
        }, this);
    },
    /**
     * @return {undefined}
     */
    onAnswerColumnScroll() {
        if (this.answerColumnScroller.dom.skipEvent)
            return this.answerColumnScroller.dom.skipEvent = false;
        if (this.answerColumnScrollRafId)
            return;
        this.answerColumnScrollRafId = fastdom.write(function () {
            delete this.answerColumnScrollRafId;
            const scrollTop = this.answerColumnScroller.dom.scrollTop;
            this.userColumnScroller.dom.skipEvent = true;
            this.userColumnScroller.dom.scrollTop = scrollTop;
            this.onScroll(this.answerColumnScroller.dom, scrollTop);
        }, this);
    },
    /**
     * @cfg {Object} config
     */
    applyFilterButton(config) {
        this.getItems();
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'view-answers-filter-button',
            defaultText: 'view-playlist-gradetable-filter-default-text',
            renderTo: this.element.dom.querySelector('.d-group-filter-container'),
            listeners: {
                scope: this,
                filterselected: this.onFilterSelected
            }
        }, config));
    },
    /**
     * @param {Ext.Component} newButton
     * @param {Ext.Component} oldButton
     */
    updateFilterButton(newButton, oldButton) {
        if (oldButton)
            oldButton.destroy();
    },
    /**
     * @param {Ext.Component} component
     * @param {Ext.data.Model} key Could be null when user selects all-answers.
     * @return {undefined}
     */
    onFilterSelected(component, key) {
        const params = {
            offset: 0,
            limit: this.self.PAGE_SIZE
        };
        if (key)
            params.groupId = key.get('docId');
        this.reload(params);
    },
    /**
     * @param {Object} answer
     * @return {Object} data that will be used to render a template.
     */
    getAnswerTplData(answer, isPlaylist) {
        return {
            isPlaylist,
            isCorrectable: Ext.isBoolean(answer.isCorrect),
            isAnswered: !!answer.answerId,
            isCorrect: answer.isCorrect,
            correct: answer.complete,
            total: answer.total,
            activityId: answer.activityId,
            answerId: answer.answerId,
            solutionCls: answer.solutionId ? 'd-has-solution' : ''
        };
    },
    /**
     * @param {Array} items
     */
    renderPage: Ext.emptyFn,
    /**
     * @return {undefined}
     */
    destroy() {
        CJ.un('popuphide', this.reloadOnPopupHide, this);
        this.userColumnScroller.destroy();
        this.answerColumnScroller.destroy();
        this.callParent(args);
    }
});