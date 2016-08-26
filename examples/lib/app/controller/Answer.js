import 'Ext/app/Controller';

/**
 * Manages everything related to answers in the whole app.
 */
Ext.define('CJ.controller.Answer', {
    extend: 'Ext.app.Controller',
    config: {
        control: {
            'view-playlist-block': { answerstap: 'onPlaylistBlockAnswersButtonTap' },
            'view-course-block-block': { answerstap: 'onCourseBlockAnswersButtonTap' },
            'view-map-block': { answerstap: 'onMapBlockAnswersButtonTap' },
            'view-block-default-block': {
                answerstap: 'onDefaultBlockAnswersButtonTap',
                answerdelete: 'onAnswerDelete',
                answeraftersave: 'onAnswerAfterSave',
                solutionaftersave: 'onSolutionAfterSave'
            },
            'view-answers-answers-list view-block-answer-block': { deleted: 'onAnswerListAnswerDeleted' },
            'view-block-answer-block[isModal]': { deleted: 'onModalAnswerDeleted' }
        }
    },
    /**
     * @cjminify
     * method will be called when user taps on answers button of a block. Shows block in a popup with answers tab 
     * opened.
     * @param {CJ.view.block.BaseBlock} block
     */
    onDefaultBlockAnswersButtonTap(block) {
        const url = CJ.tpl('!m/{0}/a', block.getDocId());
        if (block.getIsModal()) {
            CJ.History.replaceState(url);
            block.getPopup().setState('answers');
        } else {
            CJ.History.keepPopups = true;
            CJ.app.redirectTo(url);
        }
    },
    /**
     * @cjminify
     * method will be called when user taps on answers button of course block
     * block.
     * @param {CJ.view.block.BaseBlock} block
     */
    onCourseBlockAnswersButtonTap(block) {
        CJ.CourseScoreboard.popup({ block });
    },
    /**
     * @cjminify
     * method will be called when user taps on answers button of course block
     * block.
     * @param {CJ.view.map.Block} block
     */
    onMapBlockAnswersButtonTap(block) {
        if (!CJ.User.isMine(block) && !CJ.User.isFgaTeacher())
            return;
        CJ.MapScoreboard.popup({ block });
    },
    /**
     * @cjminify
     * method will be called when user deletes a block from an answer-list.
     * @param {CJ.view.block.AnswerBlock} answer
     */
    onAnswerListAnswerDeleted(answer) {
        const block = answer.getParent().getBlock(), answerId = answer.getDocId();
        block.getQuestion().onAnswerDelete(answerId);
    },
    /**
     * @cjminify
     * method will be called when user deletes an answer directly from a 
     * question-block.
     * @param {CJ.view.question.Question} question
     * @param {Number} count
     * @param {Number} answerId
     * @return {CJ.view.question.Question} question
     */
    onAnswerDelete(question, count, answerId) {
        const block = question.getBlock();
        if (block.locked)
            return;
        const selector = CJ.tpl('[docId={0}]', block.getDocId()), activities = Ext.ComponentQuery.query(selector);
        for (let i = 0, activity; activity = activities[i]; i++) {
            if (activity == block)
                continue;
            var question = activity.getQuestion();
            activity.locked = true;
            question.onAnswerDelete(answerId);
            activity.locked = false;
        }
    },
    /**
     * @cjminify
     * method will be called when answer is saved.
     * @return {CJ.view.block.BaseBlock} block
     * @return {CJ.view.question.Question} question
     * @return {Object} response
     */
    onAnswerAfterSave(block, question, response) {
        if (block.locked)
            return;
        const selector = CJ.tpl('[docId={0}]', block.getDocId()), items = Ext.ComponentQuery.query(selector);
        for (let i = 0, item; item = items[i]; i++) {
            if (item == block)
                continue;
            item.locked = true;
            item.setIsOriginal(false);
            item.getQuestion().getAnswerType().onSaveSuccess({ ret: response });
            item.locked = false;
            item.setIsOriginal(true);
        }
    },
    /**
     * @cjminify
     * method will be called when solution is saved.
     * @param {CJ.view.block.BaseBlock} block
     * @param {CJ.view.question.Question} question
     * @param {Object} value
     * @return {Object} response
     */
    onSolutionAfterSave(block, question, value) {
        if (block.locked)
            return;
        const selector = CJ.tpl('[docId={0}]', block.getDocId());
        const items = Ext.ComponentQuery.query(selector);
        let solution;
        for (let i = 0, item; item = items[i]; i++) {
            if (item == block)
                continue;
            item.locked = true;
            item.setIsOriginal(false);
            item.getQuestion().getSolution().setValue(value);
            item.locked = false;
            item.setIsOriginal(true);
        }
    },
    /**
     * @cjminify
     * method will be called when user deletes an answer which was opened
     * in a modal popup.
     * @param {CJ.view.block.AnswerBlock} block
     */
    onModalAnswerDeleted(block) {
        if (block.locked)
            return;
        const selector = CJ.tpl('[docId={0}]', block.getActivityId()), items = Ext.ComponentQuery.query(selector), answerId = block.getDocId();
        for (let i = 0, item; item = items[i]; i++) {
            item.locked = true;
            item.getQuestion().onAnswerDelete(answerId);
            item.locked = false;
        }
        block.getPopup().hide();
    },
    /**
     * @cjminify
     * @return {undefined}
     */
    onPlaylistBlockAnswersButtonTap(block) {
        if (!CJ.User.isMine(block) && !CJ.User.isFgaTeacher())
            return;
        CJ.PlaylistScoreboard.popup({ block });
    }
});