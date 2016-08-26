import 'app/core/view/list/Base';
import 'app/view/answers/Pending';
import 'app/view/answers/Private';
import 'app/view/answers/filter/Button';
import 'app/view/block/AnswerBlock';

/**
 * Defines a list to show answer blocks. It is always used as sub-list of
 * CJ.view.block.List. 
 *
 * Loading process:
 * The idea is to load initial answers in conjuction with block's data by making 
 * one batch-request and all other requests are non-batch/simple calls.
 */
Ext.define('CJ.view.answers.List', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.list.Base',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-answers-answers-list',
    /**
     * @property {Boolean} isAnswerList
     */
    isAnswerList: true,
    inheritableStatics: {
        /**
         * performs initial load-answers request using params from current route
         * @param {Number} blockId
         * @param {Object} config
         * @param {Number} config.groupId
         * @param {Function} config.success
         * @param {Object} config.scope
         */
        initialLoad(blockId, config undefined {}) {
            const answerId = CJ.app.getRouteParam('answerId');
            let refMode = 'after';
            let refId = null;
            const groupId = config.groupId || null;
            if (answerId) {
                refMode = 'midpoint';
                refId = answerId;
            }
            const success = config.success || Ext.emptyFn, scope = config.scope;
            Ext.apply(config, {
                success(response, request) {
                    // allows to get request-information
                    response.ret.request = request;
                    Ext.callback(success, scope, arguments);
                }
            });
            this.load(Ext.apply({
                params: {
                    id: blockId,
                    refId,
                    refMode,
                    groupId,
                    limit: 20    // page size
                }
            }, config));
        },
        /**
         * @param {Object} config
         * @param {Object} config.params
         * @param {Object} config.scope
         * @param {Object} config.stash
         * @param {Function} config.success
         */
        load(config) {
            CJ.request(Ext.apply({
                method: 'GET',
                rpc: {
                    model: 'Document',
                    method: 'load_answers'
                }
            }, config));
        }
    },
    config: {
        /**
         * @cfg {Ext.Element} filterRenderTo
         */
        filterRenderTo: null,
        /**
         * @cfg {CJ.view.block.BaseBlock} block Reference to question's block.
         */
        block: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-list d-answer-list',
        /**
         * @cfg {Object} scrollable Always false as answers are always rendered
         *                          inner list.
         */
        scrollable: null,
        /**
         * @cfg {CJ.view.answers.filter.Button} filter
         */
        filter: null,
        /**
         * @cfg {Object} answers
         * @cfg {Array} answers.items
         * @cfg {Array} answers.order
         */
        answers: null,
        /**
         * @cfg {Array} plugins
         */
        plugins: [{
                xclass: 'CJ.core.plugins.ListScrollLoader',
                pageSize: 20
            }]
    },
    /**
     * @param {CJ.view.block.BaseBlock} newBlock
     * @param {CJ.view.block.BaseBlock} oldBlock
     */
    updateBlock(newBlock, oldBlock) {
        if (!newBlock)
            return;
        newBlock.on({
            scope: this,
            answersubmit: this.onAnswerSubmit,
            answerdelete: this.onAnswerDelete,
            reloadanswers: this.onReloadAnswers
        });
    },
    /**
     * @return {undefined}
     */
    onAnswerSubmit() {
        this.reload();
    },
    /**
     * @param {CJ.view.question.Question} question
     * @param {Number} count
     * @param {Number} answerId
     * @return {undefined}
     */
    onAnswerDelete(question, count, answerId) {
        if (!this.getBlock().getIsModal())
            return this.reload();
        const el = this.getItemNodeByDocId(answerId);    // If el exists, it means that it had been removed from a answer 
                                                         // fullscreen popup, and it's only case when we need to show animation.
        // If el exists, it means that it had been removed from a answer 
        // fullscreen popup, and it's only case when we need to show animation.
        if (!el) {
            if (this.getCount() == 0)
                this.reload();
            return;
        }
        el.setStyle('height', `${ el.getHeight() }px`);
        CJ.Animation.animate({
            el,
            scope: this,
            maxDelay: 1600,
            cls: 'deleting',
            after() {
                if (this.isDestroyed)
                    return;
                this.removeListItemByDocId(answerId);
                if (this.getCount() == 0)
                    this.reload();
            }
        });
    },
    /**
     * @return {undefined}
     */
    onReloadAnswers() {
        this.reload();
    },
    /**
     * @param {Object} answers
     */
    updateAnswers(answers) {
        this.getPlugins();
        this.setLastRequest(answers.request);
        this.setLastResponse({ ret: answers });
        this.renderItems(answers.items);
    },
    /**
     * @param {Object} response
     * @param {Object} response.ret
     * @param {Array} response.ret.items
     * @return {undefined}
     */
    updateLastResponse(response) {
        const isFiltered = this.isFilteredByKey(), items = response.ret.items;
        for (let i = 0; i < items.length; i++) {
            const answer = items[i];
            switch (answer.xtype) {
            case CJ.view.answers.confirm.Answer.xtype:
                items[i] = this.getConfirmAnswerConfig.call(this, answer);
                break;
            case CJ.view.answers.Pending.xtype:
                items[i] = answer;
                break;
            default:
                items[i] = this.getDefaultAnswerConfig.call(this, answer);
            }
        }
    },
    /**
     * @param {Object} filter
     */
    applyFilter(filter) {
        if (!filter)
            return false;
        if (filter == true)
            filter = {};
        if (filter.isComponent) {
            filter.on('filterselected', this.onFilterSelected, this);
            return filter;
        }
        return Ext.factory(Ext.apply({
            xtype: 'view-answers-filter-button',
            renderTo: this.getFilterRenderTo() || this.filterElement,
            listeners: {
                scope: this,
                filterselected: this.onFilterSelected
            }
        }, filter));
    },
    /**
     * @param {Ext.Component} newFilter
     * @param {Ext.Component} oldFilter
     */
    updateFilter(newFilter, oldFilter) {
        if (oldFilter)
            oldFilter.destroy();
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
                { reference: 'filterElement' },
                {
                    reference: 'innerElement',
                    className: 'x-inner'
                }
            ]
        };
    },
    /**
     * @param {Ext.Button} filterButton
     * @param {Ext.Model} key
     */
    onFilterSelected(filterButton, key) {
        const lastRequest = this.getLastRequest(), params = lastRequest.initialConfig.params, keyId = key && key.get('docId');
        this.reload({
            params: {
                limit: params.limit,
                id: params.id,
                groupId: keyId
            }
        });
    },
    /**
     * completely reloads the list
     * @param {Object} config
     * @return {undefined}
     */
    reload(config undefined {}) {
        Ext.applyIf(config, { params: this.getLastRequest().initialConfig.params });
        this.setIsLoading(true);
        this.self.load(Ext.apply(config, {
            scope: this,
            success(response, request) {
                response.ret.request = request;
                this.setAnswers(response.ret);
            },
            callback() {
                this.setIsLoading(false);
            }
        }));
    },
    /**
     * @param {Array} items
     */
    renderItems(items) {
        items = Ext.Array.clone(items);    // doing cleaup here, because in case when cleaup is done
                                           // before loading items, browser will scroll to the top.
        // doing cleaup here, because in case when cleaup is done
        // before loading items, browser will scroll to the top.
        this.cleanup();
        let filter = {};
        const canSeeAnswers = CJ.User.canSeeAnswers(this.getBlock());
        if (!canSeeAnswers)
            filter = {
                cls: 'd-filter-button',
                xtype: 'view-answers-private'
            };
        if (!this.getFilter())
            this.setFilter(filter);
        if (items.length > 0) {
            this.element.removeCls('d-empty-list');
        } else {
            this.element.addCls('d-empty-list');
            if (canSeeAnswers)
                items.unshift({
                    xtype: 'core-view-component',
                    type: 'light',
                    cls: 'd-empty-text',
                    html: CJ.app.t('view-answers-list-empty')
                });
        }
        this.callParent(args);
    },
    /**
     * @param {Object} answer
     * @param {Object} answerType
     * @param {Object} question
     * @return {Object}
     */
    getConfirmAnswerConfig(answer, answerType, question) {
        // @TODO when server is ready, this method will be not needed.
        return {
            xtype: 'view-block-answer-block',
            docId: answer.docId,
            createdDate: answer.createdDate,
            userInfo: answer.userInfo,
            bottomBar: false,
            question: answer.question,
            activityId: answer.activityId,
            cls: 'd-block d-answer-block d-confirm-answer-block'
        };
    },
    /**
     * @param {Object} answer
     * @return {Object}
     */
    getDefaultAnswerConfig(answer) {
        const question = answer.question, answerType = question.answerType;
        return {
            xtype: 'view-block-answer-block',
            docId: answer.docId,
            createdDate: answer.createdDate,
            userInfo: answer.userInfo,
            comments: answer.comments,
            activityId: answer.activityId,
            isCorrect: answer.isCorrect,
            isAutoCheckEnabled: question.options.autoCheck,
            question,
            solution: answer.solution,
            answer: {
                settings: answerType.settings,
                showValue: true,
                showResult: false,
                value: answer.value,
                xtype: answerType.xtype
            }
        };
    },
    /**
     * @return {Boolean} true in case when list had been filtered using "key" 
     *                   property.
     */
    isFilteredByKey() {
        const filter = this.getFilter();
        if (filter && filter.isFilterButton)
            return filter.getKey();
        return false;
    },
    /**
     * @param {Number} id
     * @return {Ext.Element}
     */
    getItemNodeByDocId(id) {
        const item = this.down(CJ.tpl('[docId={0}]', id));
        if (item)
            return item.element;
        return null;
    },
    /**
     * @return {Ext.Component}
     */
    getFirstItem() {
        return this.down('[isAnswerBlock]');
    },
    /**
     * @param {Object} config
     * @param {Function} config.success
     * @param {Object} config.scope
     */
    loadNextItems(config undefined {}) {
        const success = config.success || Ext.emptyFn, scope = config.scope || this, params = this.getLastRequest().initialConfig.params;
        this.self.load({
            scope: this,
            params: Ext.applyIf({
                refId: this.getLastItemId(),
                refMode: 'after'
            }, params),
            success(response, request) {
                this.setLastRequest(request);
                this.setLastResponse(response);
                Ext.callback(success, scope, [
                    response,
                    request
                ]);
            }
        });
    },
    /**
     * @param {Object} config
     * @param {Function} config.success
     * @param {Object} config.scope
     */
    loadPrevItems(config undefined {}) {
        const success = config.success || Ext.emptyFn, scope = config.scope || this, params = this.getLastRequest().initialConfig.params;
        this.self.load({
            scope: this,
            params: Ext.applyIf({
                refId: this.getFirstItemId(),
                refMode: 'before'
            }, params),
            success(response, request) {
                this.setLastRequest(request);
                this.setLastResponse(response);
                Ext.callback(success, scope, [
                    response,
                    request
                ]);
            }
        });
    },
    /**
     * removes all items before d-paging-separator
     * @return {undefined}
     */
    removePrevItems() {
        const separator = this.getFirstPageSeparator();
        this.getItems().each(block => {
            if (block.element.dom.previousSibling == separator)
                return false;
            if (block.isAnswerBlock)
                block.destroy();
        });
        return this.callParent([separator]);
    },
    /**
     * removes all items after d-paging-separator
     * @return {undefined}
     */
    removeNextItems() {
        const separator = this.getLastPageSeparator();
        Ext.each(this.getItems().items, block => {
            if (block.element.dom.nextSibling == separator)
                return false;
            if (block.isAnswerBlock)
                block.destroy();
        }, this, true);
        return this.callParent([separator]);
    },
    /**
     * hides/shows all components inside of this list that are static ones
     * like toolbars or some others that shouldn't be connected to displaying
     * items in the list.
     * @param {String} method valid values are: [show, hide]
     */
    changeStaticItemsDisplay(method) {
        const block = this.getBlock();
        if (method == 'hide') {
            block.headerNode.style.display = 'none';
            block.innerElement.dom.style.display = 'none';
        } else {
            block.headerNode.style.removeProperty('display');
            block.innerElement.dom.style.removeProperty('display');
        }
    },
    updateUseBodyElement: Ext.emptyFn,
    /**
     * this method is needed, as we cannot use useBodyElement == false 
     * because ST ignores it for example while adding a mask
     * @return {Number}
     */
    getLastItemId() {
        if (this.isFilteredByKey())
            return this.getLastItem().getUserInfo().id;
        return this.callParent(args);
    },
    /**
     * @return {Number}
     */
    getFirstItemId() {
        if (this.isFilteredByKey())
            return this.getFirstItem().getUserInfo().id;
        return this.callParent(args);
    },
    /**
     * @return {Ext.Element}
     */
    getScrollEl() {
        // on phones answer-list is always in the modal popup.
        if (Ext.os.is.Phone)
            return this.getBlock().getPopup().innerElement;
        return this.callParent(args);
    }
});