import 'app/view/block/BaseBlock';
import 'app/view/solution/SolutionUrl';
import 'app/view/block/options/Answer';
import 'app/view/block/fullscreen/AnswerPopup';

/**
 * Defines a class to show user's answer.
 */
Ext.define('CJ.view.block.AnswerBlock', {
    extend: 'CJ.view.block.BaseBlock',
    alias: 'widget.view-block-answer-block',
    /**
     * @cfg {Boolean} isAnswerBlock
     */
    isAnswerBlock: true,
    statics: {
        /**
         * @param {Object} config
         * @return {CJ.core.view.Popup}
        */
        popup(config) {
            return CJ.Block.popup(Ext.apply({
                state: 'collapsed',
                xtype: 'view-block-fullscreen-answer-popup'
            }, config || {}));
        }
    },
    config: {
        /**
         * @cfg {Numder} activityId Defines an id of question's block
         */
        activityId: null,
        /**
         * @cfg {Object} solution
         */
        solution: null,
        /**
         * @cfg {Ext.Component} solutionComponent
         */
        solutionComponent: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-block d-answer-block',
        /**
         * @cfg {Object} bottomBar
         */
        bottomBar: {},
        /**
         * @cfg {CJ.view.answers.base.Answer} answer
         */
        answer: null,
        /**
         * @cfg {Boolean} autoCheckEnabled
         */
        isAutoCheckEnabled: null,
        /**
         * @cfg {Boolean} isCorrect
         */
        isCorrect: null,
        /**
         * @cfg {Object} question
         */
        question: null,
        /**
         * @cfg {Ext.XTemplate} headerTpl
         */
        headerTpl: Ext.create('Ext.XTemplate', [
            '<a class="d-user-icon" ',
            'style="background-image: url({userInfo.icon})" ',
            'href="#!u{[ this.getOwnerHref(values) ]}" onclick="return false;"></a>',
            '<div class="d-content">',
            '<a class="d-title d-user-name" href="#!u{[ this.getOwnerHref(values) ]}" onclick="return false;">',
            '{userInfo.name}',
            '</a>',
            '<div class="d-time">',
            '<span>{[ CJ.t("block-posted-text") ]}</span> ',
            '{[ CJ.Block.formatDate(values.createdDate) ]} ',
            '<tpl if="activityId">',
            '<a class="inner-link" href="javascript:void(0)">',
            ' {[ CJ.t("block-answer-block-activity-link") ]}',
            '</a>',
            '</tpl>',
            '</div>',
            '</div>',
            '<div class="d-menubutton"></div>',
            {
                /**
                 * @param {Object} values
                 * @return {String}
                 */
                getOwnerHref(values) {
                    return CJ.Utils.urlify(`/${ values.scope.getOwnerUser() }`);
                }
            }
        ])
    },
    /**
     * @property {Object} tapListeners
     */
    tapListeners: {
        '.d-menubutton': 'onMenuButtonTap',
        '.inner-link': 'onAnswerActivityTap',
        '.d-user-icon, .d-user-name': 'onUserTap'
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onUserTap(e) {
        CJ.app.redirectTo(e.target.getAttribute('href'));
    },
    /**
     * @return {Object}
     */
    getHeaderTplData() {
        const data = this.callParent(args);
        Ext.apply(data, { activityId: this.getActivityId() });
        return data;
    },
    /**
     * @TODO it's duplicate from CJ.view.block.DefaultBlock#applyBottomBar
     * @param {Object} config
     */
    applyBottomBar(config, oldBottomBar) {
        Ext.TaskQueue.requestWrite(function () {
            if (oldBottomBar)
                oldBottomBar.destroy();
            if (!config || this.isDestroyed)
                return this._bottomBar = false;
            this._bottomBar = Ext.factory(Ext.applyIf(config, {
                parent: this,
                block: this,
                xtype: 'view-block-toolbar-light-bottom-bar'
            }));
            this._bottomBar.renderTo(this.footerNode);
        }, this);
    },
    /**
     * @inheritdoc
     */
    showOptions() {
        Ext.factory({
            xtype: 'core-view-popup',
            title: 'block-popup-options-title',
            cls: 'd-menu-popup',
            layout: 'light',
            content: {
                xtype: 'view-block-options-answer',
                block: this
            }
        });
    },
    /**
     * @return {undefined}
     */
    onAnswerActivityTap() {
        const activityId = this.getActivityId(), selector = CJ.tpl('[docId={0}][isModal]', activityId);
        if (Ext.ComponentQuery.query(selector).length)
            return CJ.History.back();
        CJ.PopupManager.hideActive();    // waiting for a popup to be closed.
        // waiting for a popup to be closed.
        Ext.defer(() => {
            CJ.History.keepPopups = true;
            CJ.app.redirectTo(`!${ activityId }`);
        }, 500);
    },
    /**
     * @param {Object} answer
     */
    applyAnswer(answer) {
        if (!answer)
            return false;
        answer = Ext.factory(Ext.applyIf(answer, { block: this }));
        if (!answer.isAutoCheckable())
            return answer;
        if (this.getIsAutoCheckEnabled()) {
            //[TODO] this case should be better implemented when this type of answer will be handeled by the server, if it will be.
            // any questions ask Andrei
            if (answer.xtype == 'view-answers-app-answer') {
                if (answer.grabValueCorrect())
                    this.addCls('d-correct');
                else
                    this.addCls('d-wrong');
                return answer;
            }
            if (this.getIsCorrect())
                this.addCls('d-correct');
            else
                this.addCls('d-wrong');
        }
        return answer;
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     * @return {undefined}
     */
    updateAnswer(newComponent, oldComponent) {
        if (oldComponent)
            oldComponent.destroy();
        if (newComponent)
            newComponent.renderTo(this.innerElement);
    },
    /**
     * @param {Object} solution
     */
    updateSolution(solution) {
        this.setSolutionComponent(solution ? solution : null);
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applySolutionComponent(config, oldComponent) {
        if (oldComponent)
            oldComponent.destroy();
        if (!config)
            return false;
        return Ext.factory({
            xtype: 'view-solution-url',
            solution: this.getSolution()
        });
    },
    /**
     * @param {Ext.Component} newComponent
     * @return {undefined}
     */
    updateSolutionComponent(newComponent) {
        this.getAnswer();
        if (newComponent)
            newComponent.renderTo(this.innerElement);
    },
    /**
     * shows answer block in a popup.
     * As we can represent an answers in different formats: answer, block.
     * we need to load block-data format and then show it.
     * @param {String} state comments or null
     */
    popup(state) {
        return CJ.Block.popup({
            xtype: 'view-block-fullscreen-answer-popup',
            state: state || 'collapsed',
            blockId: this.getDocId()
        });
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setSolutionComponent(null);
    }
});