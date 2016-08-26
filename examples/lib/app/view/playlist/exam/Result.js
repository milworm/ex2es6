import 'Ext/Component';

Ext.define('CJ.view.playlist.exam.Result', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-playlist-exam-result',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {CJ.view.playlist.Block} block
         */
        block: null,
        /**
         * @cfg {Boolean} loading
         */
        loading: null,
        /**
         * @cfg {Number} requestId
         */
        requestId: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-playlist-exam-results',
        /**
         * @cfg {Object} data
         */
        data: null,
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class=\'d-playlist-exam-results-inner\'>', '<div class=\'d-feedback-element d-{result}\'>', '<tpl if=\'result == "success"\'>', '<div class=\'d-icon\'></div>', '<span class=\'d-message\'>{[ CJ.t(\'view-playlist-exam-result-success\') ]}</span>', '<tpl elseif=\'result == "failure"\'>', '<div class=\'d-icon\'></div>', '<span class=\'d-message\'>{[ CJ.t(\'view-playlist-exam-result-failure\') ]}</span>', '<tpl elseif=\'result == "badge"\'>', '<div class=\'d-icon\' style=\'background-image: url({badge.icon})\'></div>', '<span class=\'d-congrats-message\'>{[ CJ.t(\'view-playlist-exam-result-congrats-message\') ]}</span>', '<span class=\'d-message\'>{badge.name}</span>', '</tpl>', '<tpl if=\'result == "failure"\'>', '<div class=\'d-button d-retry-button\'>{[ CJ.t(\'view-playlist-exam-result-retry\') ]}</div>', '<tpl elseif=\'result == "badge"\'>', '<div class=\'d-button d-pin-button\'>{[ CJ.t(\'view-playlist-exam-result-pin-badge\') ]}</div>', '</tpl>', '</div>', '<div class=\'d-content-element\'>', '<div class=\'d-result\'>', '<span class=\'d-item\'>', '<span class=\'d-title\'>{[ CJ.t(\'view-playlist-exam-result-score\') ]}</span>', '<span class=\'d-number\'>{score}%</span>', '</span>', '<span class=\'d-item\'>', '<span class=\'d-title\'>{[ CJ.t(\'view-playlist-exam-result-passing-grade\') ]}</span>', '<span class=\'d-number\'>{passingGrade}%</span>', '</span>', '</div>', '<div class=\'d-answers\'>', '<tpl for=\'answers\'>', '<div class=\'d-answer-item\'>', '<span class=\'d-index\'>{[ xindex ]}</span>', '<tpl if=\'correct\'>', '<span class=\'d-status d-correct\'>', ' {[ CJ.t(\'view-playlist-exam-result-correct\') ]}', '</span>', '<tpl elseif=\'incorrect\'>', '<span class=\'d-status d-incorrect\'>', ' {[ CJ.t(\'view-playlist-exam-result-incorrect\') ]}', '</span>', '<tpl elseif=\'complete\'>', '<span class=\'d-status d-complete\'>', ' {[ CJ.t(\'view-playlist-exam-result-complete\') ]}', '</span>', '<tpl else>', '<span class=\'d-status d-incomplete\'>', ' {[ CJ.t(\'view-playlist-exam-result-incomplete\') ]}', '</span>', '</tpl>', '</div>', '</tpl>', '</div>', '</div>', '</div>')
    },
    constructor() {
        this.callParent(args);
        this.on({
            activate: this.onActivated,
            deactivate: this.onDeactivated,
            scope: this
        });
        this.element.on('tap', this.onElementTap, this);
    },
    /**
     * @param {Ext.Evented} e
     */
    onElementTap(e) {
        if (e.getTarget('.d-retry-button', 1))
            this.retryExam();
        else if (e.getTarget('.d-pin-button', 1))
            this.pinBadge();
    },
    /**
     * makes an ajax-call to remove all answers and retry the exam.
     * @return {undefined}
     */
    retryExam() {
        this.setLoading(true);
        CJ.Playlist.deleteAnswers(this.getBlock().getDocId(), {
            scope: this,
            success: this.onDeleteAnswersSuccess,
            callback: this.onDeleteAnswersCallback
        });
    },
    /**
     * @return {undefined}
     */
    onDeleteAnswersSuccess() {
        this.cleanup();
        this.getParent().retryExam();
    },
    /**
     * @return {undefined}
     */
    onDeleteAnswersCallback() {
        this.setLoading(false);
    },
    /**
     * makes an ajax-call to pin badge to user's skills tab.
     * @return {undefined}
     */
    pinBadge() {
        this.setLoading(true);
        CJ.Badge.pin(this.getBlock().getDocId(), {
            scope: this,
            callback() {
                CJ.PopupManager.hideActive();
            }
        });
    },
    /**
     * @param {Boolean} state
     * @param {Boolean} oldState
     */
    updateLoading(state, oldState) {
        this.element[state ? 'addCls' : 'removeCls']('d-loading');
    },
    /**
     * @param {Object} data
     */
    updateData(data) {
        data.result = 'success';
        if (data.score < data.passingGrade) {
            data.result = 'failure';
        } else {
            const block = this.getBlock();
            if (block.hasBadge()) {
                data.badge = block.getBadge();
                data.result = 'badge';
            }
        }
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @return {undefined}
     */
    cleanup() {
        this.element.setHtml('');
    },
    /**
     * starts loading answer results.
     * @return {undefined}
     */
    onActivated() {
        this.load();
        this.getPopup().addCls('d-exam-results-item');
    },
    /**
     * @return {CJ.core.view.Popup}
     */
    getPopup() {
        return this.getBlock().getStateContainer();
    },
    /**
     * aborts current request, so next time when user opens this item, we'll do everything from scratch.
     * @return {undefined}
     */
    onDeactivated() {
        this.getPopup().removeCls('d-exam-results-item');
        this.cleanup();
        CJ.Ajax.abort(this.getRequestId());
    },
    load() {
        this.setLoading(true);
        const request = CJ.Playlist.loadAnswers(this.getBlock().getDocId(), {
            scope: this,
            success: this.onLoadSuccess,
            callback: this.onLoadCallback
        });
        this.setRequestId(request.id);
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onLoadSuccess(response) {
        const data = response.ret.items[0];
        this.setData({
            passingGrade: this.getBlock().getPassingGrade() * 100,
            score: CJ.Utils.score(data, 2),
            answers: data.answers
        });
    },
    /**
     * @return {undefined}
     */
    onLoadCallback() {
        this.setLoading(false);
    }
});