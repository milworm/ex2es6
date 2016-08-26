import 'app/component/Scoreboard';

/**
 * Data format:
 *
 items: [{
    user: "@user1",
    date: "",
    total: 92,
    answers: [{
        id: 1,
        correct: true
    }, {
        id: 2,
        correct: false
    }]
}]
 */
Ext.define('CJ.view.map.Scoreboard', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.component.Scoreboard',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-map-scoreboard',
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.MapScoreboard',
    /**
     * @property {Object} property
     */
    statics: {
        /**
         * @param {Number} id
         * @param {Object} config
         * @return {undefined}
         */
        load(id, config) {
            CJ.request(Ext.apply({
                rpc: {
                    model: 'Map',
                    method: 'load_answer_stats',
                    id
                },
                params: {
                    offset: 0,
                    limit: this.PAGE_SIZE
                }
            }, config));
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-scoreboard d-map-scoreboard',
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class=\'d-header-1\'>', '<div class=\'d-left-toolbar\'>', '<div class=\'d-group-filter-container\'></div>', '<div class=\'d-icon-button d-download d-hidden\'></div>', '<div class=\'d-icon-button d-print d-hidden\'></div>', '</div>', '<div class=\'d-close-button\'>{[ CJ.t(\'view-course-scoreboard-scoreboard-close\') ]}</div>', '</div>', '<div class=\'d-header-2\'>{title}</div>', '<div class=\'d-content\'>', '<div class=\'d-content-inner\'>', '<div class=\'d-user-column\'>', '<div class=\'d-column-header\'>', '<div class=\'d-header-cell d-user-header-cell\'>', '<div class=\'d-cell-inner\'>', '{[ CJ.t(\'view-course-scoreboard-scoreboard-user-column\') ]}', '</div>', '</div>', '</div>', '<div class=\'d-items d-column-content\'>', '<tpl for=\'items\'>', '<div class=\'d-cell d-user-cell\'>', '<div class=\'d-cell-inner\'>', '<div class=\'d-name\'>{name}</div>', '<div class=\'d-date\'>{date}</div>', '</div>', '</div>', '</tpl>', '</div>', '</div>', '<div class=\'d-answer-column\'>', '<div class=\'d-column-header\'>', '<div class=\'d-header-cell d-total-header-cell\'>', '{[ CJ.t(\'view-course-scoreboard-scoreboard-total-column\') ]}', '</div>', '<tpl if=\'items.length &gt; 0\'>', '<tpl for=\'items[0].answers\'>', '<tpl if=\'values.class == "Playlist"\'>', '<div class=\'d-header-cell d-answer-header-cell d-playlist-answer-header-cell\' data-activity-id=\'{activityId}\'>P{playlistIndex}</div>', '<tpl else>', '<div class=\'d-header-cell d-answer-header-cell\' data-activity-id=\'{activityId}\'>Q{[ xindex ]}</div>', '</tpl>', '</tpl>', '</tpl>', '<div class=\'d-header-cell d-right-header-cell\'></div>', '</div>', '<div class=\'d-column-content\'>', '<div class=\'d-items d-column d-column-total\'>', '{content.totalColumnHtml}', '</div>', '<tpl for=\'content.answerColumnsTpl\'>', '<div class=\'d-items d-column d-section-answer-column\'>', '{.}', '</div>', '</tpl>', '<div class=\'d-items d-column d-right-column\'>', '<tpl for=\'items\'>', '<div></div>', '</tpl>', '</div>', '</div>', '</div>', '</div>', '<div class=\'d-loading d-hidden\'>', '{[ CJ.app.t(\'view-course-scoreboard-scoreboard-loading\') ]}', '</div>', '</div>', { compiled: true }),
        /**
         * @cfg {Ext.XTemplate} pageTpl
         */
        pageTpl: Ext.create('Ext.XTemplate', '<div class=\'d-items\'>', '<tpl for=\'items\'>', '<div class=\'d-cell d-user-cell\'>', '<div class=\'d-cell-inner\'>', '<div class=\'d-name\'>{name}</div>', '<div class=\'d-date\'>{date}</div>', '</div>', '</div>', '</tpl>', '</div>', '<div class=\'d-items\'>', '{content.totalColumnHtml}', '</div>', '<tpl for=\'content.answerColumnsTpl\'>', '<div class=\'d-items\'>', '{.}', '</div>', '</tpl>', '<div class=\'d-items\'>', '<tpl for=\'items\'>', '<div></div>', '</tpl>', '</div>', { compiled: true })
    },
    /**
     * @param {Array} items
     */
    renderPage(items) {
        const emptyCellTpl = this.getEmptyCellTpl(), userCellTpl = this.getUserCellTpl(), totalCellTpl = this.getTotalCellTpl(), answerCellTpl = this.getAnswerCellTpl(), userColumnTpl = [], totalColumnTpl = [], answerColumnsTpl = [];    // collect all simple rows (users, total, left, right)
        // collect all simple rows (users, total, left, right)
        for (let i = 0, count = items.length, user; user = items[i]; i++) {
            const userTotal = CJ.Utils.score(user);
            userColumnTpl.push(CJ.tpl(userCellTpl, user.name, user.date));
            totalColumnTpl.push(CJ.tpl(totalCellTpl, userTotal));
            for (let k = 0, playlistIndex = 0, answer, isPlaylist, answerCellHtml; answer = user.answers[k]; k++) {
                if (i == 0)
                    answerColumnsTpl[k] = [];
                isPlaylist = answer['class'] == 'Playlist';
                answerCellHtml = answerCellTpl.apply(this.getAnswerTplData(answer, isPlaylist));
                if (isPlaylist)
                    answer.playlistIndex = ++playlistIndex;
                answerColumnsTpl[k].push(answerCellHtml);
                if (i == count - 1)
                    answerColumnsTpl[k] = answerColumnsTpl[k].join('');
            }
        }
        return {
            usersColumnHtml: userColumnTpl.join(''),
            totalColumnHtml: totalColumnTpl.join(''),
            answerColumnsTpl
        };
    }
});